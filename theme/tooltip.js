// docusaurus-plugin-terminology/theme/tooltip.js
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
// We dynamically load tippy at runtime to avoid bundling/version conflicts
// between the demo's debug loader and the bundled tippy. getTippy() returns
// a Promise resolving to the tippy factory function.
function getTippy() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.__terminology_tippy) return Promise.resolve(window.__terminology_tippy);
  if (window.tippy) {
    window.__terminology_tippy = window.tippy;
    return Promise.resolve(window.tippy);
  }
  return new Promise((resolve) => {
    // load CSS
    if (!document.querySelector('link[data-terminology-tippy]')) {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = 'https://unpkg.com/tippy.js@6/dist/tippy.css';
      l.setAttribute('data-terminology-tippy', '1');
      document.head.appendChild(l);
    }
    // load script
    if (!document.querySelector('script[data-terminology-tippy]')) {
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/tippy.js@6/dist/tippy.umd.min.js';
      s.async = true;
      s.setAttribute('data-terminology-tippy', '1');
      s.onload = () => {
        window.__terminology_tippy = window.tippy;
        resolve(window.tippy);
      };
      s.onerror = () => { resolve(window.tippy || null); };
      document.head.appendChild(s);
    } else {
      const existing = document.querySelector('script[data-terminology-tippy]');
      existing.onload = () => { window.__terminology_tippy = window.tippy; resolve(window.tippy); };
      existing.onerror = () => resolve(window.tippy || null);
    }
  });
}

