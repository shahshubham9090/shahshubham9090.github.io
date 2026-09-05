/* =========================================================
   CONTACT PAGE RENDER JS
   Populates intro text, email/WhatsApp/social links from the
   shared content store.
   ========================================================= */

(() => {
  if (!window.SSContent) return;

  function digitsOnly(str) {
    return (str || '').replace(/[^\d]/g, '');
  }

  function render() {
    const content = window.SSContent.get();
    const contact = content.contact || {};

    const introEl = document.getElementById('contactIntroText');
    if (introEl) introEl.textContent = contact.intro;

    const emailLink = document.getElementById('contactEmailLink');
    const emailText = document.getElementById('contactEmailText');
    if (emailLink) emailLink.href = 'mailto:' + contact.email;
    if (emailText) emailText.textContent = contact.email;

    const waLink = document.getElementById('contactWhatsappLink');
    const waText = document.getElementById('contactWhatsappText');
    if (waLink) waLink.href = 'https://wa.me/' + digitsOnly(contact.whatsapp);
    if (waText) waText.textContent = contact.whatsapp;

    const igLink = document.getElementById('socialInstagramLink');
    const ytLink = document.getElementById('socialYoutubeLink');
    if (igLink) igLink.href = contact.instagram;
    if (ytLink) ytLink.href = contact.youtube;

    // Project Type options should mirror the master Services list
    const projectTypeSelect = document.getElementById('fieldProjectType');
    if (projectTypeSelect && content.services) {
      const currentValue = projectTypeSelect.value;
      projectTypeSelect.innerHTML = '<option value="" selected disabled>Select a project type</option>';
      content.services.forEach((svc) => {
        const opt = document.createElement('option');
        opt.value = svc.title;
        opt.textContent = svc.title;
        projectTypeSelect.appendChild(opt);
      });
      const otherOpt = document.createElement('option');
      otherOpt.value = 'Other';
      otherOpt.textContent = 'Other';
      projectTypeSelect.appendChild(otherOpt);
      if (currentValue) projectTypeSelect.value = currentValue;
    }
  }

  render();
  window.SSContent.onChange(render);
})();
