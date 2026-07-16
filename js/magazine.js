/**
 * INFANTE MX — Digital Magazine
 * Main application module
 *
 * Architecture: Module pattern with clear separation of concerns
 *   - Config      : static configuration
 *   - PageRegistry: page data management
 *   - UIController: DOM interactions & rendering
 *   - FlipEngine  : StPageFlip wrapper
 *   - App         : orchestrator / entry point
 */

'use strict';

/* ============================================================
   CONFIG — Static application configuration
   ============================================================ */
const Config = Object.freeze({
  TOTAL_PAGES: 46,
  PAGE_WIDTH:  400,
  PAGE_HEIGHT: 566,

  PAGES_DIR:   'assets/pages/',
  PAGE_PREFIX: 'page-',
  PAGE_EXT:    '.jpg',

  FLIP_DURATION: 900,      // ms
  DRAW_SHADOW:   true,
  SHOW_COVER:    true,
  USE_PORTRAIT:  true,
  MOBILE_SCROLL: false,

  THUMBNAIL_VISIBLE: false,
});

/* ============================================================
   PAGE REGISTRY — Manages page metadata and image paths
   ============================================================ */
const PageRegistry = (() => {
  /**
   * Pad a number to 2 digits: 1 → "01"
   * @param {number} n
   * @returns {string}
   */
  function pad(n) {
    return String(n).padStart(2, '0');
  }

  /**
   * Build the image src for a given 1-based page number.
   * @param {number} pageNum  1-based
   * @returns {string}
   */
  function getImageSrc(pageNum) {
    return `${Config.PAGES_DIR}${Config.PAGE_PREFIX}${pad(pageNum)}${Config.PAGE_EXT}`;
  }

  /**
   * Return an array of all page descriptors.
   * @returns {Array<{index: number, src: string, label: string}>}
   */
  function getAll() {
    return Array.from({ length: Config.TOTAL_PAGES }, (_, i) => {
      const num = i + 1;
      return {
        index: i,
        src: getImageSrc(num),
        label: num === 1 ? 'Portada'
             : num === Config.TOTAL_PAGES ? 'Contraportada'
             : `Pág. ${num}`,
      };
    });
  }

  return { getImageSrc, getAll };
})();

/* ============================================================
   UI CONTROLLER — DOM access and rendering helpers
   ============================================================ */
