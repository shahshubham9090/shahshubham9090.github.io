/* =========================================================
   ADMIN PANEL JS
   Login gate, dashboard, and every content-editing panel.
   Reads/writes through window.SSContent so changes are
   instantly reflected on every public page.
   ========================================================= */

(() => {
  if (!window.SSContent || !window.SSAuth) return;

  /* ---------- Scroll progress bar ---------- */
  const progressBar = document.getElementById('scrollProgress');
  if (progressBar) {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      progressBar.style.transform = `scaleX(${ratio})`;
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
  }

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $all = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }
  function escapeAttr(str) { return escapeHTML(str).replace(/"/g, '&quot;'); }

  function flashSaved(elId, text) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.textContent = text || 'Saved!';
    el.classList.add('is-visible');
    window.clearTimeout(el._flashTimer);
    el._flashTimer = window.setTimeout(() => el.classList.remove('is-visible'), 2400);
  }

  /* ---------- Image compression helper ---------- */
  function fileToCompressedDataURL(file, maxDim, quality) {
    maxDim = maxDim || 900;
    quality = quality || 0.82;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Could not read image'));
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) { height = Math.round(height * (maxDim / width)); width = maxDim; }
            else { width = Math.round(width * (maxDim / height)); height = maxDim; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /* =========================================================
     LOGIN
     ========================================================= */
  const loginScreen = $('#loginScreen');
  const dashboardScreen = $('#dashboardScreen');
  const loginForm = $('#loginForm');
  const loginError = $('#loginError');

  function showDashboard() {
    loginScreen.hidden = true;
    dashboardScreen.hidden = false;
    const topbarUser = $('#topbarUsername');
    if (topbarUser) topbarUser.textContent = window.SSAuth.getCredentials().username;
    initAllPanels();
  }

  if (window.SSAuth.isAuthed()) {
    showDashboard();
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = $('#loginUsername').value.trim();
      const p = $('#loginPassword').value;
      if (window.SSAuth.checkLogin(u, p)) {
        window.SSAuth.login();
        loginError.textContent = '';
        showDashboard();
      } else {
        loginError.textContent = 'Incorrect username or password. Please try again.';
      }
    });
  }

  const logoutBtn = $('#logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      window.SSAuth.logout();
      window.location.reload();
    });
  }

  /* =========================================================
     SIDEBAR NAVIGATION
     ========================================================= */
  const navItems = $all('.admin-nav-item');
  const panels = $all('.admin-panel');

  function showPanel(key) {
    navItems.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.panel === key));
    panels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.panel === key));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  navItems.forEach((btn) => btn.addEventListener('click', () => showPanel(btn.dataset.panel)));

  /* =========================================================
     INIT — runs once after login, and re-runs render calls
     whenever content changes so the admin UI stays in sync.
     ========================================================= */
  function initAllPanels() {
    renderDashboard();
    renderHomePanel();
    renderPortfolioPanel();
    renderAboutPanel();
    renderServicesPanel();
    renderAchievementsPanel();
    renderContactPanel();
    renderImagesPanel();
    renderSocialPanel();
    renderThemesPanel();
    renderSettingsPanel();
  }

  /* ---------- DASHBOARD ---------- */
  function renderDashboard() {
    const grid = $('#dashGrid');
    if (!grid) return;
    const c = window.SSContent.get();
    const cards = [
      { panel: 'home', title: 'Home Page', desc: 'Hero text, photo, and key numbers.' },
      { panel: 'portfolio', title: 'Portfolio Page', desc: `${c.portfolio.length} project${c.portfolio.length === 1 ? '' : 's'} listed.` },
      { panel: 'about', title: 'About Page', desc: 'Your story and mission statement.' },
      { panel: 'services', title: 'Services', desc: `${c.services.length} service${c.services.length === 1 ? '' : 's'}, with pricing.` },
      { panel: 'achievements', title: 'Awards & Achievements', desc: `${c.achievements.length} milestone${c.achievements.length === 1 ? '' : 's'} listed.` },
      { panel: 'contact', title: 'Contact Information', desc: 'Email, WhatsApp, and intro message.' },
      { panel: 'images', title: 'Images & Media', desc: 'Every photo and thumbnail on your site.' },
      { panel: 'social', title: 'Social Media Links', desc: 'Instagram and YouTube links.' },
      { panel: 'themes', title: 'Color Themes', desc: 'Switch the whole site\u2019s color palette.' },
      { panel: 'settings', title: 'Website Settings', desc: 'Backups, reset, and footer text.' },
      { panel: 'account', title: 'Admin Account', desc: 'Change your username and password.' },
    ];
    grid.innerHTML = cards.map((card) => `
      <button class="admin-dash-card" data-goto="${card.panel}">
        <h4>${card.title}</h4>
        <p>${card.desc}</p>
      </button>
    `).join('');
    $all('[data-goto]', grid).forEach((btn) => btn.addEventListener('click', () => showPanel(btn.dataset.goto)));
  }

  /* ---------- HOME PANEL ---------- */
  function renderHomePanel() {
    const c = window.SSContent.get();
    $('#homeFirstName').value = c.hero.firstName;
    $('#homeLastName').value = c.hero.lastName;
    $('#homeEyebrow').value = c.hero.eyebrow;
    $('#homeTagline').value = c.hero.tagline;

    const statsEditor = $('#statsEditor');
    statsEditor.innerHTML = c.stats.map((s, i) => `
      <div class="admin-stat-row" data-index="${i}">
        <div><label>Value</label><input type="number" step="0.1" class="stat-value-input" value="${s.value}"></div>
        <div><label>Suffix</label><input type="text" class="stat-suffix-input" value="${escapeAttr(s.suffix)}"></div>
        <div><label>Label</label><input type="text" class="stat-label-input" value="${escapeAttr(s.label)}"></div>
      </div>
    `).join('');
  }

  const saveHomeBtn = $('#saveHomeBtn');
  if (saveHomeBtn) {
    saveHomeBtn.addEventListener('click', () => {
      const statRows = $all('.admin-stat-row');
      window.SSContent.update((c) => {
        c.hero.firstName = $('#homeFirstName').value.trim();
        c.hero.lastName = $('#homeLastName').value.trim();
        c.hero.eyebrow = $('#homeEyebrow').value.trim();
        c.hero.tagline = $('#homeTagline').value.trim();
        statRows.forEach((row, i) => {
          if (!c.stats[i]) return;
          const val = parseFloat($('.stat-value-input', row).value);
          c.stats[i].value = isNaN(val) ? c.stats[i].value : val;
          c.stats[i].decimals = ($('.stat-value-input', row).value.split('.')[1] || '').length;
          c.stats[i].suffix = $('.stat-suffix-input', row).value;
          c.stats[i].label = $('.stat-label-input', row).value;
        });
      });
      flashSaved('homeSaveMsg');
      renderDashboard();
    });
  }

  /* ---------- PORTFOLIO PANEL ---------- */
  function projectRowTemplate(p, i) {
    const thumbPreview = p.thumbnail ? `<img src="${p.thumbnail}" alt="">` : 'No image';
    return `
      <div class="admin-list-row" data-id="${p.id}">
        <button type="button" class="admin-row-remove" data-remove-project>&times;</button>
        <div class="admin-list-row-top">
          <div class="form-field"><label>Project Title</label><input type="text" class="proj-title" value="${escapeAttr(p.title)}"></div>
          <div class="form-field"><label>Category</label>
            <select class="proj-category">
              <option value="mobile" ${p.category === 'mobile' ? 'selected' : ''}>Mobile App Development</option>
              <option value="design" ${p.category === 'design' ? 'selected' : ''}>UI/UX & App Design</option>
              <option value="api" ${p.category === 'api' ? 'selected' : ''}>API Integration & Development</option>
            </select>
          </div>
        </div>
        <div class="form-field"><label>Description</label><textarea class="proj-desc" rows="2">${escapeHTML(p.description)}</textarea></div>
        <div class="admin-image-row">
          <div class="admin-image-preview proj-thumb-preview">${thumbPreview}</div>
          <div class="admin-image-controls">
            <label class="btn btn-outline admin-upload-btn">Upload Thumbnail<input type="file" accept="image/*" class="proj-thumb-input" hidden></label>
            <button type="button" class="btn btn-ghost proj-thumb-remove">Remove</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderPortfolioPanel() {
    const c = window.SSContent.get();
    const list = $('#portfolioList');
    list.innerHTML = c.portfolio.map((p, i) => projectRowTemplate(p, i)).join('');
    wirePortfolioRowEvents();
  }

  function wirePortfolioRowEvents() {
    $all('#portfolioList .admin-list-row').forEach((row) => {
      $('[data-remove-project]', row).addEventListener('click', () => {
        row.remove();
      });
      const fileInput = $('.proj-thumb-input', row);
      fileInput.addEventListener('change', async () => {
        const file = fileInput.files[0];
        if (!file) return;
        const dataUrl = await fileToCompressedDataURL(file, 800, 0.8);
        row.dataset.newThumb = dataUrl;
        $('.proj-thumb-preview', row).innerHTML = `<img src="${dataUrl}" alt="">`;
      });
      $('.proj-thumb-remove', row).addEventListener('click', () => {
        row.dataset.newThumb = '';
        row.dataset.thumbRemoved = 'true';
        $('.proj-thumb-preview', row).innerHTML = 'No image';
      });
    });
  }

  const addProjectBtn = $('#addProjectBtn');
  if (addProjectBtn) {
    addProjectBtn.addEventListener('click', () => {
      const newProject = { id: window.SSContent.newId('proj'), title: 'New Project', category: 'mobile', description: '', thumbnail: null };
      const list = $('#portfolioList');
      list.insertAdjacentHTML('beforeend', projectRowTemplate(newProject, list.children.length));
      wirePortfolioRowEvents();
    });
  }

  const savePortfolioBtn = $('#savePortfolioBtn');
  if (savePortfolioBtn) {
    savePortfolioBtn.addEventListener('click', () => {
      const rows = $all('#portfolioList .admin-list-row');
      const newPortfolio = rows.map((row) => {
        let thumbnail = null;
        const existing = window.SSContent.get().portfolio.find((p) => p.id === row.dataset.id);
        if (row.dataset.newThumb) thumbnail = row.dataset.newThumb;
        else if (row.dataset.thumbRemoved === 'true') thumbnail = null;
        else thumbnail = existing ? existing.thumbnail : null;
        return {
          id: row.dataset.id,
          title: $('.proj-title', row).value.trim() || 'Untitled Project',
          category: $('.proj-category', row).value,
          description: $('.proj-desc', row).value.trim(),
          thumbnail,
        };
      });
      window.SSContent.update((c) => { c.portfolio = newPortfolio; });
      flashSaved('portfolioSaveMsg');
      renderPortfolioPanel();
      renderDashboard();
      renderImagesPanel();
    });
  }

  /* ---------- ABOUT PANEL ---------- */
  function experienceRowTemplate(job) {
    return `
      <div class="admin-list-row" data-id="${job.id}">
        <button type="button" class="admin-row-remove" data-remove-exp>&times;</button>
        <div class="admin-list-row-top">
          <div class="form-field"><label>Company</label><input type="text" class="exp-company" value="${escapeAttr(job.company)}"></div>
          <div class="form-field"><label>Period</label><input type="text" class="exp-period" value="${escapeAttr(job.period)}" placeholder="Jan 2024 – Present"></div>
        </div>
        <div class="form-field"><label>Role</label><input type="text" class="exp-role" value="${escapeAttr(job.role)}"></div>
        <div class="form-field"><label>Bullet Points (one per line)</label><textarea class="exp-bullets" rows="3">${escapeHTML((job.bullets || []).join('\n'))}</textarea></div>
      </div>
    `;
  }

  function renderExperiencePanel() {
    const c = window.SSContent.get();
    const list = $('#experienceList');
    if (!list) return;
    const experience = (c.about && c.about.experience) || [];
    list.innerHTML = experience.map(experienceRowTemplate).join('');
    $all('#experienceList .admin-list-row').forEach((row) => {
      $('[data-remove-exp]', row).addEventListener('click', () => row.remove());
    });
  }

  const addExperienceBtn = $('#addExperienceBtn');
  if (addExperienceBtn) {
    addExperienceBtn.addEventListener('click', () => {
      const newJob = { id: window.SSContent.newId('exp'), company: 'New Company', role: 'Role Title', period: '', bullets: [] };
      $('#experienceList').insertAdjacentHTML('beforeend', experienceRowTemplate(newJob));
      const row = $('#experienceList').lastElementChild;
      $('[data-remove-exp]', row).addEventListener('click', () => row.remove());
    });
  }

  function renderAboutPanel() {
    const c = window.SSContent.get();
    const about = c.about;
    $('#factLocationInput').value = about.quickFacts.location;
    $('#factFocusInput').value = about.quickFacts.focus;
    $('#factExperienceInput').value = about.quickFacts.experience;
    $('#storyTextarea').value = about.storyParagraphs.join('\n\n');
    $('#missionTextarea').value = about.mission;

    const preview = $('#aboutPhotoPreview');
    preview.innerHTML = about.photo ? `<img src="${about.photo}" alt="">` : 'No custom photo set';

    renderExperiencePanel();
  }

  const aboutPhotoInput = $('#aboutPhotoInput');
  if (aboutPhotoInput) {
    aboutPhotoInput.addEventListener('change', async () => {
      const file = aboutPhotoInput.files[0];
      if (!file) return;
      const dataUrl = await fileToCompressedDataURL(file, 900, 0.82);
      window.SSContent.update((c) => { c.about.photo = dataUrl; });
      renderAboutPanel();
      renderImagesPanel();
      flashSaved('aboutSaveMsg', 'Photo updated!');
    });
  }
  const aboutPhotoRemoveBtn = $('#aboutPhotoRemoveBtn');
  if (aboutPhotoRemoveBtn) {
    aboutPhotoRemoveBtn.addEventListener('click', () => {
      window.SSContent.update((c) => { c.about.photo = null; });
      renderAboutPanel();
      renderImagesPanel();
    });
  }

  const saveAboutBtn = $('#saveAboutBtn');
  if (saveAboutBtn) {
    saveAboutBtn.addEventListener('click', () => {
      const expRows = $all('#experienceList .admin-list-row');
      const newExperience = expRows.map((row) => ({
        id: row.dataset.id,
        company: $('.exp-company', row).value.trim() || 'Untitled Company',
        role: $('.exp-role', row).value.trim(),
        period: $('.exp-period', row).value.trim(),
        bullets: $('.exp-bullets', row).value.split('\n').map((s) => s.trim()).filter(Boolean),
      }));
      window.SSContent.update((c) => {
        c.about.quickFacts.location = $('#factLocationInput').value.trim();
        c.about.quickFacts.focus = $('#factFocusInput').value.trim();
        c.about.quickFacts.experience = $('#factExperienceInput').value.trim();
        c.about.storyParagraphs = $('#storyTextarea').value
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean);
        c.about.mission = $('#missionTextarea').value.trim();
        c.about.experience = newExperience;
      });
      flashSaved('aboutSaveMsg');
      renderExperiencePanel();
    });
  }

  /* ---------- SERVICES PANEL ---------- */
  const ICON_OPTIONS = ['mobile', 'layers', 'interface', 'link', 'star', 'rocket', 'flag', 'server', 'branch', 'target'];

  function serviceRowTemplate(svc) {
    return `
      <div class="admin-list-row" data-id="${svc.id}">
        <button type="button" class="admin-row-remove" data-remove-service>&times;</button>
        <div class="admin-list-row-top">
          <div class="form-field"><label>Icon</label>
            <select class="svc-icon">
              ${ICON_OPTIONS.map((k) => `<option value="${k}" ${svc.icon === k ? 'selected' : ''}>${k}</option>`).join('')}
            </select>
          </div>
          <div class="form-field"><label>Price</label><input type="text" class="svc-price" value="${escapeAttr(svc.price)}" placeholder="Let's Discuss"></div>
        </div>
        <div class="form-field"><label>Service Title</label><input type="text" class="svc-title" value="${escapeAttr(svc.title)}"></div>
        <div class="form-field"><label>Description</label><textarea class="svc-desc" rows="2">${escapeHTML(svc.description)}</textarea></div>
      </div>
    `;
  }

  function renderServicesPanel() {
    const c = window.SSContent.get();
    const list = $('#servicesList');
    list.innerHTML = c.services.map(serviceRowTemplate).join('');
    $all('#servicesList .admin-list-row').forEach((row) => {
      $('[data-remove-service]', row).addEventListener('click', () => row.remove());
    });
  }

  const addServiceBtn = $('#addServiceBtn');
  if (addServiceBtn) {
    addServiceBtn.addEventListener('click', () => {
      const newSvc = { id: window.SSContent.newId('svc'), icon: 'star', title: 'New Service', price: "Let's Discuss", description: '' };
      $('#servicesList').insertAdjacentHTML('beforeend', serviceRowTemplate(newSvc));
      const row = $('#servicesList').lastElementChild;
      $('[data-remove-service]', row).addEventListener('click', () => row.remove());
    });
  }

  const saveServicesBtn = $('#saveServicesBtn');
  if (saveServicesBtn) {
    saveServicesBtn.addEventListener('click', () => {
      const rows = $all('#servicesList .admin-list-row');
      const newServices = rows.map((row) => ({
        id: row.dataset.id,
        icon: $('.svc-icon', row).value,
        title: $('.svc-title', row).value.trim() || 'Untitled Service',
        price: $('.svc-price', row).value.trim() || "Let's Discuss",
        description: $('.svc-desc', row).value.trim(),
      }));
      window.SSContent.update((c) => { c.services = newServices; });
      flashSaved('servicesSaveMsg');
      renderServicesPanel();
      renderDashboard();
    });
  }

  /* ---------- ACHIEVEMENTS PANEL ---------- */
  const ACH_ICON_OPTIONS = ['flag', 'server', 'branch', 'rocket', 'target', 'star', 'mobile', 'layers'];

  function achievementRowTemplate(a) {
    return `
      <div class="admin-list-row" data-id="${a.id}">
        <button type="button" class="admin-row-remove" data-remove-ach>&times;</button>
        <div class="admin-list-row-top">
          <div class="form-field"><label>Stage</label><input type="text" class="ach-stage" value="${escapeAttr(a.stage)}"></div>
          <div class="form-field"><label>Year</label><input type="text" class="ach-year" value="${escapeAttr(a.year)}"></div>
        </div>
        <div class="admin-list-row-top">
          <div class="form-field"><label>Icon</label>
            <select class="ach-icon">
              ${ACH_ICON_OPTIONS.map((k) => `<option value="${k}" ${a.icon === k ? 'selected' : ''}>${k}</option>`).join('')}
            </select>
          </div>
          <div class="form-field"><label>Title</label><input type="text" class="ach-title" value="${escapeAttr(a.title)}"></div>
        </div>
        <div class="form-field"><label>Achievement</label><textarea class="ach-desc" rows="2">${escapeHTML(a.achievement)}</textarea></div>
        <div class="form-field"><label>Why It Matters</label><textarea class="ach-why" rows="2">${escapeHTML(a.whyItMatters)}</textarea></div>
      </div>
    `;
  }

  function renderAchievementsPanel() {
    const c = window.SSContent.get();
    const list = $('#achievementsList');
    list.innerHTML = c.achievements.map(achievementRowTemplate).join('');
    $all('#achievementsList .admin-list-row').forEach((row) => {
      $('[data-remove-ach]', row).addEventListener('click', () => row.remove());
    });
  }

  const addAchievementBtn = $('#addAchievementBtn');
  if (addAchievementBtn) {
    addAchievementBtn.addEventListener('click', () => {
      const newAch = { id: window.SSContent.newId('ach'), icon: 'star', stage: 'New Stage', year: String(new Date().getFullYear()), title: 'New Achievement', achievement: '', whyItMatters: '' };
      $('#achievementsList').insertAdjacentHTML('beforeend', achievementRowTemplate(newAch));
      const row = $('#achievementsList').lastElementChild;
      $('[data-remove-ach]', row).addEventListener('click', () => row.remove());
    });
  }

  const saveAchievementsBtn = $('#saveAchievementsBtn');
  if (saveAchievementsBtn) {
    saveAchievementsBtn.addEventListener('click', () => {
      const rows = $all('#achievementsList .admin-list-row');
      const newAchievements = rows.map((row) => ({
        id: row.dataset.id,
        icon: $('.ach-icon', row).value,
        stage: $('.ach-stage', row).value.trim(),
        year: $('.ach-year', row).value.trim(),
        title: $('.ach-title', row).value.trim() || 'Untitled Milestone',
        achievement: $('.ach-desc', row).value.trim(),
        whyItMatters: $('.ach-why', row).value.trim(),
      }));
      window.SSContent.update((c) => { c.achievements = newAchievements; });
      flashSaved('achievementsSaveMsg');
      renderAchievementsPanel();
      renderDashboard();
    });
  }

  /* ---------- CONTACT PANEL ---------- */
  function renderContactPanel() {
    const c = window.SSContent.get();
    $('#contactEmailInput').value = c.contact.email;
    $('#contactWhatsappInput').value = c.contact.whatsapp;
    $('#contactIntroInput').value = c.contact.intro;
  }
  const saveContactBtn = $('#saveContactBtn');
  if (saveContactBtn) {
    saveContactBtn.addEventListener('click', () => {
      window.SSContent.update((c) => {
        c.contact.email = $('#contactEmailInput').value.trim();
        c.contact.whatsapp = $('#contactWhatsappInput').value.trim();
        c.contact.intro = $('#contactIntroInput').value.trim();
      });
      flashSaved('contactSaveMsg');
    });
  }

  /* ---------- SOCIAL PANEL ---------- */
  function renderSocialPanel() {
    const c = window.SSContent.get();
    $('#socialInstagramInput').value = c.contact.instagram;
    $('#socialYoutubeInput').value = c.contact.youtube;
  }
  const saveSocialBtn = $('#saveSocialBtn');
  if (saveSocialBtn) {
    saveSocialBtn.addEventListener('click', () => {
      window.SSContent.update((c) => {
        c.contact.instagram = $('#socialInstagramInput').value.trim();
        c.contact.youtube = $('#socialYoutubeInput').value.trim();
      });
      flashSaved('socialSaveMsg');
    });
  }

  /* ---------- IMAGES & MEDIA PANEL ---------- */
  function renderImagesPanel() {
    const c = window.SSContent.get();

    const heroPreview = $('#heroPhotoPreview');
    heroPreview.innerHTML = c.hero.photo ? `<img src="${c.hero.photo}" alt="">` : 'No custom photo set';

    const aboutPreview2 = $('#aboutPhotoPreview2');
    aboutPreview2.innerHTML = c.about.photo ? `<img src="${c.about.photo}" alt="">` : 'No custom photo set';

    const thumbGrid = $('#thumbGrid');
    thumbGrid.innerHTML = c.portfolio.map((p) => `
      <div class="admin-thumb-card" data-id="${p.id}">
        <div class="admin-image-preview thumb-preview">${p.thumbnail ? `<img src="${p.thumbnail}" alt="">` : 'No image'}</div>
        <h4>${escapeHTML(p.title)}</h4>
        <label class="btn btn-outline admin-upload-btn">Upload<input type="file" accept="image/*" class="thumb-upload-input" hidden></label>
        <button type="button" class="btn btn-ghost thumb-remove-btn">Remove</button>
      </div>
    `).join('');

    $all('.thumb-upload-input', thumbGrid).forEach((input) => {
      input.addEventListener('change', async () => {
        const file = input.files[0];
        if (!file) return;
        const card = input.closest('.admin-thumb-card');
        const dataUrl = await fileToCompressedDataURL(file, 800, 0.8);
        window.SSContent.update((c2) => {
          const proj = c2.portfolio.find((p) => p.id === card.dataset.id);
          if (proj) proj.thumbnail = dataUrl;
        });
        renderImagesPanel();
        renderPortfolioPanel();
        renderDashboard();
      });
    });
    $all('.thumb-remove-btn', thumbGrid).forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.admin-thumb-card');
        window.SSContent.update((c2) => {
          const proj = c2.portfolio.find((p) => p.id === card.dataset.id);
          if (proj) proj.thumbnail = null;
        });
        renderImagesPanel();
        renderPortfolioPanel();
      });
    });
  }

  const heroPhotoInput = $('#heroPhotoInput');
  if (heroPhotoInput) {
    heroPhotoInput.addEventListener('change', async () => {
      const file = heroPhotoInput.files[0];
      if (!file) return;
      const dataUrl = await fileToCompressedDataURL(file, 900, 0.82);
      window.SSContent.update((c) => { c.hero.photo = dataUrl; });
      renderImagesPanel();
    });
  }
  const heroPhotoRemoveBtn = $('#heroPhotoRemoveBtn');
  if (heroPhotoRemoveBtn) {
    heroPhotoRemoveBtn.addEventListener('click', () => {
      window.SSContent.update((c) => { c.hero.photo = null; });
      renderImagesPanel();
    });
  }
  const aboutPhotoInput2 = $('#aboutPhotoInput2');
  if (aboutPhotoInput2) {
    aboutPhotoInput2.addEventListener('change', async () => {
      const file = aboutPhotoInput2.files[0];
      if (!file) return;
      const dataUrl = await fileToCompressedDataURL(file, 900, 0.82);
      window.SSContent.update((c) => { c.about.photo = dataUrl; });
      renderImagesPanel();
      renderAboutPanel();
    });
  }
  const aboutPhotoRemoveBtn2 = $('#aboutPhotoRemoveBtn2');
  if (aboutPhotoRemoveBtn2) {
    aboutPhotoRemoveBtn2.addEventListener('click', () => {
      window.SSContent.update((c) => { c.about.photo = null; });
      renderImagesPanel();
      renderAboutPanel();
    });
  }

  /* ---------- THEMES PANEL ---------- */
  function renderThemesPanel() {
    const c = window.SSContent.get();
    const grid = $('#themeGrid');
    const themes = window.SSTheme.THEMES;
    grid.innerHTML = Object.keys(themes).map((key) => {
      const t = themes[key];
      const isActive = c.site.theme === key;
      return `
        <button type="button" class="admin-theme-card ${isActive ? 'is-active' : ''}" data-theme="${key}">
          <div class="admin-theme-swatches">
            <span class="admin-theme-swatch" style="background:${t.bg}"></span>
            <span class="admin-theme-swatch" style="background:${t.accentA}"></span>
            <span class="admin-theme-swatch" style="background:${t.accentB}"></span>
            <span class="admin-theme-swatch" style="background:${t.ink}"></span>
          </div>
          <h4>${t.name}</h4>
          <span>${isActive ? 'Currently active' : 'Click to apply'}</span>
        </button>
      `;
    }).join('');

    $all('.admin-theme-card', grid).forEach((card) => {
      card.addEventListener('click', () => {
        window.SSContent.update((c2) => { c2.site.theme = card.dataset.theme; });
        renderThemesPanel();
      });
    });
  }

  /* ---------- SETTINGS PANEL ---------- */
  function renderSettingsPanel() {
    const c = window.SSContent.get();
    $('#footerNoteInput').value = c.site.footerNote;
  }
  const saveSettingsBtn = $('#saveSettingsBtn');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', () => {
      window.SSContent.update((c) => { c.site.footerNote = $('#footerNoteInput').value.trim(); });
      flashSaved('settingsSaveMsg');
    });
  }

  const exportBtn = $('#exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const data = JSON.stringify(window.SSContent.get(), null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'site-content-backup.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }

  const importInput = $('#importInput');
  if (importInput) {
    importInput.addEventListener('change', () => {
      const file = importInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          if (!parsed || typeof parsed !== 'object') throw new Error('Invalid file');
          if (!window.confirm('This will replace all current content with the backup file. Continue?')) return;
          window.SSContent.set(parsed);
          initAllPanels();
          flashSaved('settingsSaveMsg', 'Backup restored!');
        } catch (e) {
          window.alert('That file could not be read as a valid backup.');
        }
      };
      reader.readAsText(file);
      importInput.value = '';
    });
  }

  const resetBtn = $('#resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (!window.confirm('This resets every page back to its original content. This cannot be undone. Continue?')) return;
      window.SSContent.resetToDefaults();
      initAllPanels();
      flashSaved('settingsSaveMsg', 'Reset to defaults!');
    });
  }

  /* ---------- ACCOUNT PANEL ---------- */
  const saveAccountBtn = $('#saveAccountBtn');
  if (saveAccountBtn) {
    saveAccountBtn.addEventListener('click', () => {
      const accountError = $('#accountError');
      accountError.textContent = '';

      const currentPassword = $('#currentPasswordInput').value;
      const newUsername = $('#newUsernameInput').value.trim();
      const newPassword = $('#newPasswordInput').value;
      const confirmPassword = $('#confirmPasswordInput').value;
      const creds = window.SSAuth.getCredentials();

      if (currentPassword !== creds.password) {
        accountError.textContent = 'Current password is incorrect.';
        return;
      }
      if (!newUsername && !newPassword) {
        accountError.textContent = 'Enter a new username and/or a new password.';
        return;
      }
      if (newPassword && newPassword.length < 6) {
        accountError.textContent = 'New password must be at least 6 characters.';
        return;
      }
      if (newPassword !== confirmPassword) {
        accountError.textContent = 'New password and confirmation do not match.';
        return;
      }

      const finalUsername = newUsername || creds.username;
      const finalPassword = newPassword || creds.password;
      window.SSAuth.updateCredentials(finalUsername, finalPassword);
      $('#topbarUsername').textContent = finalUsername;
      $('#currentPasswordInput').value = '';
      $('#newUsernameInput').value = '';
      $('#newPasswordInput').value = '';
      $('#confirmPasswordInput').value = '';
      flashSaved('accountSaveMsg', 'Login details updated!');
    });
  }

})();
