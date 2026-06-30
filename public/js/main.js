/**
 * ExportOS Landing — Main interactions
 * Vanilla JS, Alpine.js-ready structure
 * @version 1.0.0
 */
(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* --- Theme toggle --- */
  const initTheme = () => {
    const saved = localStorage.getItem('exportos-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeButtons(theme);

    $$('[data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('exportos-theme', next);
        updateThemeButtons(next);
      });
    });
  };

  const updateThemeButtons = (theme) => {
    $$('[data-theme-value]').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.themeValue === theme);
    });
  };

  /* --- Sticky header --- */
  const initHeader = () => {
    const header = $('.header');
    if (!header) return;

    const onScroll = () => {
      header.classList.toggle('header--scrolled', window.scrollY > 50);
      const scrollTop = $('.scroll-top');
      if (scrollTop) {
        scrollTop.classList.toggle('is-visible', window.scrollY > 400);
        const progress = $('.scroll-top__progress');
        if (progress) {
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
          progress.style.height = pct + '%';
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  };

  /* --- Mobile menu --- */
  const initMobileMenu = () => {
    const menu = $('#mobile-menu');
    const openBtn = $('[data-mobile-menu-open]');
    const closeBtn = $('[data-mobile-menu-close]');
    if (!menu) return;

    const open = () => {
      menu.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      menu.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    openBtn?.addEventListener('click', open);
    closeBtn?.addEventListener('click', close);
    $('.mobile-menu__overlay', menu)?.addEventListener('click', close);
    $$('.mobile-menu__nav a', menu).forEach(link => {
      link.addEventListener('click', close);
    });
  };

  /* --- Accordion --- */
  const initAccordion = () => {
    $$('.accordion__item').forEach(item => {
      const trigger = $('.accordion__trigger', item);
      const panel = $('.accordion__panel', item);
      if (!trigger || !panel) return;

      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        $$('.accordion__item.is-open').forEach(openItem => {
          if (openItem !== item) {
            openItem.classList.remove('is-open');
            const p = $('.accordion__panel', openItem);
            if (p) p.style.maxHeight = '0';
            const t = $('.accordion__trigger', openItem);
            if (t) t.setAttribute('aria-expanded', 'false');
          }
        });

        item.classList.toggle('is-open', !isOpen);
        panel.style.maxHeight = !isOpen ? panel.scrollHeight + 'px' : '0';
        trigger.setAttribute('aria-expanded', String(!isOpen));
      });
    });
  };

  /* --- Pricing toggle --- */
  const initPricing = () => {
    const toggle = $('[data-pricing-toggle]');
    const grid = $('.pricing-cards');
    const labels = $$('[data-pricing-label]');
    if (!toggle || !grid) return;

    toggle.addEventListener('click', () => {
      const isYearly = toggle.classList.toggle('is-yearly');
      grid.classList.toggle('pricing-cards--yearly', isYearly);
      labels.forEach(l => {
        l.classList.toggle('is-active', l.dataset.pricingLabel === (isYearly ? 'yearly' : 'monthly'));
      });
    });
  };

  /* --- Counter animation --- */
  const initCounters = () => {
    const counters = $$('[data-counter]');
    if (!counters.length) return;

    const animate = (el) => {
      const target = parseInt(el.dataset.counter, 10);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const duration = 2000;
      const start = performance.now();

      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.floor(eased * target);
        el.textContent = prefix + value.toLocaleString('fa-IR') + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(c => observer.observe(c));
  };

  /* --- Testimonials slider --- */
  const initTestimonials = () => {
    const slider = $('.testimonials-slider');
    const track = $('.testimonials-track', slider);
    const prev = $('[data-testimonial-prev]');
    const next = $('[data-testimonial-next]');
    if (!track) return;

    const cards = $$('.testimonial-card', track);
    let index = 0;

    const getVisible = () => {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    };

    const update = () => {
      const visible = getVisible();
      const maxIndex = Math.max(0, cards.length - visible);
      index = Math.min(index, maxIndex);
      const cardWidth = cards[0]?.offsetWidth || 0;
      track.style.transform = `translateX(${-index * cardWidth}px)`;
    };

    prev?.addEventListener('click', () => {
      index = Math.max(0, index - 1);
      update();
    });

    next?.addEventListener('click', () => {
      const visible = getVisible();
      const maxIndex = Math.max(0, cards.length - visible);
      index = Math.min(maxIndex, index + 1);
      update();
    });

    window.addEventListener('resize', update, { passive: true });
    update();

    // Auto-play
    let autoplay = setInterval(() => {
      const visible = getVisible();
      const maxIndex = Math.max(0, cards.length - visible);
      index = index >= maxIndex ? 0 : index + 1;
      update();
    }, 5000);

    slider?.addEventListener('mouseenter', () => clearInterval(autoplay));
    slider?.addEventListener('mouseleave', () => {
      autoplay = setInterval(() => {
        const visible = getVisible();
        const maxIndex = Math.max(0, cards.length - visible);
        index = index >= maxIndex ? 0 : index + 1;
        update();
      }, 5000);
    });
  };

  /* --- Countdown --- */
  const initCountdown = () => {
    const el = $('[data-countdown]');
    if (!el) return;

    const target = new Date(el.dataset.countdown).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const set = (key, val) => {
        const node = $(`[data-countdown-${key}]`, el);
        if (node) node.textContent = String(val).padStart(2, '0');
      };

      set('days', days);
      set('hours', hours);
      set('minutes', minutes);
      set('seconds', seconds);
    };

    tick();
    setInterval(tick, 1000);
  };

  /* --- Cookie notice --- */
  const initCookie = () => {
    const notice = $('#cookie-notice');
    if (!notice || localStorage.getItem('exportos-cookie-accepted')) return;

    setTimeout(() => notice.classList.add('is-visible'), 2000);

    $('[data-cookie-accept]', notice)?.addEventListener('click', () => {
      localStorage.setItem('exportos-cookie-accepted', '1');
      notice.classList.remove('is-visible');
    });
  };

  /* --- Scroll to top --- */
  const initScrollTop = () => {
    $('.scroll-top')?.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  /* --- Smooth anchor scroll --- */
  const initAnchors = () => {
    $$('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href');
        if (id === '#') return;
        const target = $(id);
        if (target) {
          e.preventDefault();
          const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--subheader-h')) +
                         parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) + 16;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  };

  /* --- Init --- */
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initHeader();
    initMobileMenu();
    initAccordion();
    initPricing();
    initCounters();
    initTestimonials();
    initCountdown();
    initCookie();
    initScrollTop();
    initAnchors();
  });
})();
