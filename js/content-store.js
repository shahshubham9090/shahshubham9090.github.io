/* =========================================================
   SHARED CONTENT STORE
   Loaded on every public page AND the admin panel.
   This is the site's entire editable content, persisted to
   localStorage so the Admin Panel can edit it and every page
   reads the same data. No server/database is involved — see
   the note in the Admin Panel's Website Settings tab.
   ========================================================= */

(() => {
  const CONTENT_KEY = 'ss_portfolio_content_v1';

  const ICONS = {
    mobile:    '<svg viewBox="0 0 40 40" fill="none"><rect x="11" y="4" width="18" height="32" rx="3" stroke="currentColor" stroke-width="1.6"/><line x1="11" y1="30" x2="29" y2="30" stroke="currentColor" stroke-width="1.6"/></svg>',
    layers:    '<svg viewBox="0 0 40 40" fill="none"><rect x="6" y="9" width="20" height="15" rx="2.5" stroke="currentColor" stroke-width="1.6"/><rect x="14" y="17" width="20" height="15" rx="2.5" stroke="currentColor" stroke-width="1.6"/></svg>',
    interface: '<svg viewBox="0 0 40 40" fill="none"><rect x="4" y="8" width="32" height="24" rx="3" stroke="currentColor" stroke-width="1.6"/><circle cx="26" cy="20" r="4.5" stroke="currentColor" stroke-width="1.6"/><line x1="9" y1="15" x2="18" y2="15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><line x1="9" y1="20" x2="16" y2="20" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><line x1="9" y1="25" x2="14" y2="25" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    link:      '<svg viewBox="0 0 40 40" fill="none"><circle cx="13" cy="20" r="6" stroke="currentColor" stroke-width="1.6"/><circle cx="27" cy="20" r="6" stroke="currentColor" stroke-width="1.6"/><line x1="18" y1="20" x2="22" y2="20" stroke="currentColor" stroke-width="1.6"/></svg>',
    star:      '<svg viewBox="0 0 40 40" fill="none"><path d="M20 5l4.5 9.2 10.1 1.5-7.3 7.1 1.7 10-9-4.7-9 4.7 1.7-10-7.3-7.1 10.1-1.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    rocket:    '<svg viewBox="0 0 40 40" fill="none"><path d="M20 5v20" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M12 13l8-8 8 8" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><rect x="7" y="28" width="26" height="7" rx="2.2" stroke="currentColor" stroke-width="1.6"/></svg>',
    flag:      '<svg viewBox="0 0 40 40" fill="none"><path d="M12 6v28" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M12 8h17l-4.5 5.5L29 19H12" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    server:    '<svg viewBox="0 0 40 40" fill="none"><rect x="7" y="9" width="26" height="9" rx="2.2" stroke="currentColor" stroke-width="1.6"/><rect x="7" y="23" width="26" height="9" rx="2.2" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="13.5" r="1.3" fill="currentColor"/><circle cx="12" cy="27.5" r="1.3" fill="currentColor"/></svg>',
    branch:    '<svg viewBox="0 0 40 40" fill="none"><circle cx="9" cy="20" r="3.4" stroke="currentColor" stroke-width="1.6"/><circle cx="30" cy="9" r="3.4" stroke="currentColor" stroke-width="1.6"/><circle cx="30" cy="31" r="3.4" stroke="currentColor" stroke-width="1.6"/><path d="M12 18.5L27 10.5M12 21.5L27 29.5" stroke="currentColor" stroke-width="1.6"/></svg>',
    target:    '<svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="14" stroke="currentColor" stroke-width="1.6"/><circle cx="20" cy="20" r="8" stroke="currentColor" stroke-width="1.6"/><circle cx="20" cy="20" r="2" fill="currentColor"/></svg>',
  };

  const CATEGORY_LABELS = {
    mobile: 'Mobile App Development',
    design: 'UI/UX & App Design',
    api: 'API Integration & Development',
  };

  const ACCENT_ROTATION = ['var(--color-orange)', 'var(--color-blue)', 'var(--color-ink-soft)'];

  function accentForIndex(i) {
    return ACCENT_ROTATION[i % ACCENT_ROTATION.length];
  }

  function tileSVG(accent) {
    return `<svg viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="400" height="300" fill="${accent}"/>
      <g opacity="0.22" stroke="#fff" stroke-width="1">
        <line x1="0" y1="60" x2="400" y2="60"/><line x1="0" y1="150" x2="400" y2="150"/><line x1="0" y1="240" x2="400" y2="240"/>
        <line x1="100" y1="0" x2="100" y2="300"/><line x1="300" y1="0" x2="300" y2="300"/>
      </g></svg>`;
  }

  const DEFAULTS = {
    site: {
      theme: 'sunset',
      footerNote: '© 2026 Shubham Shah. All rights reserved.',
    },
    hero: {
      firstName: 'Shubham',
      lastName: 'Shah',
      eyebrow: 'Software Engineer — Flutter & React Native Developer',
      tagline: 'From Idea to App — Building Experiences That Make an Impact.',
      photo: null,
    },
    stats: [
      { key: 'apps',     value: 5,  decimals: 0, suffix: '+', label: 'Apps Shipped Live' },
      { key: 'years',    value: 2,  decimals: 0, suffix: '+', label: 'Years Experience' },
      { key: 'coverage', value: 80, decimals: 0, suffix: '%', label: 'Test Coverage' },
      { key: 'failures', value: 0,  decimals: 0, suffix: '',  label: 'Critical Post-Launch Failures' },
    ],
    about: {
      photo: null,
      quickFacts: { location: 'Bhavnagar, Gujarat, India', focus: 'Flutter & React Native', experience: '2+ years' },
      storyParagraphs: [
        "My journey into mobile app development began with a simple curiosity — how does an idea on paper turn into something people can hold in their hand and actually rely on.",
        "I started as a Flutter Mobile App Developer at Softwingz Infotech, shipping features for real client projects and integrating REST APIs and Firebase services like Auth, Firestore, and FCM for 500+ active users.",
        "At Milople Technologies, I owned the full software development lifecycle — requirements, architecture, development, testing, and release — across 5+ production Flutter apps, using BLoC, Provider, and GetX to keep each one scalable and testable.",
        "Somewhere along the way, testing stopped being optional. Pushing critical modules to 80%+ test coverage cut post-release bugs by 40% and helped me ship every one of those apps with zero critical post-launch failures.",
        "I expanded into React Native through freelance client engagements and later at Mitti Labs, taking projects end-to-end — from requirement scoping to production release — with the same architecture discipline across both frameworks.",
        "Along the way, I built TheBidNow's real-time WebSocket bidding engine, handling concurrent live auctions across 4 sports with sub-200ms response time — the kind of problem that reminds me why I enjoy this work.",
        "I've also leaned into AI-assisted development — GitHub Copilot, Claude Code, Cursor AI — not to replace engineering judgment, but to cut debugging time by 30% and speed up delivery by 20%, freeing up time for the parts that actually need a human.",
        "I graduated with a B.Tech in Information Technology (8.66 CGPA) while actively delivering freelance Flutter projects in parallel — and that same pace has carried into my career: always shipping, always learning, always looking for the next problem worth solving.",
      ],
      mission: 'To build production-ready mobile experiences that solve real problems, ship without critical failures, and make technology easier to use.',
      experience: [
        {
          id: 'exp-mitti',
          company: 'Mitti Labs',
          role: 'Software Engineer',
          period: 'Jun 2026 – Present',
          bullets: [
            'Building and shipping production features across mobile applications.',
            'Using AI-assisted development tools (Claude Code, GitHub Copilot, Cursor AI) to accelerate implementation, debugging, and code review cycles.',
            'Collaborating with cross-functional product and engineering teams in an Agile environment to plan, build, and ship production releases.',
          ],
        },
        {
          id: 'exp-freelance',
          company: 'Freelance / Client Projects',
          role: 'Software Engineer',
          period: 'Mar 2026 – Jun 2026',
          bullets: [
            'Delivered independent client engagements end-to-end — requirement scoping, architecture, development, and production release — using React Native.',
            'Applied AI-assisted development workflows to speed up debugging and feature delivery under tight timelines.',
          ],
        },
        {
          id: 'exp-milople',
          company: 'Milople Technologies',
          role: 'Software Engineer',
          period: 'Aug 2024 – Mar 2026',
          bullets: [
            'Owned full SDLC — requirements through architecture, development, testing, and Play Store / App Store release — across 5+ production Flutter apps.',
            'Built scalable, testable app architectures (BLoC, Provider, GetX) with 80%+ test coverage, cutting post-release bugs by 40% — zero critical post-launch failures.',
            'Optimized app performance (25% faster launch, sustained 60fps) and owned the release lifecycle end-to-end — signing, provisioning, ASO, and store submissions.',
          ],
        },
        {
          id: 'exp-softwingz',
          company: 'Softwingz Infotech',
          role: 'Flutter Mobile App Developer',
          period: 'Jun 2024 – Aug 2024',
          bullets: [
            'Developed and shipped Flutter features for 2+ client projects using Provider state management.',
            'Integrated REST APIs and Firebase services (Auth, Firestore, FCM), enabling real-time data sync and push notifications for 500+ active users.',
          ],
        },
      ],
    },
    contact: {
      email: 'shubhamshah9097@gmail.com',
      whatsapp: '+91-8200495373',
      instagram: 'https://www.instagram.com',
      youtube: 'https://www.youtube.com',
      intro: "Have an idea, a problem to solve, or a mobile app to build? Let's turn it into something real.",
    },
    services: [
      { id: 'svc-mobile',  icon: 'mobile',    title: 'Mobile App Development', price: "Let's Discuss", description: 'I build and ship production-ready cross-platform apps — architected for scale, tested to 80%+ coverage, and released to the Play Store and App Store with zero critical post-launch failures.' },
      { id: 'svc-flutter', icon: 'layers',    title: 'Flutter & React Native Development', price: "Let's Discuss", description: 'I specialize in Flutter and React Native, using BLoC, Provider, GetX, and Redux to build maintainable apps that stay consistent across Android, iOS, and web.' },
      { id: 'svc-uiux',    icon: 'interface', title: 'UI/UX Implementation & App Experience', price: "Let's Discuss", description: 'I transform designs and ideas into polished, interactive mobile experiences with responsive layouts, smooth interactions, meaningful animations, and attention to usability.' },
      { id: 'svc-api',     icon: 'link',      title: 'API, Firebase & Real-Time Integration', price: "Let's Discuss", description: 'I connect apps to REST APIs, WebSockets, and Firebase (Auth, Firestore, FCM) — handling real-time data sync, push notifications, and authentication end-to-end.' },
      { id: 'svc-ai',      icon: 'rocket',    title: 'AI-Assisted Development & Rapid Delivery', price: "Let's Discuss", description: 'I integrate AI coding tools like Claude Code, GitHub Copilot, and Cursor AI into my workflow — cutting debugging time by 30% and speeding up delivery by 20%, without cutting corners on quality.' },
    ],
    achievements: [
      { id: 'ach-1', icon: 'flag',   stage: 'Foundation', year: '2024', title: 'Shipped My First Production Features', achievement: 'Joined Softwingz Infotech as a Flutter Mobile App Developer, shipping features for 2+ client projects and integrating REST APIs and Firebase (Auth, Firestore, FCM) for 500+ active users.', whyItMatters: 'This was my first taste of writing code that real users depended on — and it set the standard I still hold myself to.' },
      { id: 'ach-2', icon: 'server', stage: 'Production', year: '2025', title: 'Owned Full SDLC at Milople Technologies', achievement: 'Took ownership of the complete development lifecycle — requirements, architecture, development, testing, and store release — across 5+ production Flutter apps, cutting average delivery time by 20% through reusable component design.', whyItMatters: 'Owning a product end to end taught me to think beyond code — about maintainability, reliability, and what a real release actually requires.' },
      { id: 'ach-3', icon: 'branch', stage: 'Expansion', year: '2026', title: 'Expanded into React Native', achievement: 'Took on independent freelance client engagements and joined Mitti Labs, applying BLoC, Provider, and GetX patterns across React Native codebases alongside Flutter.', whyItMatters: 'Working across two frameworks made me a more adaptable engineer, comfortable picking the right tool instead of the familiar one.' },
      { id: 'ach-4', icon: 'rocket', stage: 'Shipping', year: '2025', title: '5+ Apps Live, Zero Critical Failures', achievement: 'Shipped 5+ production apps live on the Play Store and App Store, reaching 80%+ unit test coverage on critical modules and cutting post-release bugs by 40%.', whyItMatters: 'Shipping without critical failures isn\u2019t luck — it\u2019s discipline. This is the standard I hold every release to.' },
      { id: 'ach-5', icon: 'target', stage: 'Impact', year: '2026', title: 'Built TheBidNow\u2019s Real-Time Bidding Engine', achievement: 'Built TheBidNow\u2019s real-time WebSocket bidding engine, supporting concurrent live auctions across 4 sports with sub-200ms response time, while using AI-assisted development to cut debugging time by 30%.', whyItMatters: 'This is the kind of problem I enjoy most — real-time, high-stakes, and only solvable by combining solid architecture with fast, focused execution.' },
    ],
    portfolio: [
      { id: 'collect',            title: 'Collect',               category: 'mobile', description: 'Own core features on Collect, a React Native app at Mitti Labs connecting 1,000+ registered farmers to a carbon-monitoring and sustainability tracking workflow.', thumbnail: null },
      { id: 'thebidnow',          title: 'TheBidNow',              category: 'api',    description: 'Built the real-time WebSocket bidding engine powering concurrent live auctions across 4 sports, with sub-200ms response time and OTP auth.', thumbnail: null },
      { id: 'amulya-mica',        title: 'Amulya Mica Visualizer', category: 'design', description: 'Built an AR-style product visualization experience at 60fps, reducing purchase-stage drop-off with an interactive preview.', thumbnail: null },
      { id: 'satvvaahar-spjym',   title: 'Satvvaahar & SPJYM',     category: 'mobile', description: 'Shipped a food-ordering app and a community-events app with real-time push notifications and order/profile state management.', thumbnail: null },
      { id: 'magento-app',        title: 'Magento Mobile App',     category: 'mobile', description: 'Built an e-commerce app on the Magento REST API with product browsing, cart, and an integration-tested checkout flow.', thumbnail: null },
      { id: 'notenest',           title: 'NoteNest',               category: 'mobile', description: 'An offline-first notes app built solo with Provider and Hive, demonstrating clean architecture and local storage.', thumbnail: null },
    ],
  };

  function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }
  function isPlainObject(v) { return v && typeof v === 'object' && !Array.isArray(v); }

  function get() {
    try {
      const raw = localStorage.getItem(CONTENT_KEY);
      if (!raw) return deepClone(DEFAULTS);
      const parsed = JSON.parse(raw);
      // merge one level deep per top-level section so a content blob saved
      // before a new field was introduced (e.g. about.experience) doesn't
      // lose that field — arrays/primitives still fully replace, only
      // plain objects (site/hero/about/contact) merge their direct keys
      const merged = deepClone(DEFAULTS);
      Object.keys(parsed).forEach((k) => {
        if (isPlainObject(merged[k]) && isPlainObject(parsed[k])) {
          merged[k] = { ...merged[k], ...parsed[k] };
        } else {
          merged[k] = parsed[k];
        }
      });
      return merged;
    } catch (e) {
      console.warn('Content store: could not read saved content, using defaults.', e);
      return deepClone(DEFAULTS);
    }
  }

  function set(newContent) {
    localStorage.setItem(CONTENT_KEY, JSON.stringify(newContent));
    // the native 'storage' event only fires in *other* tabs — dispatch our
    // own event too so the same tab (e.g. an admin live-preview) can react
    window.dispatchEvent(new CustomEvent('ss-content-changed', { detail: newContent }));
  }

  function update(mutatorFn) {
    const c = get();
    mutatorFn(c);
    set(c);
    return c;
  }

  function resetToDefaults() {
    set(deepClone(DEFAULTS));
  }

  function onChange(callback) {
    window.addEventListener('ss-content-changed', () => callback(get()));
    window.addEventListener('storage', (e) => {
      if (e.key === CONTENT_KEY) callback(get());
    });
  }

  function newId(prefix) {
    return prefix + '-' + Math.random().toString(36).slice(2, 9);
  }

  window.SSContent = {
    CONTENT_KEY, DEFAULTS, ICONS, CATEGORY_LABELS,
    get, set, update, resetToDefaults, onChange, newId,
    accentForIndex, tileSVG,
  };
})();
