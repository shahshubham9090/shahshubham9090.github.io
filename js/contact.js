/* =========================================================
   CONTACT FORM
   Client-side validation + Formspree submission for the
   closing-CTA contact form on the single-page site.
   ========================================================= */

(() => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const nameInput = document.getElementById('fieldName');
  const emailInput = document.getElementById('fieldEmail');
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

    if (!messageInput.value.trim()) {
      setFieldError(messageInput, document.getElementById('errorMessage'), 'Please add a short message.');
      isValid = false;
    } else {
      setFieldError(messageInput, document.getElementById('errorMessage'), '');
    }

    return isValid;
  }

  const submitBtn = document.getElementById('formSubmitBtn');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const valid = validate();

    if (!valid) {
      status.textContent = 'Please fix the highlighted fields above.';
      status.classList.add('is-visible', 'is-error');
      const firstError = form.querySelector('.form-field.has-error input, .form-field.has-error textarea');
      if (firstError) firstError.focus();
      return;
    }

    const endpoint = (window.SSContent.get().contact || {}).formEndpoint;

    if (!endpoint) {
      // No form service configured yet (set one in Admin Panel → Contact
      // Information) — be upfront about that rather than implying the
      // message was actually sent.
      status.classList.remove('is-error');
      status.textContent = "Thanks — this form isn't connected to a live inbox yet. Please reach out directly via email above in the meantime.";
      status.classList.add('is-visible');
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    status.classList.remove('is-error');
    status.textContent = 'Sending...';
    status.classList.add('is-visible');

    fetch(endpoint, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    })
      .then((response) => {
        if (response.ok) {
          status.classList.remove('is-error');
          status.textContent = "Thanks — your message has been sent! I'll get back to you soon.";
          form.reset();
        } else {
          status.classList.add('is-error');
          status.textContent = "Something went wrong sending your message. Please email me directly instead.";
        }
      })
      .catch(() => {
        status.classList.add('is-error');
        status.textContent = "Couldn't send your message — check your connection, or email me directly instead.";
      })
      .finally(() => {
        if (submitBtn) submitBtn.disabled = false;
      });
  });

  // clear error state as the visitor corrects a field
  [nameInput, emailInput, messageInput].forEach((el) => {
    el.addEventListener('input', () => {
      if (el.closest('.form-field').classList.contains('has-error')) validate();
    });
  });
})();
