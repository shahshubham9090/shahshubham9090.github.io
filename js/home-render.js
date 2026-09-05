/* =========================================================
   HOME PAGE RENDER JS
   Populates hero, stats, services teaser, and featured work
   from the shared content store.
   ========================================================= */

(() => {
  if (!window.SSContent) return;

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  const statItemsEls = document.querySelectorAll('.stats-inner .stat-item');
  const servicesGrid = document.getElementById('homeServicesGrid');
  const workGrid = document.getElementById('homeWorkGrid');

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

    /* ---- Stats ---- */
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
        // reset counter display so it re-animates correctly if already revealed
        const valueEl = el.querySelector('.stat-value');
        if (valueEl && !el.dataset.counted) valueEl.textContent = '0';
      });
    }

    /* ---- Services teaser (mirrors the master Services list) ---- */
    if (servicesGrid) {
      servicesGrid.innerHTML = '';
      (content.services || []).slice(0, 4).forEach((svc, i) => {
        const card = document.createElement('div');
        card.className = 'service-card reveal';
        card.style.setProperty('--reveal-delay', `${i * 0.08}s`);
        card.style.setProperty('--card-accent', i % 2 === 0 ? 'var(--color-orange)' : 'var(--color-blue)');
        const iconSVG = window.SSContent.ICONS[svc.icon] || window.SSContent.ICONS.star;
        card.innerHTML = `
          <div class="service-icon" aria-hidden="true">${iconSVG}</div>
          <h3>${escapeHTML(svc.title)}</h3>
          <p>${escapeHTML(svc.description)}</p>
        `;
        servicesGrid.appendChild(card);
      });
    }

    /* ---- Featured work (first 3 portfolio projects) ---- */
    if (workGrid) {
      workGrid.innerHTML = '';
      (content.portfolio || []).slice(0, 3).forEach((project, i) => {
        const a = document.createElement('a');
        a.href = 'portfolio.html';
        a.className = 'work-item reveal';
        a.style.setProperty('--reveal-delay', `${i * 0.1}s`);
        a.style.setProperty('--card-accent', window.SSContent.accentForIndex(i));
        const thumb = project.thumbnail
          ? `<img src="${project.thumbnail}" alt="${escapeHTML(project.title)} thumbnail" loading="lazy">`
          : window.SSContent.tileSVG(window.SSContent.accentForIndex(i));
        const categoryLabel = window.SSContent.CATEGORY_LABELS[project.category] || project.category;
        a.innerHTML = `
          <div class="work-thumb">${thumb}</div>
          <div class="work-meta">
            <h3>${escapeHTML(project.title)}</h3>
            <span>${escapeHTML(categoryLabel)}</span>
          </div>
        `;
        workGrid.appendChild(a);
      });
    }

    if (window.SSReveal) window.SSReveal.init();
  }

  render();
  window.SSContent.onChange(render);
})();
