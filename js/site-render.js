/* =========================================================
   SITE RENDER
   Single consolidated renderer for the one-page site: hero
   status row, stats, highlights, expertise (master-detail),
   selected work (case-study cards), experience (master-detail),
   and the contact/closing-CTA links. Replaces the old
   home-render.js / about-render.js / portfolio.js / services.js
   / achievements.js / contact-render.js from the multi-page site.
   ========================================================= */

(() => {
  if (!window.SSContent) return;

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  /* wraps quantified proof points (40%, 80%+, sub-200ms, 1,000+,
     "zero critical ... failures") in a highlighted <strong> span so
     recruiters skimming bullet text catch the numbers immediately */
  function highlightStats(text) {
    const escaped = escapeHTML(text);
    return escaped.replace(
      /(\d[\d,]*\.?\d*(?:%|\+|ms|fps)\b)|(\bzero\b[^.]{0,45}?failures?\b)/gi,
      (m) => `<strong class="stat-highlight">${m}</strong>`
    );
  }

  function tagPills(tags) {
    if (!tags || !tags.length) return '';
    return `<div class="tag-pills">${tags.map((t) => `<span class="tag-pill">${escapeHTML(t)}</span>`).join('')}</div>`;
  }

  /* ---------- Generic master-detail (Expertise / Experience) ---------- */
  function renderMasterDetail(navEl, stageEl, items, renderNavBtn, renderStage) {
    if (!navEl || !stageEl || !items || !items.length) return;
    navEl.innerHTML = items.map((item, i) => `
      <button type="button" class="md-nav-btn" role="tab" data-index="${i}">${renderNavBtn(item, i)}</button>
    `).join('');
    const buttons = Array.from(navEl.querySelectorAll('.md-nav-btn'));
    function select(i) {
      buttons.forEach((b, bi) => b.classList.toggle('is-active', bi === i));
      stageEl.innerHTML = renderStage(items[i], i);
    }
    buttons.forEach((btn, i) => btn.addEventListener('click', () => select(i)));
    select(0);
  }

  function render() {
    const content = window.SSContent.get();

    /* ---- Hero ---- */
    const eyebrowEl = document.getElementById('heroEyebrow');
    const firstEl = document.getElementById('heroFirstName');
    const lastEl = document.getElementById('heroLastName');
    const taglineEl = document.getElementById('heroTagline');
    const photoEl = document.getElementById('heroPhoto');
    if (eyebrowEl) eyebrowEl.textContent = content.hero.eyebrow;
    if (firstEl) firstEl.textContent = content.hero.firstName;
    if (lastEl) lastEl.textContent = content.hero.lastName;
    if (taglineEl) taglineEl.textContent = content.hero.tagline;
    if (photoEl && content.hero.photo) {
      photoEl.innerHTML = `<img src="${content.hero.photo}" alt="Photo of ${escapeHTML(content.hero.firstName)} ${escapeHTML(content.hero.lastName)}" style="width:100%;height:100%;object-fit:cover;">`;
    }

    const locationEl = document.getElementById('heroLocation');
    if (locationEl) locationEl.textContent = (content.about.quickFacts && content.about.quickFacts.location) || 'India';

    const availChip = document.getElementById('heroAvailabilityChip');
    const availLabel = document.getElementById('heroAvailabilityLabel');
    if (availChip) {
      if (content.hero.availableForWork) {
        availChip.hidden = false;
        if (availLabel) availLabel.textContent = content.hero.availabilityLabel || 'Open to Work';
      } else {
        availChip.hidden = true;
      }
    }

    /* ---- Stats ---- */
    const statItemsEls = document.querySelectorAll('.stats-inner .stat-item');
    if (statItemsEls.length && content.stats) {
      content.stats.forEach((stat, i) => {
        const el = statItemsEls[i];
        if (!el) return;
        el.dataset.count = stat.value;
        el.dataset.suffix = stat.suffix;
        el.dataset.decimal = stat.decimals;
        const suffixEl = el.querySelector('.stat-suffix');
        const labelEl = el.querySelector('.stat-label');
        if (suffixEl) suffixEl.textContent = stat.suffix;
        if (labelEl) labelEl.textContent = stat.label;
        const valueEl = el.querySelector('.stat-value');
        if (valueEl && !el.dataset.counted) valueEl.textContent = '0';
      });
    }

    /* ---- Highlights ---- */
    const highlightsGrid = document.getElementById('highlightsGrid');
    if (highlightsGrid) {
      highlightsGrid.innerHTML = (content.highlights || []).map((h, i) => `
        <div class="highlight-card reveal" style="--reveal-delay:${i * 0.08}s">
          <div class="highlight-icon" aria-hidden="true">${window.SSContent.ICONS[h.icon] || window.SSContent.ICONS.star}</div>
          <div class="highlight-stat">${escapeHTML(h.stat)}</div>
          <h3>${escapeHTML(h.title)}</h3>
          <p>${escapeHTML(h.description)}</p>
        </div>
      `).join('');
      if (window.SSReveal) window.SSReveal.init();
    }

    /* ---- Expertise (master-detail) ---- */
    renderMasterDetail(
      document.getElementById('expertiseNav'),
      document.getElementById('expertiseStage'),
      content.expertise || [],
      (item) => `
        <span class="md-nav-btn-title">${escapeHTML(item.title)}</span>
        <span class="md-nav-btn-sub">${escapeHTML((item.tags || [])[0] || '')}</span>
      `,
      (item) => `
        <h3>${escapeHTML(item.title)}</h3>
        <p class="md-stage-desc">${escapeHTML(item.description)}</p>
        ${tagPills(item.tags)}
        ${item.inPractice ? `<div class="md-stage-note" style="margin-top:1.4rem;"><strong>In practice —</strong> ${highlightStats(item.inPractice)}</div>` : ''}
      `
    );

    /* ---- Selected Work (case-study cards) ---- */
    const workGrid = document.getElementById('workGrid');
    if (workGrid) {
      workGrid.innerHTML = (content.portfolio || []).map((project, i) => {
        const thumb = project.thumbnail
          ? `<img src="${project.thumbnail}" alt="${escapeHTML(project.title)} thumbnail" loading="lazy">`
          : window.SSContent.tileSVG(project.accent || 'var(--color-orange)');
        const categoryLabel = window.SSContent.CATEGORY_LABELS[project.category] || project.category;
        const links = [];
        if (project.playStoreUrl) links.push(`<a class="work-card-link" href="${project.playStoreUrl}" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 3l18 9-18 9V3z"/></svg>Live</a>`);
        if (project.githubUrl) links.push(`<a class="work-card-link" href="${project.githubUrl}" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/></svg>Source</a>`);
        return `
          <article class="work-card reveal" style="--card-accent:${project.accent || 'var(--color-orange)'}; --reveal-delay:${i * 0.06}s">
            <div class="work-card-media">${thumb}</div>
            <div class="work-card-body">
              <span class="work-card-tag">${escapeHTML(categoryLabel)}</span>
              <h3>${escapeHTML(project.title)}</h3>
              <p class="work-card-hook">${escapeHTML(project.description)}</p>
              ${tagPills(project.techStack)}
              ${links.length ? `<div class="work-card-links">${links.join('')}</div>` : ''}
              ${project.caseStudy ? `<details class="work-behind"><summary>Behind the build</summary><p>${escapeHTML(project.caseStudy)}</p></details>` : ''}
            </div>
          </article>
        `;
      }).join('');
      if (window.SSReveal) window.SSReveal.init();
    }

    /* ---- Experience (master-detail) ---- */
    renderMasterDetail(
      document.getElementById('experienceNav'),
      document.getElementById('experienceStage'),
      content.about.experience || [],
      (item) => `
        <span class="md-nav-btn-title">${escapeHTML(item.company)}</span>
        <span class="md-nav-btn-sub">${escapeHTML(item.period)}</span>
      `,
      (item) => `
        ${/present/i.test(item.period) ? '<span class="md-badge-current">Current Role</span>' : ''}
        <h3>${escapeHTML(item.role)} — ${escapeHTML(item.company)}</h3>
        <p class="md-stage-sub">${escapeHTML(item.period)}</p>
        ${item.intro ? `<p class="md-stage-desc">${escapeHTML(item.intro)}</p>` : ''}
        <ul class="md-stage-bullets">${(item.bullets || []).map((b) => `<li>${highlightStats(b)}</li>`).join('')}</ul>
        ${tagPills(item.tags)}
      `
    );

    /* ---- Contact / Closing CTA links ---- */
    const introEl = document.getElementById('contactIntroText');
    if (introEl) introEl.textContent = content.contact.intro;

    const emailHref = 'mailto:' + content.contact.email;
    const emailLink = document.getElementById('contactEmailLink');
    const emailText = document.getElementById('contactEmailText');
    if (emailLink) emailLink.href = emailHref;
    if (emailText) emailText.textContent = content.contact.email;
    const emailCta = document.getElementById('contactEmailLinkCta');
    if (emailCta) emailCta.href = emailHref;

    const waDigits = (content.contact.whatsapp || '').replace(/[^\d]/g, '');
    const waLink = document.getElementById('contactWhatsappLink');
    const waText = document.getElementById('contactWhatsappText');
    if (waLink) waLink.href = 'https://wa.me/' + waDigits;
    if (waText) waText.textContent = content.contact.whatsapp;

    const availText = document.getElementById('contactAvailabilityText');
    if (availText) availText.textContent = content.contact.availability;

    const linkedinCta = document.getElementById('contactLinkedinLinkCta');
    if (linkedinCta) linkedinCta.href = content.contact.linkedin;
    const githubCta = document.getElementById('contactGithubLinkCta');
    if (githubCta) githubCta.href = content.contact.github;

    if (window.SSReveal) window.SSReveal.init();
  }

  /* ---- Live clock (renders in the site owner's own timezone,
     independent of the visitor's local time) ---- */
  function updateClock() {
    const el = document.getElementById('heroClock');
    if (!el) return;
    const tz = (window.SSContent.get().hero.timezone) || 'Asia/Kolkata';
    try {
      el.textContent = new Date().toLocaleTimeString('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
      el.textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
  }
  updateClock();
  setInterval(updateClock, 1000);

  render();
  window.SSContent.onChange(render);
})();
