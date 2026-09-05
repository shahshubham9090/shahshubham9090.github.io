/* =========================================================
   SERVICES PAGE JS
   Renders service cards from the content store (editable via
   the Admin Panel) and staggers their reveal on scroll.
   ========================================================= */

(() => {
  const gridEl = document.getElementById('serviceGrid');
  if (!gridEl || !window.SSContent) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let observer = null;

  function render() {
    const content = window.SSContent.get();
    const services = content.services || [];

    gridEl.innerHTML = '';

    services.forEach((svc, i) => {
      const card = document.createElement('article');
      card.className = 'service-detail-card';
      card.style.setProperty('--card-accent', i % 2 === 0 ? 'var(--color-orange)' : 'var(--color-blue)');

      const iconSVG = window.SSContent.ICONS[svc.icon] || window.SSContent.ICONS.star;

      card.innerHTML = `
        <div class="sd-icon" aria-hidden="true">${iconSVG}</div>
        <h3>${escapeHTML(svc.title)}</h3>
        <p>${escapeHTML(svc.description)}</p>
        <div class="sd-footer">
          <span class="sd-price"><span class="sd-price-label">Starting at</span> ${escapeHTML(svc.price || "Let's Discuss")}</span>
          <a href="contact.html" class="sd-link">Start a Project</a>
        </div>
      `;
      gridEl.appendChild(card);
    });

    setupReveal();
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function setupReveal() {
    const cards = gridEl.querySelectorAll('.service-detail-card');
    if (observer) observer.disconnect();

    if (reduceMotion) {
      cards.forEach((card) => card.classList.add('is-visible'));
      return;
    }

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const index = Array.from(cards).indexOf(entry.target);
        entry.target.style.transitionDelay = `${index * 120}ms`;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' });

    cards.forEach((card) => observer.observe(card));
  }

  render();
  window.SSContent.onChange(render);
})();
