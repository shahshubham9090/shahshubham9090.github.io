/* =========================================================
   PORTFOLIO PAGE JS
   Renders project cards from the content store + filter tabs
   + scroll reveal + lightbox.
   ========================================================= */

(() => {
  const CATEGORIES = [
    { key: 'all',    label: 'All Work' },
    { key: 'mobile', label: 'Mobile App Development' },
    { key: 'design', label: 'UI/UX & App Design' },
    { key: 'api',    label: 'API Integration & Development' },
  ];

  const tabsEl = document.getElementById('filterTabs');
  const gridEl = document.getElementById('projectGrid');
  if (!tabsEl || !gridEl || !window.SSContent) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activeCategory = 'all';
  let revealObserver = null;
  let projectsCache = [];

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function thumbMarkup(project, index) {
    if (project.thumbnail) {
      return `<img src="${project.thumbnail}" alt="${escapeHTML(project.title)} thumbnail" loading="lazy">`;
    }
    return window.SSContent.tileSVG(window.SSContent.accentForIndex(index));
  }

  /* ---------- Tabs (built once) ---------- */
  let indicator = tabsEl.querySelector('.filter-tab-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.className = 'filter-tab-indicator';
    tabsEl.appendChild(indicator);
  }
  if (!tabsEl.dataset.built) {
    CATEGORIES.forEach((cat) => {
      const btn = document.createElement('button');
      btn.className = 'filter-tab' + (cat.key === activeCategory ? ' is-active' : '');
      btn.type = 'button';
      btn.textContent = cat.label;
      btn.dataset.category = cat.key;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', cat.key === activeCategory ? 'true' : 'false');
      btn.addEventListener('click', () => setActiveCategory(cat.key));
      tabsEl.appendChild(btn);
    });
    tabsEl.dataset.built = 'true';
  }

  function moveIndicator() {
    const activeBtn = tabsEl.querySelector('.filter-tab.is-active');
    if (!activeBtn) return;
    indicator.style.width = activeBtn.offsetWidth + 'px';
    indicator.style.transform = `translateX(${activeBtn.offsetLeft - 2}px)`;
  }

  /* ---------- Render project cards from content store ---------- */
  function render() {
    const content = window.SSContent.get();
    projectsCache = content.portfolio || [];

    gridEl.innerHTML = '';

    projectsCache.forEach((project, i) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'project-card';
      card.dataset.category = project.category;
      card.style.setProperty('--card-accent', window.SSContent.accentForIndex(i));
      card.setAttribute('aria-label', `Open case study: ${project.title}`);

      const categoryLabel = window.SSContent.CATEGORY_LABELS[project.category] || project.category;

      card.innerHTML = `
        <div class="card-thumb-wrap">
          ${thumbMarkup(project, i)}
          <div class="card-glow" aria-hidden="true"></div>
        </div>
        <div class="card-meta">
          <span class="card-tag">${escapeHTML(categoryLabel)}</span>
          <h3>${escapeHTML(project.title)}</h3>
          <p>${escapeHTML(project.description)}</p>
        </div>
      `;
      card.addEventListener('click', () => openLightbox(project, i));
      gridEl.appendChild(card);
    });

    applyFilter(activeCategory, true);
    setupReveal();
    window.requestAnimationFrame(moveIndicator);
  }

  function getCardEls() {
    return Array.from(gridEl.querySelectorAll('.project-card'));
  }

  /* ---------- Scroll reveal ---------- */
  function setupReveal() {
    const cardEls = getCardEls();
    if (revealObserver) revealObserver.disconnect();

    if (reduceMotion) {
      cardEls.forEach((card) => card.classList.add('is-visible'));
      return;
    }

    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const visibleSiblings = cardEls.filter((c) => !c.classList.contains('is-hidden') && !c.classList.contains('is-visible'));
        const staggerIndex = visibleSiblings.indexOf(el);
        el.style.transitionDelay = `${Math.max(staggerIndex, 0) * 90}ms`;
        el.classList.add('is-visible');
        revealObserver.unobserve(el);
      });
    }, { threshold: 0.01, rootMargin: '0px 0px 150px 0px' });

    cardEls.forEach((card) => revealObserver.observe(card));
  }

  /* ---------- Filtering ---------- */
  function applyFilter(key, skipAnimation) {
    activeCategory = key;
    tabsEl.querySelectorAll('.filter-tab').forEach((btn) => {
      const isActive = btn.dataset.category === key;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    moveIndicator();

    getCardEls().forEach((card) => {
      const matches = key === 'all' || card.dataset.category === key;
      if (matches) {
        card.classList.remove('is-hidden');
        if (skipAnimation) {
          card.classList.remove('is-filtered-out');
        } else {
          window.requestAnimationFrame(() => card.classList.remove('is-filtered-out'));
        }
        if (!card.classList.contains('is-visible')) {
          card.style.transitionDelay = '0ms';
          card.classList.add('is-visible');
        }
      } else if (!skipAnimation) {
        card.classList.add('is-filtered-out');
        window.setTimeout(() => {
          if (card.classList.contains('is-filtered-out')) card.classList.add('is-hidden');
        }, 450);
      } else {
        card.classList.add('is-hidden', 'is-filtered-out');
      }
    });
  }

  function setActiveCategory(key) {
    if (key === activeCategory) return;
    applyFilter(key, false);
  }

  window.addEventListener('resize', moveIndicator);

  /* ---------- Lightbox ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxTag = document.getElementById('lightboxTag');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const lightboxPlayStore = document.getElementById('lightboxPlayStore');
  const lightboxGithub = document.getElementById('lightboxGithub');
  let lastFocusedEl = null;

  function openLightbox(project, index) {
    const accent = window.SSContent.accentForIndex(index);
    const categoryLabel = window.SSContent.CATEGORY_LABELS[project.category] || project.category;
    lightboxImage.style.setProperty('--card-accent', accent);
    lightboxImage.innerHTML = thumbMarkup(project, index);
    lightboxTag.textContent = categoryLabel;
    lightboxTag.style.color = accent;
    lightboxTitle.textContent = project.title;
    lightboxDesc.textContent = project.description;

    if (lightboxPlayStore) {
      if (project.playStoreUrl) {
        lightboxPlayStore.href = project.playStoreUrl;
        lightboxPlayStore.hidden = false;
      } else {
        lightboxPlayStore.hidden = true;
        lightboxPlayStore.removeAttribute('href');
      }
    }
    if (lightboxGithub) {
      if (project.githubUrl) {
        lightboxGithub.href = project.githubUrl;
        lightboxGithub.hidden = false;
      } else {
        lightboxGithub.hidden = true;
        lightboxGithub.removeAttribute('href');
      }
    }

    lastFocusedEl = document.activeElement;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    lightboxClose.focus();
  }
  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    if (lastFocusedEl) lastFocusedEl.focus();
  }
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('is-open')) closeLightbox();
  });

  render();
  window.SSContent.onChange(render);
})();
