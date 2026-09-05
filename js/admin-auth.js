/* =========================================================
   ADMIN AUTH
   Lightweight client-side login gate for the Admin Panel.
   IMPORTANT: since this is a static site with no server, this
   is NOT real security — anyone who opens the browser's dev
   tools can read localStorage or the page source. It only
   keeps casual visitors out of the editing screens. See the
   Admin Panel's Website Settings tab for more on this.
   ========================================================= */

(() => {
  const CREDS_KEY = 'ss_admin_credentials_v1';
  const SESSION_KEY = 'ss_admin_authed';
  const DEFAULT_CREDS = { username: 'shubham2413', password: '@shubham2413@' };

  function getCredentials() {
    try {
      const raw = localStorage.getItem(CREDS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* fall through */ }
    localStorage.setItem(CREDS_KEY, JSON.stringify(DEFAULT_CREDS));
    return { ...DEFAULT_CREDS };
  }

  function updateCredentials(username, password) {
    const creds = { username, password };
    localStorage.setItem(CREDS_KEY, JSON.stringify(creds));
    return creds;
  }

  function checkLogin(username, password) {
    const creds = getCredentials();
    return username === creds.username && password === creds.password;
  }

  function isAuthed() {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  }
  function login() { sessionStorage.setItem(SESSION_KEY, 'true'); }
  function logout() { sessionStorage.removeItem(SESSION_KEY); }

  window.SSAuth = {
    DEFAULT_CREDS, getCredentials, updateCredentials,
    checkLogin, isAuthed, login, logout,
  };
})();
