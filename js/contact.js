/* =========================================================
   CONTACT PAGE JS
   Scroll-reveal for page elements + client-side form validation
   ========================================================= */

(() => {
  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal-item');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (revealEls.length) {
    if (reduceMotion) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    } else {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = Array.from(revealEls).indexOf(entry.target);
          entry.target.style.transitionDelay = `${index * 80}ms`;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

      revealEls.forEach((el) => observer.observe(el));
    }
  }

  /* ---------- Staggered reveal for individual form fields ---------- */
  const formFields = document.querySelectorAll('[data-reveal]');
  if (formFields.length) {
    formFields.forEach((field) => {
      field.classList.add('reveal-item');
    });
    if (reduceMotion) {
      formFields.forEach((f) => f.classList.add('is-visible'));
    } else {
      const fieldObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = Array.from(formFields).indexOf(entry.target);
          entry.target.style.transitionDelay = `${index * 70}ms`;
          entry.target.classList.add('is-visible');
          fieldObserver.unobserve(entry.target);
        });
      }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });
      formFields.forEach((f) => fieldObserver.observe(f));
    }
  }

  /* ---------- Form validation ---------- */
  const form = document.getElementById('contactForm');
  if (!form) return;

  const nameInput = document.getElementById('fieldName');
  const emailInput = document.getElementById('fieldEmail');
  const projectTypeSelect = document.getElementById('fieldProjectType');
  const messageInput = document.getElementById('fieldMessage');
  const status = document.getElementById('formStatus');

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setFieldError(inputEl, errorEl, message) {
    const fieldWrap = inputEl.closest('.form-field');
    if (message) {
      fieldWrap.classList.add('has-error');
      errorEl.textContent = message;
    } else {
      fieldWrap.classList.remove('has-error');
      errorEl.textContent = '';
    }
  }

  function validate() {
    let isValid = true;

    if (!nameInput.value.trim()) {
      setFieldError(nameInput, document.getElementById('errorName'), 'Please enter your name.');
      isValid = false;
    } else {
      setFieldError(nameInput, document.getElementById('errorName'), '');
    }

    if (!emailInput.value.trim()) {
      setFieldError(emailInput, document.getElementById('errorEmail'), 'Please enter your email.');
      isValid = false;
    } else if (!EMAIL_RE.test(emailInput.value.trim())) {
      setFieldError(emailInput, document.getElementById('errorEmail'), 'Please enter a valid email address.');
      isValid = false;
    } else {
      setFieldError(emailInput, document.getElementById('errorEmail'), '');
    }

    if (!projectTypeSelect.value) {
      setFieldError(projectTypeSelect, document.getElementById('errorProjectType'), 'Please select a project type.');
      isValid = false;
    } else {
      setFieldError(projectTypeSelect, document.getElementById('errorProjectType'), '');
    }

    if (!messageInput.value.trim()) {
      setFieldError(messageInput, document.getElementById('errorMessage'), 'Please add a short message.');
      isValid = false;
    } else {
      setFieldError(messageInput, document.getElementById('errorMessage'), '');
    }

    return isValid;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const valid = validate();

    if (!valid) {
      status.textContent = 'Please fix the highlighted fields above.';
      status.classList.add('is-visible', 'is-error');
      const firstError = form.querySelector('.form-field.has-error input, .form-field.has-error select, .form-field.has-error textarea');
      if (firstError) firstError.focus();
      return;
    }

    // No backend/email service is connected yet — be upfront about that
    // rather than implying the message was actually sent.
    status.classList.remove('is-error');
    status.textContent = "Thanks — this form isn't connected to a live inbox yet. Please reach out directly via email or WhatsApp above in the meantime.";
    status.classList.add('is-visible');
  });

  // clear error state as the visitor corrects a field
  [nameInput, emailInput, projectTypeSelect, messageInput].forEach((el) => {
    const evt = el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(evt, () => {
      if (el.closest('.form-field').classList.contains('has-error')) validate();
    });
  });
})();
