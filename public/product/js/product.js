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
    const firstThumb = $('.gallery-thumb[data-index="0"] img');
    if (firstThumb && src) firstThumb.src = src;
    const firstSlide = $('.gallery-item[data-index="0"] img');
    if (firstSlide && src) firstSlide.src = src;
    if (galleryImages[0] !== undefined && src) galleryImages[0] = src;
  }

  let gallerySlideIndex = 0;

  /* Gallery thumbs + slider */
  function initGallery() {
    const viewport = $('#gallery-viewport');
    const stack = $('#gallery');
    const thumbsWrap = $('#gallery-thumbs');
    const items = $$('.gallery-item', stack);
    const thumbs = $$('.gallery-thumb', thumbsWrap);
    if (!viewport || !stack || !thumbs.length || !items.length) return;

    let desktopObserver = null;

    function isSliderMode() {
      return window.matchMedia('(max-width: 1024px)').matches;
    }

    function setThumbActive(index) {
      gallerySlideIndex = index;
      thumbs.forEach((t, i) => t.classList.toggle('is-active', i === index));
      const activeThumb = thumbs[index];
      if (activeThumb && isSliderMode()) {
        activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
      }
    }

    function goToSlide(index) {
      if (index < 0 || index >= items.length) return;
      setThumbActive(index);
      const item = items[index];
      if (!item) return;
      if (isSliderMode()) {
        item.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
      } else {
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    function syncFromScroll() {
      if (!isSliderMode()) return;
      const vpRect = viewport.getBoundingClientRect();
      const vpCenter = vpRect.left + vpRect.width / 2;
      let closest = 0;
      let minDist = Infinity;
      items.forEach((item, i) => {
        const r = item.getBoundingClientRect();
        const center = r.left + r.width / 2;
        const dist = Math.abs(center - vpCenter);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      if (closest !== gallerySlideIndex) setThumbActive(closest);
    }

    let scrollTimer;

    function updateDesktopActiveThumb() {
      if (isSliderMode()) return;
      const viewportCenter = window.innerHeight * 0.4;
      let closest = 0;
      let minDist = Infinity;
      items.forEach((item, i) => {
        const r = item.getBoundingClientRect();
        const center = r.top + r.height / 2;
        const dist = Math.abs(center - viewportCenter);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      if (closest !== gallerySlideIndex) setThumbActive(closest);
    }

    function setupDesktopScroll() {
      if (isSliderMode()) return;
      updateDesktopActiveThumb();
    }

    thumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        goToSlide(parseInt(thumb.dataset.index, 10) || 0);
      });
    });

    viewport.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(syncFromScroll, 60);
    }, { passive: true });

    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        if (isSliderMode()) syncFromScroll();
        else updateDesktopActiveThumb();
      }, 80);
    }, { passive: true });

    function onResize() {
      if (isSliderMode()) {
        viewport.scrollLeft = 0;
        goToSlide(gallerySlideIndex);
      } else {
        viewport.scrollLeft = 0;
        setThumbActive(gallerySlideIndex);
        updateDesktopActiveThumb();
      }
    }

    window.addEventListener('resize', onResize, { passive: true });

    setThumbActive(0);
    setupDesktopScroll();

    return { goToSlide, getIndex: () => gallerySlideIndex };
  }

  let galleryApi = null;

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
        if (btn.dataset.image) {
          updateMainImage(btn.dataset.image);
          galleryApi?.goToSlide(0);
        }
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
      gallerySliderApi?.goToSlide(0);
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
      lightboxIndex = typeof index === 'number' ? index : (galleryApi?.getIndex() ?? 0);
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
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.index, 10) || 0;
        if (window.matchMedia('(max-width: 1024px)').matches) {
          galleryApi?.goToSlide(idx);
        }
        open(idx);
      });
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
    galleryApi = initGallery();
    updatePrice();
  });
})();
