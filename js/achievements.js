/* =========================================================
   ACHIEVEMENTS PAGE JS
   Renders milestone cards from the content store, staggered
   reveal on scroll, and a growing timeline progression fill.
   ========================================================= */

(() => {
  const timeline = document.getElementById('achvTimeline');
  const trackFill = document.getElementById('achvTrackFill');
  if (!timeline || !trackFill || !window.SSContent) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let observer = null;

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function render() {
    const content = window.SSContent.get();
    const items = content.achievements || [];

    timeline.querySelectorAll('.achv-item').forEach((el) => el.remove());
    trackFill.style.height = '0px';

    items.forEach((m, i) => {
      const article = document.createElement('article');
      article.className = 'achv-item';
      article.style.setProperty('--card-accent', i % 2 === 0 ? 'var(--color-orange)' : 'var(--color-blue)');
      const iconSVG = window.SSContent.ICONS[m.icon] || window.SSContent.ICONS.star;

      article.innerHTML = `
        <span class="achv-dot" aria-hidden="true"></span>
        <div class="achv-card">
          <div class="achv-card-top">
            <span class="achv-stage">${escapeHTML(m.stage)}</span>
            <span class="achv-year">${escapeHTML(m.year)}</span>
          </div>
          <div class="achv-icon" aria-hidden="true">${iconSVG}</div>
          <h3>${escapeHTML(m.title)}</h3>
          <p>${escapeHTML(m.achievement)}</p>
          <div class="achv-why">
            <span class="achv-why-label">Why it matters</span>
            <p>${escapeHTML(m.whyItMatters)}</p>
          </div>
        </div>
      `;
      timeline.appendChild(article);
    });

    setupReveal();
  }

  function setupReveal() {
    const items = timeline.querySelectorAll('.achv-item');
    if (observer) observer.disconnect();

    if (reduceMotion) {
      items.forEach((item) => item.classList.add('is-visible'));
      const lastDot = items.length ? items[items.length - 1].querySelector('.achv-dot') : null;
      if (lastDot) trackFill.style.height = (lastDot.offsetTop + lastDot.offsetHeight / 2) + 'px';
      return;
    }

    let maxFillTarget = 0;
    const growFillTo = (dotEl) => {
      const target = dotEl.offsetTop + dotEl.offsetHeight / 2 - 6;
      if (target > maxFillTarget) {
        maxFillTarget = target;
        trackFill.style.height = maxFillTarget + 'px';
      }
    };

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const index = Array.from(items).indexOf(el);
        el.style.transitionDelay = `${index * 60}ms`;
        el.classList.add('is-visible');
        const dot = el.querySelector('.achv-dot');
        if (dot) window.setTimeout(() => growFillTo(dot), index * 60 + 150);
        observer.unobserve(el);
      });
    }, { threshold: 0.35, rootMargin: '0px 0px -80px 0px' });

    items.forEach((item) => observer.observe(item));
  }

  render();
  window.SSContent.onChange(render);
})();
