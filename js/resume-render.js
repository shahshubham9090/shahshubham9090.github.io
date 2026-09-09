/* =========================================================
   RESUME PAGE RENDER JS
   Builds the resume entirely from the shared content store, so
   editing About/Experience/Portfolio in the Admin Panel keeps
   the resume in sync automatically — no PDF file to maintain.
   ========================================================= */

(() => {
  if (!window.SSContent) return;

  // Projects to surface on the resume, and in this order (by portfolio id).
  const RESUME_PROJECT_IDS = ['thebidnow', 'collect', 'amulya-mica'];

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function iconSpan(pathD) {
    return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="${pathD}" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  function render() {
    const content = window.SSContent.get();
    const hero = content.hero || {};
    const about = content.about || {};
    const contact = content.contact || {};

    const fullName = `${hero.firstName || ''} ${hero.lastName || ''}`.trim() || 'Shubham Shah';
    document.title = `Resume — ${fullName}`;

    const nameEl = document.getElementById('rName');
    const roleEl = document.getElementById('rRole');
    if (nameEl) nameEl.textContent = fullName;
    if (roleEl) roleEl.textContent = hero.eyebrow || '';

    const emailEl = document.getElementById('rEmail');
    const phoneEl = document.getElementById('rPhone');
    const locationEl = document.getElementById('rLocation');
    const linkedinEl = document.getElementById('rLinkedin');
    const githubEl = document.getElementById('rGithub');
    const availabilityEl = document.getElementById('rAvailability');

    if (emailEl) {
      emailEl.innerHTML = contact.email
        ? `${iconSpan('M2 4h20v16H2V4zm2 2v.4l8 5.6 8-5.6V6H4z')}<a href="mailto:${escapeHTML(contact.email)}">${escapeHTML(contact.email)}</a>`
        : '';
    }
    if (phoneEl) {
      phoneEl.innerHTML = contact.whatsapp
        ? `${iconSpan('M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.4 2.1L8.1 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.9 2.2z')}<span>${escapeHTML(contact.whatsapp)}</span>`
        : '';
    }
    if (locationEl) {
      const loc = about.quickFacts && about.quickFacts.location;
      locationEl.innerHTML = loc
        ? `${iconSpan('M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z')}<span>${escapeHTML(loc)}</span>`
        : '';
    }
    if (linkedinEl) {
      linkedinEl.innerHTML = contact.linkedin
        ? `${iconSpan('M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4z')}<a href="${escapeHTML(contact.linkedin)}" target="_blank" rel="noopener noreferrer">${escapeHTML(contact.linkedin.replace(/^https?:\/\//, ''))}</a>`
        : '';
    }
    if (githubEl) {
      githubEl.innerHTML = contact.github
        ? `${iconSpan('M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2-.2 4.5-1 4.5-4.5a3.5 3.5 0 0 0-1-2.5c.1-.2.5-1.5-.1-3.3 0 0-1-.3-3.4 1.3a11.5 11.5 0 0 0-6 0C6.1 3.9 5.1 4.2 5.1 4.2c-.6 1.7-.2 3-.1 3.3A3.5 3.5 0 0 0 4 10c0 3.5 2.5 4.3 4.5 4.5-.3.3-.5.7-.5 1.4V19')}<a href="${escapeHTML(contact.github)}" target="_blank" rel="noopener noreferrer">${escapeHTML(contact.github.replace(/^https?:\/\//, ''))}</a>`
        : '';
    }
    if (availabilityEl) availabilityEl.textContent = contact.availability || '';

    const summaryEl = document.getElementById('rSummary');
    if (summaryEl) summaryEl.textContent = about.resumeSummary || about.mission || '';

    const skillsTableEl = document.getElementById('rSkillsTable');
    if (skillsTableEl && Array.isArray(about.technicalSkills)) {
      skillsTableEl.innerHTML = about.technicalSkills.map((row) => `
        <tr>
          <th>${escapeHTML(row.category)}</th>
          <td>${escapeHTML(row.items)}</td>
        </tr>
      `).join('');
    }

    const expEl = document.getElementById('rExperience');
    if (expEl && Array.isArray(about.experience)) {
      expEl.innerHTML = about.experience.map((job) => `
        <div class="r-item">
          <div class="r-item-head">
            <h3>${escapeHTML(job.role)} <span>— ${escapeHTML(job.company)}</span></h3>
            <span class="r-period">${escapeHTML(job.period)}</span>
          </div>
          ${job.intro ? `<p class="r-item-intro">${escapeHTML(job.intro)}</p>` : ''}
          ${Array.isArray(job.bullets) ? `<ul>${job.bullets.map((b) => `<li>${escapeHTML(b)}</li>`).join('')}</ul>` : ''}
        </div>
      `).join('');
    }

    const projectsEl = document.getElementById('rProjects');
    if (projectsEl && Array.isArray(content.portfolio)) {
      const byId = {};
      content.portfolio.forEach((p) => { byId[p.id] = p; });
      const selected = RESUME_PROJECT_IDS.map((id) => byId[id]).filter(Boolean);
      const categoryLabels = window.SSContent.CATEGORY_LABELS || {};
      projectsEl.innerHTML = selected.map((p) => `
        <div class="r-item">
          <div class="r-item-head">
            <h3>${escapeHTML(p.title)} <span>— ${escapeHTML(categoryLabels[p.category] || p.category)}</span></h3>
          </div>
          <p>${escapeHTML(p.description)}</p>
        </div>
      `).join('');
    }
  }

  render();
  window.SSContent.onChange(render);

  const downloadBtn = document.getElementById('downloadResumeBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => window.print());
  }
})();
