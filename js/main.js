/* =========================================================
   SHUBHAM SHAH — PORTFOLIO MAIN JS
   Shared across all pages: nav toggle + animated stat counters
   ========================================================= */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- Generic scroll reveal (.reveal) ----------
   Defined at top level (not inside DOMContentLoaded) because page
   scripts like home-render.js run synchronously right after this
   file — before DOMContentLoaded fires — and call SSReveal.init()
   as soon as they inject new .reveal elements into the DOM. */
function initReveal(root) {
  const scope = root || document;
  const els = Array.from(scope.querySelectorAll('.reveal:not([data-reveal-bound])'));
  if (!els.length) return;

  if (reduceMotion) {
    els.forEach((el) => {
      el.classList.add('is-visible');
      el.dataset.revealBound = 'true';
    });
    return;
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' });

  els.forEach((el) => {
    el.dataset.revealBound = 'true';
    revealObserver.observe(el);
  });
}
initReveal();
window.SSReveal = { init: initReveal };

document.addEventListener('DOMContentLoaded', () => {

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

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  /* ---------- Animated stat counters ---------- */
  const statItems = document.querySelectorAll('.stat-item');

  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimal || '0', 10);
    const valueEl = el.querySelector('.stat-value');
    if (!valueEl) return;

    if (reduceMotion) {
      valueEl.textContent = target.toFixed(decimals);
      return;
    }

    const duration = 1600;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      const current = target * eased;
      valueEl.textContent = current.toFixed(decimals);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        valueEl.textContent = target.toFixed(decimals);
      }
    };
    requestAnimationFrame(tick);
  };

  if (statItems.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statItems.forEach((item) => observer.observe(item));
  }

  /* ---------- Header scrolled state ---------- */
  const siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    const updateHeaderState = () => siteHeader.classList.toggle('is-scrolled', window.scrollY > 40);
    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });
  }

  /* ---------- Back to top ---------- */
  const backToTop = document.createElement('button');
  backToTop.type = 'button';
  backToTop.className = 'back-to-top';
  backToTop.setAttribute('aria-label', 'Back to top');
  backToTop.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  document.body.appendChild(backToTop);
  const updateBackToTop = () => backToTop.classList.toggle('is-visible', window.scrollY > 600);
  updateBackToTop();
  window.addEventListener('scroll', updateBackToTop, { passive: true });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ---------- Cursor spotlight (desktop only) ---------- */
  if (supportsHover && !reduceMotion) {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    let glowActive = false;
    window.addEventListener('pointermove', (e) => {
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      if (!glowActive) {
        glow.classList.add('is-active');
        glowActive = true;
      }
    }, { passive: true });
    document.addEventListener('pointerleave', () => glow.classList.remove('is-active'));
  }

  /* ---------- Card cursor-follow spotlight ---------- */
  const spotlightSelector = '.service-card, .service-detail-card, .achv-card, .contact-line, .work-thumb, .project-card';
  document.addEventListener('pointermove', (e) => {
    const target = e.target.closest ? e.target.closest(spotlightSelector) : null;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    target.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    target.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }, { passive: true });

  /* ---------- Magnetic buttons ---------- */
  if (supportsHover && !reduceMotion) {
    document.querySelectorAll('.btn-primary, .btn-outline').forEach((btn) => {
      const strength = 14;
      const handleMove = (e) => {
        const rect = btn.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        btn.style.transform = `translate(${px * strength}px, ${py * strength - 2}px)`;
      };
      const reset = () => { btn.style.transform = ''; };
      btn.addEventListener('pointermove', handleMove);
      btn.addEventListener('pointerleave', reset);
    });

    /* ---------- Photo parallax tilt (hero + about story photo) ---------- */
    document.querySelectorAll('.hero-photo-frame, .story-photo-frame').forEach((frame) => {
      const handleMove = (e) => {
        const rect = frame.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        frame.style.transform = `perspective(1000px) rotateY(${px * 14}deg) rotateX(${-py * 14}deg)`;
      };
      const reset = () => { frame.style.transform = ''; };
      frame.addEventListener('pointermove', handleMove);
      frame.addEventListener('pointerleave', reset);
    });
  }

  /* ---------- Footer content sync (email + copyright note) ---------- */
  if (window.SSContent) {
    const syncFooter = () => {
      const content = window.SSContent.get();
      const emailLink = document.getElementById('footerEmailLink');
      const noteEl = document.getElementById('footerNote');
      if (emailLink && content.contact && content.contact.email) {
        emailLink.href = 'mailto:' + content.contact.email;
      }
      if (noteEl && content.site && content.site.footerNote) {
        noteEl.textContent = content.site.footerNote;
      }
    };
    syncFooter();
    window.SSContent.onChange(syncFooter);
  }

});