const UIController = (() => {
  // Cached DOM references
  const dom = {};

  function init() {
    dom.loadingScreen   = document.getElementById('loading-screen');
    dom.loadingBar      = document.getElementById('loading-bar');
    dom.book            = document.getElementById('book');
    dom.btnPrev         = document.getElementById('btn-prev');
    dom.btnNext         = document.getElementById('btn-next');
    dom.btnFirst        = document.getElementById('btn-first');
    dom.btnLast         = document.getElementById('btn-last');
    dom.btnThumbs       = document.getElementById('btn-thumbs');
    dom.btnFullscreen   = document.getElementById('btn-fullscreen');
    dom.counterCurrent  = document.getElementById('counter-current');
    dom.counterTotal    = document.getElementById('counter-total');
    dom.thumbDrawer     = document.getElementById('thumb-drawer');
    dom.thumbStrip      = document.getElementById('thumb-strip');
    dom.overlay         = document.getElementById('overlay');
    dom.btnCloseDrawer  = document.getElementById('btn-close-drawer');

    // Set static total
    dom.counterTotal.textContent = Config.TOTAL_PAGES;
  }

  /**
   * Build page <img> elements inside #book for StPageFlip.loadFromHTML.
   */
  function renderPageElements() {
    const pages = PageRegistry.getAll();
    const fragment = document.createDocumentFragment();

    pages.forEach(({ index, src, label }) => {
      const div = document.createElement('div');
      div.className = 'page';
      // Hard pages for cover & back cover
      if (index === 0 || index === Config.TOTAL_PAGES - 1) {
        div.setAttribute('data-density', 'hard');
      }

      const img = document.createElement('img');
      img.src = src;
      img.alt = label;
      img.className = 'page-image';
      img.loading = 'lazy';
      img.draggable = false;

      div.appendChild(img);
      fragment.appendChild(div);
    });

    dom.book.appendChild(fragment);
  }

  /**
   * Build thumbnail strip items.
   * @param {function(number): void} onThumbClick  callback with 0-based page index
   */
  function renderThumbnails(onThumbClick) {
    const pages = PageRegistry.getAll();
    const fragment = document.createDocumentFragment();

    pages.forEach(({ index, src, label }) => {
      const item = document.createElement('div');
      item.className = 'thumb';
      item.dataset.index = index;
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', `Ir a ${label}`);
      item.tabIndex = 0;

      const img = document.createElement('img');
      img.src = src;
      img.alt = label;
      img.loading = 'lazy';

      const lbl = document.createElement('span');
      lbl.className = 'thumb__label';
      lbl.textContent = index + 1;

      item.appendChild(img);
      item.appendChild(lbl);
      fragment.appendChild(item);

      const handler = () => onThumbClick(index);
      item.addEventListener('click', handler);
      item.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') handler(); });
    });

    dom.thumbStrip.appendChild(fragment);
  }

  /**
   * Update counter and highlight active thumbnail.
   * @param {number} pageIndex  0-based current page
   */
  function updateState(pageIndex) {
    dom.counterCurrent.textContent = pageIndex + 1;

    // Disable prev/next buttons at boundaries
    dom.btnPrev.disabled  = pageIndex <= 0;
    dom.btnNext.disabled  = pageIndex >= Config.TOTAL_PAGES - 1;
    dom.btnFirst.disabled = pageIndex <= 0;
    dom.btnLast.disabled  = pageIndex >= Config.TOTAL_PAGES - 1;

    // Highlight active thumbnail
    dom.thumbStrip.querySelectorAll('.thumb').forEach((el) => {
      el.classList.toggle('is-active', Number(el.dataset.index) === pageIndex);
    });

    // Scroll active thumb into view (non-blocking)
    const activeThumb = dom.thumbStrip.querySelector('.thumb.is-active');
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  /**
   * Update loading bar progress (0–100).
   * @param {number} pct
   */
  function setLoadingProgress(pct) {
    if (dom.loadingBar) dom.loadingBar.style.width = `${pct}%`;
  }

  /** Hide loading screen */
  function hideLoadingScreen() {
    if (dom.loadingScreen) dom.loadingScreen.classList.add('is-hidden');
  }

  /** Toggle thumbnail drawer */
  function setDrawerOpen(open) {
    dom.thumbDrawer.classList.toggle('is-open', open);
    dom.overlay.classList.toggle('is-visible', open);
  }

  /** Toggle fullscreen */
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  return {
    init,
    renderPageElements,
    renderThumbnails,
    updateState,
    setLoadingProgress,
    hideLoadingScreen,
    setDrawerOpen,
    toggleFullscreen,
    dom,
  };
})();

/* ============================================================
   FLIP ENGINE — StPageFlip wrapper
   ============================================================ */
const FlipEngine = (() => {
  let pageFlip = null;
  let isMobile = window.innerWidth <= 768;

  function getPageFlipConfig() {
    const mobile = window.innerWidth <= 768;

    return {
      width: mobile ? 280 : 400,
      height: mobile ? 396 : 566,

      size: "stretch",

      minWidth: 220,
      maxWidth: 400,

      minHeight: 311,
      maxHeight: 566,

      drawShadow: Config.DRAW_SHADOW,
      flippingTime: Config.FLIP_DURATION,
      showCover: Config.SHOW_COVER,
      usePortrait: true,
      mobileScrollSupport: true,
      maxShadowOpacity: 0.5,
      startZIndex: 1
    };
  }

  function destroy() {
    if (pageFlip) {
        pageFlip.destroy();
        pageFlip = null;
    }
  }

  /**
   * Initialise StPageFlip on the #book element.
   * @param {function(number): void} onFlip  callback with new 0-based page index
   */
  function init(onFlip) {
    if (typeof St === 'undefined' || !St.PageFlip) {
      console.error('[FlipEngine] StPageFlip library not found.');
      return;
    }

    pageFlip = new St.PageFlip(document.getElementById('book'),getPageFlipConfig());

    // Load pages from HTML
    pageFlip.loadFromHTML(document.querySelectorAll('#book .page'));

    // Register flip event
    pageFlip.on('flip', (e) => {
      if (typeof onFlip === 'function') onFlip(e.data);
    });
  }

  function flipNext()  { pageFlip?.flipNext('bottom'); }
  function flipPrev()  { pageFlip?.flipPrev('bottom'); }
  function flipFirst() { pageFlip?.turnToPage(0); }
  function flipLast()  { pageFlip?.turnToPage(Config.TOTAL_PAGES - 1); }

  /**
   * Flip to a specific 0-based page index.
   * @param {number} index
   */
  function flipTo(index) {
    pageFlip?.flip(index, 'bottom');
  }

  function getCurrentPage() {
    return pageFlip?.getCurrentPageIndex() ?? 0;
  }

  return { init, destroy, flipNext, flipPrev, flipFirst, flipLast, flipTo, getCurrentPage };
})();

/* ============================================================
   APP — Orchestrator / entry point
   ============================================================ */
const App = (() => {
  let isDrawerOpen = false;

  function handleFlip(pageIndex) {
    UIController.updateState(pageIndex);
  }

  function handleThumbClick(index) {
    FlipEngine.flipTo(index);
    closeDrawer();
  }

  function openDrawer() {
    isDrawerOpen = true;
    UIController.setDrawerOpen(true);
  }

  function closeDrawer() {
    isDrawerOpen = false;
    UIController.setDrawerOpen(false);
  }

  function toggleDrawer() {
    isDrawerOpen ? closeDrawer() : openDrawer();
  }

  /**
   * Simulate a loading progress bar while images preload.
   */
  function simulateLoading() {
    return new Promise((resolve) => {
      let pct = 0;
      const interval = setInterval(() => {
        pct += Math.random() * 18 + 5;
        if (pct >= 100) {
          pct = 100;
          clearInterval(interval);
          UIController.setLoadingProgress(100);
          setTimeout(resolve, 350);
        } else {
          UIController.setLoadingProgress(pct);
        }
      }, 120);
    });
  }

  function bindEvents() {
    const { dom } = UIController;
    window.addEventListener("resize", () => {

    const mobile = window.innerWidth <= 768;

    if (mobile === isMobile)
        return;

    isMobile = mobile;

    const current = FlipEngine.getCurrentPage();

    FlipEngine.destroy();

    document.getElementById("book").innerHTML = "";

    UIController.renderPageElements();

    FlipEngine.init(handleFlip);

    FlipEngine.flipTo(current);

    UIController.updateState(current);

    });


    dom.btnNext.addEventListener('click', () => FlipEngine.flipNext());
    dom.btnPrev.addEventListener('click', () => FlipEngine.flipPrev());
    dom.btnFirst.addEventListener('click', () => FlipEngine.flipFirst());
    dom.btnLast.addEventListener('click', () => FlipEngine.flipLast());
    dom.btnThumbs.addEventListener('click', toggleDrawer);
    dom.btnFullscreen.addEventListener('click', UIController.toggleFullscreen);
    dom.btnCloseDrawer.addEventListener('click', closeDrawer);
    dom.overlay.addEventListener('click', closeDrawer);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
          FlipEngine.flipNext(); break;
        case 'ArrowLeft':
        case 'PageUp':
          FlipEngine.flipPrev(); break;
        case 'Home':
          FlipEngine.flipFirst(); break;
        case 'End':
          FlipEngine.flipLast(); break;
        case 'Escape':
          if (isDrawerOpen) closeDrawer(); break;
      }
    });
  }

  async function start() {
    UIController.init();
    UIController.renderPageElements();
    UIController.renderThumbnails(handleThumbClick);

    await simulateLoading();

    FlipEngine.init(handleFlip);
    UIController.updateState(0);
    UIController.hideLoadingScreen();
    bindEvents();
  }

  return { start };
})();

/* ── Bootstrap ── */
document.addEventListener('DOMContentLoaded', () => App.start());
