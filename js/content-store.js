/* =========================================================
   SHARED CONTENT STORE
   Loaded on every public page AND the admin panel.
   This is the site's entire editable content, persisted to
   localStorage so the Admin Panel can edit it and every page
   reads the same data. No server/database is involved — see
   the note in the Admin Panel's Website Settings tab.
   ========================================================= */

(() => {
  const CONTENT_KEY = 'ss_portfolio_content_v2';

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
    mobile: 'Mobile App',
    design: 'UI/UX & App Design',
    api: 'Real-Time / API',
  };

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
      footerNote: '© 2026 Shubham Shah. All rights reserved.',
    },
    hero: {
      firstName: 'Shubham',
      lastName: 'Shah',
      eyebrow: 'Software Engineer — Flutter & React Native',
      tagline: 'From Idea to App — Building Experiences That Make an Impact.',
      availableForWork: true,
      availabilityLabel: 'Open to Work',
      timezone: 'Asia/Kolkata',
      photo: 'assets/homeprofilepic.jpg',
      photoPath: null, // GitHub repo path for the uploaded file, used to delete/replace it later
    },
    stats: [
      { key: 'apps',     value: 5,  decimals: 0, suffix: '+', label: 'Apps Shipped Live' },
      { key: 'years',    value: 2,  decimals: 0, suffix: '+', label: 'Years Experience' },
      { key: 'coverage', value: 80, decimals: 0, suffix: '%', label: 'Test Coverage' },
      { key: 'users',    value: 5000, decimals: 0, suffix: '+', label: 'Users Across All Apps' },
    ],
    highlights: [
      { id: 'hl-ship',   icon: 'rocket', stat: '5+',      title: 'Shipped Live, Zero Critical Failures', description: 'Five-plus production apps live on the Play Store and App Store — every release with zero critical post-launch failures.' },
      { id: 'hl-testing', icon: 'target', stat: '-40%', title: 'Testing Discipline That Pays Off', description: '80%+ test coverage on critical modules cut post-release bugs by 40%, backed by disciplined unit, integration, and widget testing.' },
      { id: 'hl-realtime', icon: 'branch', stat: '<200ms', title: 'Real-Time at Scale', description: "Built TheBidNow's WebSocket bidding engine — concurrent live auctions across 4 sports, sub-200ms response time." },
      { id: 'hl-dashboards', icon: 'server', stat: '1,000+', title: 'Production Dashboards & Field Impact', description: "Ship React Native features and React JS admin dashboards at Mitti Labs' Collect, connecting 1,000+ registered farmers to ground ops." },
    ],
    about: {
      photo: 'assets/homeprofilepic.jpg',
      photoPath: null, // GitHub repo path for the uploaded file, used to delete/replace it later
      quickFacts: { location: 'Bhavnagar, Gujarat, India', focus: 'Flutter & React Native', experience: '2+ years' },
      bio: [
        "I build production mobile and web experiences — Flutter and React Native apps, React JS dashboards — and I care as much about a feature shipping without breaking as I do about it looking right.",
        "2+ years, 5+ apps live on the Play Store and App Store, zero critical post-launch failures. I graduated with a B.Tech in Information Technology (8.66 CGPA) and haven't stopped shipping since.",
      ],
      mission: 'To build production-ready mobile experiences that solve real problems, ship without critical failures, and make technology easier to use.',
      resumeSummary: 'Software Engineer with 2+ years of experience building and shipping production mobile applications in Flutter and React Native, plus internal dashboards in React JS. Delivered 5+ apps live on Play Store and App Store with zero critical post-launch failures, using BLoC/Provider/GetX for state management and REST/WebSocket APIs for real-time features. Testing discipline (80%+ coverage) cut post-release bugs 40%, while reusable component architecture reduced delivery time 20%. Comfortable owning a feature from requirement through store release.',
      technicalSkills: [
        { category: 'Languages', items: 'Dart, JavaScript, TypeScript, HTML, CSS' },
        { category: 'Mobile', items: 'Flutter SDK, React Native, Android, iOS' },
        { category: 'Frontend (Web)', items: 'React JS' },
        { category: 'State Mgmt', items: 'BLoC, Provider, GetX, Riverpod, Redux' },
        { category: 'Backend/APIs', items: 'REST API, WebSocket, Firebase (Auth, Firestore, Storage, FCM), PHP, MySQL' },
        { category: 'Testing', items: 'Unit, Integration, Widget Testing (flutter_test), Jest' },
        { category: 'Architecture', items: 'Clean Architecture, Modular App Design, Code Review' },
        { category: 'Release/DevOps', items: 'Play Console & App Store Connect, TestFlight, Signing/Provisioning, ASO, GitHub Actions (CI/CD), Git' },
        { category: 'AI-Assisted Dev', items: 'GitHub Copilot, Claude Code, ChatGPT, Cursor AI (supporting debugging & code review)' },
      ],
      experience: [
        {
          id: 'exp-mitti',
          company: 'Mitti Labs',
          role: 'Software Engineer',
          period: 'Jun 2026 – Present',
          bullets: [
            'Build, test, and ship core mobile features using React Native, focused on usability and ease of use for end users.',
            'Build and maintain internal Mitti Labs admin dashboards in React JS, launching features that support ground ops teams and members.',
            'Collaborate with cross-functional product and engineering teams in an Agile environment to plan, build, and release features.',
          ],
          tags: ['React Native', 'React JS', 'Agile'],
        },
        {
          id: 'exp-freelance',
          company: 'Freelance / Independent Client Projects',
          role: 'Software Engineer',
          period: 'Mar 2026 – Jun 2026',
          bullets: [
            "Provided end-to-end support for a client's e-commerce mobile app (Flutter, PHP) — including performance enhancements and core feature development.",
            "Directly managed and completed Play Store and App Store listing processes for the client's app.",
            'Applied AI-assisted workflows to speed up debugging and delivery under client timelines.',
          ],
          tags: ['Flutter', 'PHP', 'App Store Release'],
        },
        {
          id: 'exp-milople',
          company: 'Milople Technologies',
          role: 'Software Engineer',
          period: 'Aug 2024 – Mar 2026',
          intro: 'Owned full SDLC — requirements through architecture, development, testing, and Play Store / App Store release — across 5+ production Flutter apps.',
          bullets: [
            'Architected and delivered 5+ Flutter apps end-to-end, reducing average delivery time 20% through reusable component design.',
            'Built scalable, testable app architectures (BLoC, Provider, GetX) with 80%+ test coverage, cutting post-release bugs 40% — zero critical post-launch failures across releases.',
            'Optimized app performance (25% faster launch, sustained 60fps) and owned the release lifecycle end-to-end — signing, provisioning, ASO, and store submissions.',
          ],
          tags: ['Flutter', 'BLoC', 'Provider', 'GetX'],
        },
        {
          id: 'exp-softwingz',
          company: 'Softwingz Infotech',
          role: 'Flutter Developer Intern',
          period: 'Jun 2024 – Aug 2024',
          bullets: [
            'Started learning Flutter development as an intern — practiced UI implementation and Provider state management under mentorship.',
            'Practiced Firebase integration (Auth, Firestore, FCM) and REST API integration in a guided learning environment.',
            'Used AI coding assistants to support learning; explored pub.dev packages and Agile workflows.',
          ],
          tags: ['Flutter', 'Firebase', 'Provider'],
        },
      ],
    },
    contact: {
      email: 'shubhamshah9097@gmail.com',
      whatsapp: '+91-8200495373',
      linkedin: 'https://www.linkedin.com/in/shubhamshah2413/',
      github: 'https://github.com/shahshubham9090',
      availability: 'Open to Relocation, Hybrid & WFH | Immediate Joiner',
      intro: "I'm actively interviewing and can start immediately — happy to walk you through my Flutter, React Native, or React JS work.",
      formEndpoint: 'https://formspree.io/f/xjyvpzev', // Formspree endpoint the Contact form posts to; editable via Admin Panel
    },
    expertise: [
      {
        id: 'exp-area-mobile',
        icon: 'mobile',
        title: 'Mobile App Development',
        description: 'Cross-platform apps built with Flutter and React Native — architected for scale, tested to 80%+ coverage, and released to the Play Store and App Store.',
        tags: ['Flutter', 'React Native', 'BLoC', 'Provider', 'GetX'],
        inPractice: '5+ production apps shipped live, zero critical post-launch failures.',
      },
      {
        id: 'exp-area-web',
        icon: 'layers',
        title: 'Web Dashboards (React JS)',
        description: 'Internal admin tools and dashboards built in React JS, TypeScript, and JavaScript — the operational layer that keeps a mobile product running.',
        tags: ['React JS', 'JavaScript', 'TypeScript'],
        inPractice: "Built and maintain Mitti Labs' internal admin dashboards for ground ops teams and members.",
      },
      {
        id: 'exp-area-backend',
        icon: 'link',
        title: 'Backend, APIs & Real-Time',
        description: 'REST APIs, WebSockets, and Firebase (Auth, Firestore, FCM) wired up for real-time data sync, push notifications, and authentication end-to-end.',
        tags: ['REST API', 'WebSocket', 'Firebase', 'MySQL', 'PHP'],
        inPractice: "TheBidNow's real-time WebSocket bidding engine — concurrent live auctions, sub-200ms response time.",
      },
      {
        id: 'exp-area-quality',
        icon: 'rocket',
        title: 'Testing, Architecture & AI-Assisted Delivery',
        description: 'Clean, modular architecture backed by real test coverage, and AI coding tools (Claude Code, Copilot, Cursor AI) used deliberately to move faster without cutting corners.',
        tags: ['Clean Architecture', 'Jest', 'flutter_test', 'Claude Code'],
        inPractice: '80%+ test coverage cut post-release bugs 40%; AI-assisted workflows cut debugging time 30%.',
      },
    ],
    portfolio: [
      { id: 'collect',            title: 'Collect',               category: 'mobile', accent: '#2FBF71', description: 'A React Native app at Mitti Labs connecting 1,000+ registered farmers to a carbon-monitoring and sustainability-tracking workflow.', caseStudy: 'Own core features on Collect, Mitti Labs’ production React Native app for farmer-facing carbon monitoring. Diagnosed and resolved ANR issues via Sentry/Crashlytics, improving stability on the low-end Android devices this user base actually carries.', techStack: ['React Native', 'Firebase'], thumbnail: 'assets/thumbnails/collect.jpg', thumbnailPath: null, playStoreUrl: 'https://play.google.com/store/apps/details?id=com.mitticollect', githubUrl: null },
      { id: 'thebidnow',          title: 'TheBidNow',              category: 'api',    accent: '#FF5C33', description: 'The real-time WebSocket bidding engine powering concurrent live auctions across 4 sports, with sub-200ms response time and OTP auth.', caseStudy: 'TheBidNow needed live bidding across 4 sports to feel instant, not laggy. I built the WebSocket bidding engine from scratch — sub-200ms response time, OTP authentication, and predictable BLoC state management across simultaneous auction sessions.', techStack: ['Flutter', 'WebSocket', 'Firebase', 'MySQL', 'BLoC'], thumbnail: 'assets/thumbnails/thebidnow.jpg', thumbnailPath: null, playStoreUrl: 'https://play.google.com/store/apps/details?id=com.thebidnow.auction&hl=en', githubUrl: null },
      { id: 'amulya-mica',        title: 'Amulya Mica Visualizer', category: 'design', accent: '#E0A458', description: 'An AR-style product visualization experience at 60fps, reducing purchase-stage drop-off with an interactive preview.', caseStudy: 'Built for Amulya Mica so customers could preview mica sheet products interactively before buying. Sustained 60fps on the live preview, directly reducing drop-off at the purchase stage.', techStack: ['Flutter', 'Firebase', 'Provider'], thumbnail: 'assets/thumbnails/amulya-mica.jpg', thumbnailPath: null, playStoreUrl: 'https://play.google.com/store/apps/details?id=com.amulyamicavisualizer.amulyamicavisualizer', githubUrl: null },
      { id: 'satvvaahar',         title: 'Satvvaahar',             category: 'mobile', accent: '#E2543A', description: 'A food-ordering app with real-time push notifications and order/profile state management.', caseStudy: 'Shipped end-to-end at Milople — real-time push notifications for order status, with order/profile state management built to stay predictable under everyday ordering edge cases.', techStack: ['Flutter', 'Firebase', 'MySQL', 'PHP'], thumbnail: 'assets/thumbnails/satvvaahar.jpg', thumbnailPath: null, playStoreUrl: 'https://play.google.com/store/apps/details?id=com.milople.satvaahar&hl=en', githubUrl: null },
      { id: 'spjym',              title: 'SPJYM',                  category: 'mobile', accent: '#6C7BFF', description: 'A community-events app (Shree Prarthna Jain Yuvak Mandal) with real-time push notifications and profile state management.', caseStudy: 'Built for a real, active community user base — real-time push notifications and profile state management for event sign-ups and updates.', techStack: ['Flutter', 'Firebase', 'MySQL', 'PHP'], thumbnail: 'assets/thumbnails/spjym.jpg', thumbnailPath: null, playStoreUrl: 'https://play.google.com/store/apps/details?id=com.spjym.shreeprarthnajainyuvak&hl=en', githubUrl: null },
      { id: 'magento-app',        title: 'Magento Mobile App',     category: 'mobile', accent: '#3D8BFF', description: 'An e-commerce app on the Magento REST API with product browsing, cart, and an integration-tested checkout flow.', caseStudy: 'Built directly on the Magento REST API — product browsing, cart, and a checkout flow covered with integration tests before it shipped.', techStack: ['Flutter', 'Magento REST API'], thumbnail: 'assets/thumbnails/magento-app.jpg', thumbnailPath: null, playStoreUrl: 'https://play.google.com/store/apps/details?id=com.milople.milople&hl=en', githubUrl: null },
      { id: 'notenest',           title: 'NoteNest',               category: 'mobile', accent: '#14B8A6', description: 'An offline-first notes app built solo with Provider and Hive, demonstrating clean architecture and local storage.', caseStudy: 'A solo side project written to demonstrate clean architecture and local-storage design end-to-end, with no backend to lean on.', techStack: ['Flutter', 'Provider', 'Hive'], thumbnail: 'assets/thumbnails/notenest.jpg', thumbnailPath: null, playStoreUrl: null, githubUrl: 'https://github.com/shahshubham9090/flutter-notenest-app' },
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
      // before a new field was introduced doesn't lose that field —
      // arrays/primitives still fully replace, only plain objects
      // (site/hero/about/contact) merge their direct keys
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
    tileSVG,
  };
})();
