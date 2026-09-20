/* =========================================================
   THEME
   Dark is the default on every first visit, regardless of the
   visitor's OS color-scheme preference. A visitor can switch to
   light via the header toggle; that choice is persisted in
   localStorage and re-applied on every later visit. Runs
   synchronously in <head>, before first paint, so there is no
   flash of the wrong theme.
   ========================================================= */

(() => {
  const THEME_KEY = 'ss_theme';

  function getStoredTheme() {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      return stored === 'light' ? 'light' : 'dark';
    } catch (e) {
      return 'dark';
    }
  }

  function apply(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  function set(theme) {
    apply(theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* ignore */ }
    window.dispatchEvent(new CustomEvent('ss-theme-changed', { detail: theme }));
  }

  function get() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function toggle() {
    set(get() === 'light' ? 'dark' : 'light');
    return get();
  }

  // apply immediately — this script is loaded synchronously in <head>,
  // before body paint, so switching to light here never causes a flash
  apply(getStoredTheme());

  window.SSTheme = { get, set, toggle };
})();