if (ExecutionEnvironment.canUseDOM) {
  function initTooltips() {
    try { window.__terminologyInitCount = (window.__terminologyInitCount || 0) + 1; console.info('[terminology] initTooltips start (#' + window.__terminologyInitCount + ')'); } catch (e) {}
    const locale = document.documentElement.lang || 'en';
    const pluginData = window.Docusaurus && window.Docusaurus.__pluginGlobalData && window.Docusaurus.__pluginGlobalData['docusaurus-plugin-terminology'] ? window.Docusaurus.__pluginGlobalData['docusaurus-plugin-terminology'] : {};
    let terms = (pluginData && pluginData.terms && pluginData.terms[locale]) ? pluginData.terms[locale] : {};
    const routeBasePath = (pluginData && pluginData.routeBasePath) ? pluginData.routeBasePath : '/terms/';

    // mark anchors that point to terms
    document.querySelectorAll('a[href]').forEach((a) => {
      let href;
      try { href = a.getAttribute('href'); if (!href) return; } catch (e) { return; }
      try { console.info('[terminology] considering anchor', href); } catch (e) {}
      if (a.classList.contains('term-tooltip')) return;
      // normalize href relative to origin
      const cleaned = href.replace(window.location.origin, '');
      if (!(cleaned.includes(routeBasePath) || cleaned.includes('/terms') || cleaned.match(/(^|\/)terms(?=\/|$)/))) return;
      // derive slug heuristically
      let slug = cleaned;
      if (slug.indexOf(routeBasePath) !== -1) slug = slug.split(routeBasePath).pop();
      slug = slug.replace(/^\/+|\/+$/g, '');
      if (slug.indexOf('/') !== -1) slug = slug.split('/').pop();
      if (!slug) return;
      a.classList.add('term-tooltip');
      a.dataset.term = slug;
      try { console.info('[terminology] marked anchor', href, '->', slug); } catch (e) {}
    });

    // Simple serialization guard + retry/backoff for tippy attach.
    // This is non-invasive: it prevents concurrent attach runs and
    // retries a few times if tippy/popper throws (notably applyStyles
    // TypeErrors observed in the wild). The goal is to harden runtime
    // behaviour without changing markup or server transforms.
    let __terminology_isAttaching = false;
    const __terminology_attachSeq = { v: 0 };

    const attach = async (termsSource, opts = {}) => {
      const retries = typeof opts.retries === 'number' ? opts.retries : 4;
      const baseDelay = typeof opts.baseDelay === 'number' ? opts.baseDelay : 120;
      // If another attach is running, schedule a re-run later and return.
      if (__terminology_isAttaching) {
        try { console.info('[terminology] attach already running, scheduling retry'); } catch (e) {}
        setTimeout(() => { attach(termsSource, opts); }, baseDelay);
        return;
      }
      __terminology_isAttaching = true;
      const mySeq = ++__terminology_attachSeq.v;
      try {
        let attempt = 0;
        while (attempt < retries) {
          let attached = 0;
          const tippyFn = await getTippy();
          try {
            // iterate anchors and attach; if any tippy call throws we
            // catch it below and retry the whole batch with backoff.
            document.querySelectorAll('.term-tooltip').forEach((el) => {
              const slug = el.dataset.term;
              const info = termsSource && termsSource[slug];
              if (!info) return;
              if (el._tippy) return; // already initialized
              if (!tippyFn) return;
              // individual tippy attach wrapped to surface synchronous
              // errors (some tippy builds throw immediately).
              try {
                tippyFn(el, {
                  content: info.description,
                  allowHTML: true,
                  theme: 'material',
                  placement: 'top-end',
                  delay: [100, 50],
                  maxWidth: 300,
                });
                attached += 1;
              } catch (e) {
                // rethrow to trigger batch-level retry/backoff
                throw e;
              }
            });
            try { console.info('[terminology] attached tooltips', attached, 'seq', mySeq, 'attempt', attempt + 1); } catch (e) {}
            break; // success - exit retry loop
          } catch (err) {
            attempt += 1;
            try { console.info('[terminology] tippy attach attempt failed', err && err.message, 'attempt', attempt, 'seq', mySeq); } catch (e) {}
            if (attempt >= retries) {
              try { console.info('[terminology] giving up attach after', attempt, 'attempts'); } catch (e) {}
              break;
            }
            const wait = Math.round(baseDelay * Math.pow(1.6, attempt));
            await new Promise((r) => setTimeout(r, wait));
            // continue to next attempt
          }
        }
      } finally {
        __terminology_isAttaching = false;
      }
    };

    attach(terms);

    if (!terms || Object.keys(terms).length === 0) {
      const fallbackPath = '/docusaurus-plugin-terminology-glossary.json';
      try { console.info('[terminology] fetching fallback glossary', fallbackPath); } catch (e) {}
      const fetchWithRetry = (url, attempts = 3, delay = 300) => new Promise((resolve, reject) => {
        const run = (n) => {
          fetch(url).then((r) => { if (!r.ok) throw new Error('no fallback glossary'); return r.json(); }).then(resolve).catch((err) => {
            if (n <= 1) return reject(err);
            setTimeout(() => run(n - 1), delay * 1.5);
          });
        };
        run(attempts);
      });
      fetchWithRetry(fallbackPath, 3, 300).then((json) => { attach(json || {}); }).catch(() => { /* ignore */ });
    }
    try { console.info('[terminology] initTooltips end (#' + window.__terminologyInitCount + ')'); } catch (e) {}
  }

  // initial run
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initTooltips();
  } else {
    document.addEventListener('DOMContentLoaded', initTooltips);
  }

  // history instrumentation for SPA navigation
  (function () {
    const _push = history.pushState;
    const _replace = history.replaceState;
    history.pushState = function () { const res = _push.apply(this, arguments); window.dispatchEvent(new Event('locationchange')); return res; };
    history.replaceState = function () { const res = _replace.apply(this, arguments); window.dispatchEvent(new Event('locationchange')); return res; };
    window.addEventListener('popstate', () => window.dispatchEvent(new Event('locationchange')));
  })();

  let initTimer = null;
  function scheduleInit(delay = 150) {
    if (initTimer) clearTimeout(initTimer);
    initTimer = setTimeout(() => { initTooltips(); initTimer = null; }, delay);
  }

  window.addEventListener('locationchange', () => { try { console.info('[terminology] locationchange'); } catch (e) {} scheduleInit(150); });

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if ((m.addedNodes && m.addedNodes.length > 0) || m.type === 'characterData' || m.type === 'attributes') {
        try { console.info('[terminology] mutation observed (' + m.type + '), scheduling init'); } catch (e) {}
        scheduleInit(100);
        return;
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true });

  const sidebar = document.querySelector('.theme-doc-sidebar-container');
  if (sidebar) {
    sidebar.addEventListener('click', (ev) => {
      try { console.info('[terminology] sidebar click detected, scheduling init'); } catch (e) {}
      scheduleInit(200);
    });
  }

  // Force-run window: aggressively re-run initTooltips repeatedly for a
  // short window after a navigation click. This complements mutation
  // observers in cases where DOM updates are batched or applied in-place.
  let forceHandle = null;
  function forceAttachWindow(duration = 5000, interval = 200) {
    if (forceHandle) return;
    let elapsed = 0;
    try { console.info('[terminology] starting force attach window'); } catch (e) {}
    forceHandle = setInterval(() => {
      try { initTooltips(); } catch (e) {}
      elapsed += interval;
      if (elapsed >= duration) {
        clearInterval(forceHandle);
        forceHandle = null;
        try { console.info('[terminology] stopping force attach window'); } catch (e) {}
      }
    }, interval);
  }

  // start force window on sidebar clicks and locationchange events
  if (sidebar) sidebar.addEventListener('click', () => forceAttachWindow(6000, 200));
  window.addEventListener('locationchange', () => forceAttachWindow(4000, 250));

  // Small visible badge to help debugging when console is filtered. It shows
  // how many times initTooltips has run. Non-intrusive and removed on unload.
  try {
    const badge = document.createElement('div');
    badge.id = '__terminology_badge';
    badge.style.position = 'fixed';
    badge.style.right = '8px';
    badge.style.bottom = '8px';
    badge.style.zIndex = '999999';
    badge.style.padding = '4px 8px';
    badge.style.background = 'rgba(0,0,0,0.6)';
    badge.style.color = 'white';
    badge.style.borderRadius = '6px';
    badge.style.fontSize = '12px';
    badge.style.fontFamily = 'sans-serif';
    badge.innerText = 'Terminology: 0';
    document.body.appendChild(badge);
    const upd = () => {
      try { const n = window.__terminologyInitCount || 0; badge.innerText = 'Terminology: ' + n; } catch (e) {}
      requestAnimationFrame(upd);
    };
    requestAnimationFrame(upd);
    window.addEventListener('beforeunload', () => { try { badge.remove(); } catch (e) {} });
  } catch (e) {
    // ignore DOM errors
  }

  document.addEventListener('click', (ev) => {
    try {
      const target = ev.target && ev.target.closest ? ev.target.closest('a') : null;
      if (!target) return;
      const href = target.getAttribute && target.getAttribute('href');
      if (!href) return;
      if (href.startsWith('http') && !href.startsWith(window.location.origin)) return;
      try { console.info('[terminology] link click detected', href); } catch (e) {}
      scheduleInit(150);
    } catch (e) {
      // swallow
    }
  }, true);

  function retryAttach(retries = 5, delay = 100) {
    let attempt = 0;
    const run = () => {
      try { initTooltips(); } catch (e) {}
      attempt += 1;
      if (attempt < retries) setTimeout(run, delay * Math.pow(1.5, attempt));
    };
    run();
  }

  window.addEventListener('locationchange', () => retryAttach(6, 80));

  let pollHandle = null;
  function periodicAttachWindow(duration = 8000, interval = 400) {
    if (pollHandle) return;
    let elapsed = 0;
    try { console.info('[terminology] starting periodic attach window'); } catch (e) {}
    pollHandle = setInterval(() => {
      try { initTooltips(); } catch (e) {}
      elapsed += interval;
      if (elapsed >= duration) {
        clearInterval(pollHandle);
        pollHandle = null;
        try { console.info('[terminology] stopping periodic attach window'); } catch (e) {}
      }
    }, interval);
  }

  periodicAttachWindow(5000, 300);
}
