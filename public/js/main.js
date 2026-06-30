/**
 * Ohio Demo 5 — interactions (Persian clone)
 */
(function () {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* Theme */
  function initTheme() {
    const saved = localStorage.getItem('ohio-theme');
    const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefers ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    $$('[data-theme-value]').forEach(b => b.classList.toggle('is-active', b.dataset.themeValue === theme));
    $$('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('ohio-theme', next);
        $$('[data-theme-value]').forEach(b => b.classList.toggle('is-active', b.dataset.themeValue === next));
      });
    });
  }

  /* Custom cursor */
  function initCursor() {
    if (!window.matchMedia('(min-width: 1024px)').matches) return;
    document.body.classList.add('custom-cursor');
    const outer = $('.circle-cursor-outer');
    const inner = $('.circle-cursor-inner');
    if (!outer || !inner) return;

    let x = 0, y = 0, ox = 0, oy = 0;
    document.addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; });
    document.addEventListener('mouseover', e => {
      if (e.target.closest('a, button, .video-button, input, select, textarea')) {
        document.body.classList.add('cursor-hover');
      }
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest('a, button, .video-button, input, select, textarea')) {
        document.body.classList.remove('cursor-hover');
      }
    });

    (function loop() {
      ox += (x - ox) * 0.15;
      oy += (y - oy) * 0.15;
      outer.style.left = ox + 'px';
      outer.style.top = oy + 'px';
      inner.style.left = x + 'px';
      inner.style.top = y + 'px';
      requestAnimationFrame(loop);
    })();
  }

  /* Header scroll */
  function initHeader() {
    const header = $('.header');
    const scrollTop = $('.scroll-top');
    const track = $('.scroll-track');
    const onScroll = () => {
      const y = window.scrollY;
      header?.classList.toggle('is-scrolled', y > 40);
      scrollTop?.classList.toggle('is-visible', y > 400);
      if (track) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        track.style.height = (max > 0 ? (y / max) * 100 : 0) + '%';
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    scrollTop?.addEventListener('click', e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* Menu overlay */
  function initMenu() {
    const overlay = $('#menu-overlay');
    const open = () => { overlay?.classList.add('is-open'); document.body.style.overflow = 'hidden'; };
    const close = () => { overlay?.classList.remove('is-open'); document.body.style.overflow = ''; };
    $$('[data-menu-open]').forEach(b => b.addEventListener('click', open));
    $$('[data-menu-close]').forEach(b => b.addEventListener('click', close));
    $('.menu-overlay .overlay-bg')?.addEventListener('click', close);
  }

  /* Accordion */
  function initAccordion() {
    $$('.accordion-item').forEach(item => {
      const trigger = $('.accordion-trigger', item);
      const panel = $('.accordion-panel', item);
      trigger?.addEventListener('click', () => {
        const open = item.classList.contains('is-open');
        $$('.accordion-item.is-open').forEach(i => {
          i.classList.remove('is-open');
          const p = $('.accordion-panel', i);
          if (p) p.style.maxHeight = '0';
        });
        if (!open) {
          item.classList.add('is-open');
          if (panel) panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      });
    });
  }

  /* Tabs (pricing + reviews) */
  const sliderRefreshers = [];

  function refreshSliders() {
    sliderRefreshers.forEach(refresh => refresh());
  }

  function initSliders() {
    sliderRefreshers.length = 0;
    $$('[data-slider]').forEach(root => {
      const viewport = $('.content-slider-viewport', root);
      const track = $('.content-slider-track', root);
      const prev = $('.content-slider-btn.-prev', root);
      const next = $('.content-slider-btn.-next', root);
      const dotsWrap = $('.content-slider-dots', root);
      let index = 0;

      const slides = () => $$('.content-slider-slide', track);
      const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
      const shouldActivate = () => isMobile() || slides().length > 2;
      const getPerView = () => (isMobile() ? 1 : Math.min(2, slides().length));
      const getMaxIndex = () => Math.max(0, slides().length - getPerView());

      const buildDots = () => {
        if (!dotsWrap) return;
        dotsWrap.innerHTML = '';
        const max = getMaxIndex();
        for (let i = 0; i <= max; i++) {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'content-slider-dot' + (i === index ? ' is-active' : '');
          dot.setAttribute('aria-label', `اسلاید ${i + 1}`);
          dot.addEventListener('click', () => { index = i; update(); });
          dotsWrap.appendChild(dot);
        }
      };

      const update = () => {
        const active = shouldActivate();
        const perView = getPerView();
        const slideEls = slides();
        root.classList.toggle('is-slider-active', active);
        root.classList.toggle('is-per-view-2', active && perView === 2);

        if (!active || !slideEls.length) {
          track.style.transform = '';
          if (prev) prev.disabled = true;
          if (next) next.disabled = true;
          if (dotsWrap) dotsWrap.innerHTML = '';
          return;
        }

        const max = getMaxIndex();
        index = Math.min(index, max);
        buildDots();

        const gap = parseFloat(getComputedStyle(track).gap) || 16;
        const slideWidth = slideEls[0].getBoundingClientRect().width;
        const isRtl = getComputedStyle(document.documentElement).direction === 'rtl';
        const offset = index * (slideWidth + gap);
        track.style.transform = `translate3d(${isRtl ? offset : -offset}px, 0, 0)`;

        if (prev) prev.disabled = index <= 0;
        if (next) next.disabled = index >= max;
      };

      prev?.addEventListener('click', () => { index = Math.max(0, index - 1); update(); });
      next?.addEventListener('click', () => { index = Math.min(getMaxIndex(), index + 1); update(); });

      let touchStartX = 0;
      viewport?.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
      }, { passive: true });
      viewport?.addEventListener('touchend', e => {
        if (!shouldActivate()) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) < 40) return;
        const isRtl = getComputedStyle(document.documentElement).direction === 'rtl';
        if (isRtl) {
          if (dx > 0) index = Math.min(getMaxIndex(), index + 1);
          else index = Math.max(0, index - 1);
        } else {
          if (dx < 0) index = Math.min(getMaxIndex(), index + 1);
          else index = Math.max(0, index - 1);
        }
        update();
      }, { passive: true });

      update();
      sliderRefreshers.push(update);
    });

    window.addEventListener('resize', refreshSliders, { passive: true });
  }

  function initTabs() {
    $$('.tabs').forEach((tabsRoot) => {
      const nav = $('.tabs-nav', tabsRoot);
      if (!nav) return;
      const btns = $$('button', nav);
      const line = $('.tabs-nav-line', nav);
      const panels = $$(':scope > .tab-panel', tabsRoot);
      if (!btns.length || !panels.length) return;

      const activate = (index) => {
        btns.forEach((b, i) => b.classList.toggle('is-active', i === index));
        panels.forEach((p, i) => p.classList.toggle('is-active', i === index));
        if (line && btns[index]) {
          const btn = btns[index];
          line.style.width = btn.offsetWidth + 'px';
          line.style.right = (nav.offsetWidth - btn.offsetLeft - btn.offsetWidth) + 'px';
          line.style.left = 'auto';
        }
        requestAnimationFrame(refreshSliders);
      };

      btns.forEach((btn, i) => btn.addEventListener('click', () => activate(i)));
      activate(btns.findIndex(b => b.classList.contains('is-active')) || 0);
      window.addEventListener('resize', () => {
        const active = btns.findIndex(b => b.classList.contains('is-active'));
        if (active >= 0) activate(active);
      }, { passive: true });
    });
  }

  /* Counters */
  function initCounters() {
    const run = (el) => {
      const target = parseInt(el.dataset.counter, 10);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const numEl = el.querySelector('.number') || el.querySelector('.cta-stat-value') || el;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / 2000, 1);
        const val = Math.floor((1 - Math.pow(1 - p, 3)) * target);
        numEl.textContent = prefix + val.toLocaleString('fa-IR') + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { run(e.target); obs.unobserve(e.target); }
      });
    }, { threshold: 0.3 });

    $$('[data-counter]').forEach(c => obs.observe(c));
  }

  /* Progress bar */
  function initProgress() {
    const bars = $$('[data-progress]');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const bar = $('.progress-bar', e.target);
          const pct = e.target.dataset.progress;
          if (bar) bar.style.width = pct + '%';
          const percent = $('.percent', e.target);
          if (percent) {
            let v = 0;
            const step = () => {
              v = Math.min(v + 2, parseInt(pct));
              percent.textContent = v;
              if (v < parseInt(pct)) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          }
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    bars.forEach(b => obs.observe(b));
  }

  /* Countdown */
  function initCountdown() {
    const el = $('[data-countdown]');
    if (!el) return;
    const target = new Date(el.dataset.countdown).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      [['days', d], ['hours', h], ['minutes', m], ['seconds', s]].forEach(([k, v]) => {
        const node = $(`[data-cd-${k}]`, el);
        if (node) node.textContent = String(v).padStart(2, '0');
      });
    };
    tick();
    setInterval(tick, 1000);
  }

  /* Cookie */
  function initCookie() {
    const n = $('.notification');
    if (!n || localStorage.getItem('ohio-cookie')) return;
    setTimeout(() => n.classList.add('is-visible'), 1500);
    $('[data-cookie-close]')?.addEventListener('click', () => {
      localStorage.setItem('ohio-cookie', '1');
      n.classList.remove('is-visible');
    });
  }

  /* Anchors */
  function initAnchors() {
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (id === '#') return;
        const t = $(id);
        if (t) {
          e.preventDefault();
          const off = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) * 16 + 16;
          window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - off, behavior: 'smooth' });
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initCursor();
    initHeader();
    initMenu();
    initAccordion();
    initSliders();
    initTabs();
    initCounters();
    initProgress();
    initCountdown();
    initCookie();
    initAnchors();
  });
})();
