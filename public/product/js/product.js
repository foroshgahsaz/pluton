(function () {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const galleryImages = [
    'images/oh_product1.01.webp',
    'images/oh_product1.02.webp',
    'images/oh_product1.03.webp',
    'images/oh_product1.04.webp',
    'images/oh_product1.05.webp',
  ];

  let lightboxIndex = 0;
  let selectedColor = 'red';
  let selectedStore = 'covina';

  const priceMap = {
    'red-covina': 49000,
    'black-covina': 49000,
    'red-san-diego': 59000,
    'black-san-diego': 59000,
  };

  function formatPrice(n) {
    return n.toLocaleString('fa-IR');
  }

  function getPrice() {
    return priceMap[`${selectedColor}-${selectedStore}`] || 49000;
  }

  function updatePrice() {
    const price = getPrice();
    const el = $('#price-current');
    const sticky = $('#sticky-price');
    if (el) el.textContent = formatPrice(price);
    if (sticky) sticky.textContent = formatPrice(price) + ' تومان';
    const max = $('#price-max');
    if (max && selectedStore === 'san-diego') max.textContent = formatPrice(59000);
    else if (max) max.textContent = formatPrice(49000);
  }

  function updateMainImage(src) {
    const main = $('#main-image');
    if (main && src) main.src = src;
  }

  /* Mobile menu */
  function initMenu() {
    const menu = $('#mobile-menu');
    $$('[data-menu-open]').forEach(btn => btn.addEventListener('click', () => menu?.classList.add('is-open')));
    $$('[data-menu-close]').forEach(btn => btn.addEventListener('click', () => menu?.classList.remove('is-open')));
  }

  /* Variations */
  function initVariations() {
    $$('[data-variation="color"] .swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('[data-variation="color"] .swatch').forEach(s => s.classList.remove('is-active'));
        btn.classList.add('is-active');
        selectedColor = btn.dataset.value;
        if (btn.dataset.image) updateMainImage(btn.dataset.image);
        updatePrice();
      });
    });

    $$('[data-variation="store"] .swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('[data-variation="store"] .swatch').forEach(s => s.classList.remove('is-active'));
        btn.classList.add('is-active');
        selectedStore = btn.dataset.value;
        updatePrice();
      });
    });

    $('#reset-variations')?.addEventListener('click', () => {
      selectedColor = 'red';
      selectedStore = 'covina';
      $$('[data-variation] .swatch').forEach(s => s.classList.remove('is-active'));
      $('[data-variation="color"] .swatch[data-value="red"]')?.classList.add('is-active');
      $('[data-variation="store"] .swatch[data-value="covina"]')?.classList.add('is-active');
      updateMainImage('images/oh_product1.01.webp');
      updatePrice();
    });
  }

  /* Quantity */
  function initQuantity() {
    const input = $('#quantity');
    if (!input) return;
    $('[data-qty-minus]')?.addEventListener('click', () => {
      const v = Math.max(1, parseInt(input.value, 10) - 1);
      input.value = v;
    });
    $('[data-qty-plus]')?.addEventListener('click', () => {
      const max = parseInt(input.max, 10) || 295;
      const v = Math.min(max, parseInt(input.value, 10) + 1);
      input.value = v;
    });
  }

  /* Add to cart */
  function initAddToCart() {
    $$('[data-add-cart]').forEach(btn => {
      btn.addEventListener('click', () => {
        const original = btn.textContent;
        btn.textContent = 'به سبد اضافه شد';
        btn.classList.add('is-added');
        setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove('is-added');
        }, 2000);
      });
    });
  }

  /* Wishlist */
  function initWishlist() {
    $('#wishlist-btn')?.addEventListener('click', function () {
      this.classList.toggle('is-active');
      const active = this.classList.contains('is-active');
      this.querySelector('svg')?.setAttribute('fill', active ? 'currentColor' : 'none');
    });
  }

  /* Tabs */
  function initTabs() {
    const root = $('[data-tabs]');
    if (!root) return;
    const btns = $$('.tab-btn', root);
    const panels = $$('.tab-panel', root);
    const line = $('.tabs-nav-line', root);

    const moveLine = (btn) => {
      if (!line || !btn) return;
      const nav = root.querySelector('.tabs-nav');
      const navRect = nav.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      line.style.width = btnRect.width + 'px';
      line.style.insetInlineStart = (btnRect.left - navRect.left) + 'px';
      line.style.insetInlineEnd = 'auto';
    };

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.tab;
        btns.forEach(b => b.classList.toggle('is-active', b === btn));
        panels.forEach(p => p.classList.toggle('is-active', p.dataset.panel === id));
        moveLine(btn);
        if (id === 'shipping') animateProgress();
      });
    });

    moveLine(btns.find(b => b.classList.contains('is-active')));
    window.addEventListener('resize', () => moveLine(btns.find(b => b.classList.contains('is-active'))), { passive: true });
  }

  function animateProgress() {
    $$('.progress-item').forEach((el, i) => {
      setTimeout(() => el.classList.add('is-animated'), i * 150);
    });
  }

  /* Lightbox */
  function initLightbox() {
    const box = $('#lightbox');
    const img = $('#lightbox-img');
    if (!box || !img) return;

    const open = (index) => {
      lightboxIndex = index;
      img.src = galleryImages[lightboxIndex] || galleryImages[0];
      box.classList.add('is-open');
      box.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const close = () => {
      box.classList.remove('is-open');
      box.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    const nav = (dir) => {
      lightboxIndex = (lightboxIndex + dir + galleryImages.length) % galleryImages.length;
      img.src = galleryImages[lightboxIndex];
    };

    $$('.gallery-item').forEach(item => {
      item.addEventListener('click', () => open(parseInt(item.dataset.index, 10) || 0));
    });

    $('[data-lightbox-open]')?.addEventListener('click', () => open(0));
    $('[data-lightbox-close]')?.addEventListener('click', close);
    $('[data-lightbox-prev]')?.addEventListener('click', () => nav(-1));
    $('[data-lightbox-next]')?.addEventListener('click', () => nav(1));

    box.addEventListener('click', (e) => {
      if (e.target === box) close();
    });

    document.addEventListener('keydown', (e) => {
      if (!box.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') nav(1);
      if (e.key === 'ArrowRight') nav(-1);
    });
  }

  /* Sticky bar */
  function initStickyBar() {
    const bar = $('#sticky-bar');
    const gallery = $('.product-gallery');
    if (!bar || !gallery) return;

    const obs = new IntersectionObserver(([e]) => {
      bar.classList.toggle('is-visible', !e.isIntersecting);
    }, { threshold: 0, rootMargin: '-80px 0px 0px 0px' });

    obs.observe(gallery);
  }

  /* Video */
  function initVideo() {
    $('.video-preview')?.addEventListener('click', function () {
      const url = this.dataset.video;
      if (!url) return;
      window.open(url, '_blank', 'noopener');
    });
  }

  /* Init */
  document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    initVariations();
    initQuantity();
    initAddToCart();
    initWishlist();
    initTabs();
    initLightbox();
    initStickyBar();
    initVideo();
    updatePrice();
  });
})();
