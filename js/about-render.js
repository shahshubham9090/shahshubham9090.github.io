/* =========================================================
   ABOUT PAGE RENDER JS
   Populates photo, quick facts, story paragraphs, and mission
   statement from the shared content store.
   ========================================================= */

(() => {
  if (!window.SSContent) return;

  function render() {
    const content = window.SSContent.get();
    const about = content.about || {};

    const photoEl = document.getElementById('storyPhoto');
    if (photoEl && about.photo) {
      photoEl.innerHTML = `<img src="${about.photo}" alt="Photo of Shubham Shah" style="width:100%;height:100%;object-fit:cover;">`;
    }

    const locEl = document.getElementById('factLocation');
    const focusEl = document.getElementById('factFocus');
    const expEl = document.getElementById('factExperience');
    if (locEl && about.quickFacts) locEl.textContent = about.quickFacts.location;
    if (focusEl && about.quickFacts) focusEl.textContent = about.quickFacts.focus;
    if (expEl && about.quickFacts) expEl.textContent = about.quickFacts.experience;

    const copyEl = document.getElementById('storyCopy');
    if (copyEl && Array.isArray(about.storyParagraphs)) {
      copyEl.innerHTML = '';
      about.storyParagraphs.forEach((text, i) => {
        const p = document.createElement('p');
        if (i === 0) p.className = 'story-lede';
        else if (i === about.storyParagraphs.length - 1) p.className = 'story-closing';
        p.textContent = text;
        copyEl.appendChild(p);
      });
    }

    const missionEl = document.getElementById('missionStatement');
    if (missionEl && about.mission) missionEl.textContent = about.mission;

    renderExperience(about.experience);
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function renderExperience(experience) {
    const line = document.getElementById('journeyLine');
    if (!line || !Array.isArray(experience)) return;

    line.innerHTML = experience.map((job) => `
      <div class="journey-item">
        <span class="journey-dot" aria-hidden="true"></span>
        <div class="journey-content">
          <div class="journey-item-head">
            <h3>${escapeHTML(job.company)}</h3>
            <span class="journey-period">${escapeHTML(job.period)}</span>
          </div>
          <p class="journey-role">${escapeHTML(job.role)}</p>
          ${job.intro ? `<p class="journey-intro">${escapeHTML(job.intro)}</p>` : ''}
          ${Array.isArray(job.bullets) ? `<ul class="journey-bullets">${job.bullets.map((b) => `<li>${escapeHTML(b)}</li>`).join('')}</ul>` : ''}
        </div>
      </div>
    `).join('');

    setUpJourneyReveal();
  }

  function setUpJourneyReveal() {
    const items = document.querySelectorAll('.journey-item');
    if (!items.length) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      items.forEach((item) => item.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const index = Array.from(items).indexOf(entry.target);
        entry.target.style.transitionDelay = `${index * 110}ms`;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.01, rootMargin: '0px 0px 150px 0px' });

    items.forEach((item) => observer.observe(item));
  }

  render();
  window.SSContent.onChange(render);
})();
