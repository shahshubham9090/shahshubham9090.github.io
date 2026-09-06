# Shubham Shah — Portfolio Website

A static portfolio site (plain HTML/CSS/JS, no build step) with a built-in
Admin Panel for editing content, and a serverless API for persistent image
uploads.

## Live site

- **Main site:** https://shahshubham9090.github.io/
- **Admin Panel:** https://shahshubham9090.github.io/admin.html

The Admin Panel is not a separate app — it's just another page (`admin.html`)
in the same project. There's nothing extra to deploy or run for it; wherever
the main site is hosted, the Admin Panel is automatically available at
`/admin.html` on that same domain.

## Running it locally

There's no build step — it's plain HTML/CSS/JS. You just need *some* local
static file server (opening the `.html` files directly with `file://` mostly
works, but `localStorage` behaves inconsistently across `file://` pages, so a
real server is recommended).

From the project folder:

```bash
npx serve -l 8420 .
```

Then open in your browser:

- Main site: `http://localhost:8420/index.html`
- Admin Panel: `http://localhost:8420/admin.html`

**Important:** always open both through the same server/origin
(`http://localhost:8420/...`). Don't mix `http://localhost:8420` with a
double-clicked `file://` page, and don't check them in different browsers —
content is stored in the browser's `localStorage`, which is scoped per
*origin* (and per browser/profile), not shared across them.

## Admin Panel login

Default credentials (changeable from **Admin Account** inside the panel
itself):

- **Username:** `shubham2413`
- **Password:** `@shubham2413@`

This is a lightweight client-side gate meant to keep casual visitors out —
it is not real server-side authentication (there's no server to authenticate
against). Don't rely on it to protect sensitive data.

## How content editing works

All editable content (hero text, About story, Services, Portfolio projects,
Achievements, Contact info, footer text, color theme) lives in one JSON blob
managed by `js/content-store.js`, persisted to the browser's `localStorage`
under the key `ss_portfolio_content_v1`. Every public page reads from it;
the Admin Panel writes to it.

Because it's `localStorage`, edits made in the Admin Panel only apply to
**that specific browser**. A different browser, device, or incognito window
still sees the defaults baked into `content-store.js` until:

- that browser's own Admin Panel is used to make the same edit, or
- the defaults in `js/content-store.js` are updated directly in the code
  and redeployed (this is how "permanent" content changes — like the
  homepage photo — actually get shipped to every visitor).

Use **Website Settings → Download Backup** in the Admin Panel to export the
current content as JSON, and **Restore from Backup** to re-import it (useful
for moving edits between browsers, or as a safety net before big changes).

## Image uploads (GitHub-backed)

Photo/thumbnail uploads in the Admin Panel go through `api/upload-image.js`,
a serverless function that commits the image straight to this GitHub repo
(via the GitHub Contents API) and returns a public
`raw.githubusercontent.com` URL — so an uploaded image is visible to every
visitor, not just the browser that uploaded it.

**This function needs a host that can run server code** (GitHub Pages can't
— it only serves static files). It's set up to deploy on **Vercel**, which
serves the same static site *and* runs the `/api` function from one project.

Required environment variables (set in the hosting provider's dashboard —
see `.env.example` for the full list, never commit real values):

- `GITHUB_TOKEN` — a fine-grained GitHub PAT scoped to this repo only,
  with **Contents: Read and write** permission
- `GITHUB_OWNER` — `shahshubham9090`
- `GITHUB_REPOSITORY` — `shahshubham9090.github.io`
- `GITHUB_BRANCH` — `main`

Until that's deployed and configured, image uploads in the Admin Panel will
show a "not configured" error — everything else in the Admin Panel works
regardless.

## Color themes

`js/theme-store.js` defines several complete color themes (Sunset, Emerald
Dusk, Crimson Slate, Violet Copper, Midnight). The live site currently
defaults to **Midnight** (dark). Switch it anytime from the Admin Panel's
**Color Themes** panel — it applies instantly across the whole site.

The Admin Panel itself always renders in the light **Sunset** theme
regardless of what the public site is set to, so editing stays easy to read.

## Project structure

```
index.html, about.html, services.html,        Public pages
portfolio.html, achievements.html, contact.html
admin.html                                    Admin Panel (same site, /admin.html)
css/                                          One stylesheet per page + shared styles.css
js/
  content-store.js                            Shared content (localStorage-backed)
  theme-store.js                               Color theme definitions + switcher
  main.js                                      Shared behavior (nav, animations, footer sync)
  *-render.js                                  Per-page: render content-store data into the DOM
  admin.js, admin-auth.js                       Admin Panel logic + login gate
api/
  upload-image.js                              Serverless function: GitHub-backed image upload/delete
assets/                                        Static images (e.g. homeprofilepic.jpg)
```

## Deploying changes

Push to `main` on GitHub — GitHub Pages rebuilds the static site automatically
(usually live within ~30–60 seconds). If a Vercel deployment is also
connected to this repo, it redeploys on the same push, picking up any
`api/` changes too.
