/* =========================================================
   THEME STORE
   Defines 4 complete color themes and applies the active one
   by injecting CSS custom-property overrides into <head>.
   Runs synchronously on every page load (script is NOT deferred)
   so the correct theme is applied before first paint.
   ========================================================= */

(() => {
  const THEMES = {
    sunset: {
      name: 'Sunset (Light)',
      bg: '#EDEAE2', bgAlt: '#E4E0D6', surface: '#FFFFFF', ink: '#181716', inkSoft: '#4A463E',
      muted: '#8A867C', line: '#D8D3C6', accentA: '#FF4E1F', accentB: '#1E4CFF', onDark: '#F5F3EC',
    },
    emerald: {
      name: 'Emerald Dusk',
      bg: '#E7EDE7', bgAlt: '#DCE4DC', surface: '#FFFFFF', ink: '#14201B', inkSoft: '#3E4A44',
      muted: '#7C8B83', line: '#CBD6CD', accentA: '#FF9F1C', accentB: '#1F8A5F', onDark: '#F5F3EC',
    },
    crimson: {
      name: 'Crimson Slate',
      bg: '#EAEAF0', bgAlt: '#DFE0E8', surface: '#FFFFFF', ink: '#17171F', inkSoft: '#3E3F4C',
      muted: '#82838F', line: '#CCCDDA', accentA: '#E63946', accentB: '#3A3AFF', onDark: '#F5F3EC',
    },
    violet: {
      name: 'Violet Copper',
      bg: '#EFEAE4', bgAlt: '#E5DED4', surface: '#FFFFFF', ink: '#201A16', inkSoft: '#4A3F37',
      muted: '#8C8074', line: '#D9CFC2', accentA: '#D9722C', accentB: '#7C5CFF', onDark: '#F5F3EC',
    },
    midnight: {
      name: 'Midnight (Dark)',
      bg: '#0B0B12', bgAlt: '#14141F', surface: '#15151F', ink: '#F3F2F8', inkSoft: '#B8B6CC',
      muted: '#7C7A94', line: '#27273A', accentA: '#FF5C33', accentB: '#4C7CFF', onDark: '#F3F2F8',
    },
  };

  function applyTheme(themeKey) {
    const t = THEMES[themeKey] || THEMES.sunset;
    let styleEl = document.getElementById('ss-theme-vars');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'ss-theme-vars';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `:root{
      --color-bg: ${t.bg};
      --color-bg-alt: ${t.bgAlt};
      --color-surface: ${t.surface};
      --color-ink: ${t.ink};
      --color-ink-soft: ${t.inkSoft};
      --color-muted: ${t.muted};
      --color-line: ${t.line};
      --color-orange: ${t.accentA};
      --color-orange-dim: ${t.accentA}1a;
      --color-blue: ${t.accentB};
      --color-blue-dim: ${t.accentB}1a;
      --color-error: #C1402B;
      --color-on-dark: ${t.onDark};
    }`;
  }

  function isAdminPage() {
    return /(^|\/)admin\.html$/.test(window.location.pathname);
  }

  function currentThemeKey() {
    // The Admin Panel always edits in a stable, easy-to-read light theme,
    // independent of whatever theme is set for the public site - so
    // switching the live site to a dark theme never makes the CMS itself
    // harder to use.
    if (isAdminPage()) return 'sunset';
    try {
      if (window.SSContent) return window.SSContent.get().site.theme || 'sunset';
      // content-store.js not loaded yet in this document — read raw as fallback
      const raw = localStorage.getItem('ss_portfolio_content_v1');
      if (raw) return (JSON.parse(raw).site || {}).theme || 'sunset';
    } catch (e) { /* fall through to default */ }
    return 'sunset';
  }

  // apply immediately on script execution (this script is loaded
  // synchronously in <head>, before body paint)
  applyTheme(currentThemeKey());

  // live-update this tab if the theme changes in another tab
  window.addEventListener('storage', (e) => {
    if (e.key === 'ss_portfolio_content_v1') applyTheme(currentThemeKey());
  });
  window.addEventListener('ss-content-changed', () => applyTheme(currentThemeKey()));

  window.SSTheme = { THEMES, applyTheme, currentThemeKey };
})();
