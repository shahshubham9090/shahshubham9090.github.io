/* =========================================================
   /api/upload-image
   Vercel serverless function (Node.js runtime).

   POST   { dataUrl, slot, projectId } -> { ok, url, path }
   DELETE { path }                     -> { ok }

   Holds the GitHub token server-side only (env vars) and commits
   uploaded images to the configured GitHub repo via the Contents
   API, returning a public raw.githubusercontent.com URL. This is
   what makes an uploaded image visible to every visitor, not just
   the browser that uploaded it.
   ========================================================= */

const ALLOWED_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

// GitHub's Contents API (base64 JSON body) is only reliable for files
// well under its ~1MB soft limit - client-side compression keeps real
// uploads far smaller than this, so this is just a safety ceiling.
const MAX_DECODED_BYTES = 2 * 1024 * 1024;

function folderForSlot(slot) {
  if (slot === 'hero' || slot === 'about') return 'assets/uploads/portfolio/profile';
  if (slot === 'project') return 'assets/uploads/portfolio/projects';
  return null;
}

function randomId() {
  return Math.random().toString(36).slice(2, 8);
}

function sendJSON(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json').end(JSON.stringify(body));
}

function ghHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
    'User-Agent': 'portfolio-admin-upload',
  };
}

module.exports = async (req, res) => {
  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPOSITORY, GITHUB_BRANCH } = process.env;
  const branch = GITHUB_BRANCH || 'main';

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPOSITORY) {
    console.error('upload-image: missing GITHUB_TOKEN/GITHUB_OWNER/GITHUB_REPOSITORY env vars');
    sendJSON(res, 500, { ok: false, error: 'Image uploads are not configured on the server yet.' });
    return;
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};

  try {
    if (req.method === 'POST') {
      const { dataUrl, slot, projectId } = body;

      if (!dataUrl || typeof dataUrl !== 'string') {
        sendJSON(res, 400, { ok: false, error: 'No image was provided.' });
        return;
      }
      const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
      if (!match) {
        sendJSON(res, 400, { ok: false, error: 'Unsupported image format.' });
        return;
      }
      const ext = ALLOWED_TYPES[match[1]];
      if (!ext) {
        sendJSON(res, 400, { ok: false, error: 'Only JPG, PNG, or WEBP images are supported.' });
        return;
      }
      const base64 = match[2];
      const decodedSize = Math.ceil((base64.length * 3) / 4);
      if (decodedSize > MAX_DECODED_BYTES) {
        sendJSON(res, 400, { ok: false, error: 'Image is too large after compression. Please use a smaller image.' });
        return;
      }
      const folder = folderForSlot(slot);
      if (!folder) {
        sendJSON(res, 400, { ok: false, error: 'Unknown upload type.' });
        return;
      }

      const safeProjectId = projectId ? String(projectId).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) : '';
      const filename = `${slot}${safeProjectId ? '-' + safeProjectId : ''}-${Date.now()}-${randomId()}.${ext}`;
      const path = `${folder}/${filename}`;

      const ghRes = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPOSITORY}/contents/${path}`,
        {
          method: 'PUT',
          headers: ghHeaders(GITHUB_TOKEN),
          body: JSON.stringify({ message: `Upload image: ${path}`, content: base64, branch }),
        }
      );

      if (!ghRes.ok) {
        const errText = await ghRes.text().catch(() => '');
        console.error('upload-image: GitHub create failed', ghRes.status, errText);
        sendJSON(res, 502, { ok: false, error: 'Failed to upload image. Please try again.' });
        return;
      }

      const url = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPOSITORY}/${branch}/${path}`;
      sendJSON(res, 200, { ok: true, url, path });
      return;
    }

    if (req.method === 'DELETE') {
      const { path } = body;
      if (!path || typeof path !== 'string' || !path.startsWith('assets/uploads/portfolio/')) {
        sendJSON(res, 400, { ok: false, error: 'Invalid file reference.' });
        return;
      }

      const getRes = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPOSITORY}/contents/${path}?ref=${encodeURIComponent(branch)}`,
        { headers: ghHeaders(GITHUB_TOKEN) }
      );
      if (!getRes.ok) {
        // Already gone or never existed - deletion is idempotent.
        sendJSON(res, 200, { ok: true });
        return;
      }
      const fileInfo = await getRes.json();

      const delRes = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPOSITORY}/contents/${path}`,
        {
          method: 'DELETE',
          headers: ghHeaders(GITHUB_TOKEN),
          body: JSON.stringify({ message: `Delete image: ${path}`, sha: fileInfo.sha, branch }),
        }
      );

      if (!delRes.ok) {
        const errText = await delRes.text().catch(() => '');
        console.error('upload-image: GitHub delete failed', delRes.status, errText);
        sendJSON(res, 502, { ok: false, error: 'Failed to delete the previous image.' });
        return;
      }

      sendJSON(res, 200, { ok: true });
      return;
    }

    sendJSON(res, 405, { ok: false, error: 'Method not allowed.' });
  } catch (e) {
    console.error('upload-image: unexpected error', e);
    sendJSON(res, 500, { ok: false, error: 'Something went wrong. Please try again.' });
  }
};
