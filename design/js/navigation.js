/**
 * navigation.js — pwncorp erp
 * Sidebar toggle, sub-menu expand/collapse, view switching
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'pwncorp_sidebar_state';
  const MOBILE_BP = 768;

  /* ---------------------------------------------------------
     DOM references (populated in init)
     --------------------------------------------------------- */
  let sidebar;
  let overlay;
  let toggleBtn;
  let hamburgerBtn;
  let groups;        // NodeList of expandable group containers
  let navItems;      // NodeList of nav item links

  /* ---------------------------------------------------------
     Helpers
     --------------------------------------------------------- */
  function isMobile() {
    return window.innerWidth <= MOBILE_BP;
  }

  function saveState(collapsed) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ collapsed }));
    } catch (_) { /* storage not available */ }
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { collapsed: false };
    } catch (_) {
      return { collapsed: false };
    }
  }

  /* ---------------------------------------------------------
     Sidebar collapse / expand
     --------------------------------------------------------- */
  function setCollapsed(collapsed) {
    if (isMobile()) return; // collapse is ignored on mobile
    sidebar.classList.toggle('is-collapsed', collapsed);
    saveState(collapsed);
  }

  function toggleSidebar() {
    setCollapsed(sidebar.classList.contains('is-collapsed') === false);
  }

  /* ---------------------------------------------------------
     Mobile overlay open / close
     --------------------------------------------------------- */
  function openMobileSidebar() {
    sidebar.classList.add('is-mobile-open');
    overlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileSidebar() {
    sidebar.classList.remove('is-mobile-open');
    overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
  }

  function toggleMobileSidebar() {
    if (sidebar.classList.contains('is-mobile-open')) {
      closeMobileSidebar();
    } else {
      openMobileSidebar();
    }
  }

  /* ---------------------------------------------------------
     Sub-menu group expand / collapse
     --------------------------------------------------------- */
  function toggleGroup(groupEl) {
    const wasOpen = groupEl.classList.contains('is-open');
    groupEl.classList.toggle('is-open', !wasOpen);
  }

  /* ---------------------------------------------------------
     View switching (SPA-like nav)
     --------------------------------------------------------- */
  function switchView(viewId) {
    // Update active state on nav items
    navItems.forEach(function (item) {
      item.classList.toggle('is-active', item.dataset.view === viewId);
    });

    // Hide all views, show the selected one
    document.querySelectorAll('.view').forEach(function (v) {
      v.hidden = v.id !== viewId;
    });

    // Update page title if there's a data-title attribute on the nav item
    const activeItem = sidebar.querySelector('[data-view="' + viewId + '"]');
    if (activeItem) {
      const title = activeItem.dataset.title || '';
      const pageTitle = document.querySelector('.page-title h1');
      if (pageTitle) {
        pageTitle.textContent = title;
      }
    }

    // Close mobile sidebar after navigation
    if (isMobile()) {
      closeMobileSidebar();
    }

    // Persist last viewed
    try {
      localStorage.setItem('pwncorp_last_view', viewId);
    } catch (_) {}
  }

  /* ---------------------------------------------------------
     Initialise
     --------------------------------------------------------- */
  function init() {
    // Cache DOM
    sidebar     = document.querySelector('.sidebar');
    overlay     = document.querySelector('.sidebar-overlay');
    toggleBtn   = document.querySelector('.sidebar__toggle');
    hamburgerBtn = document.querySelector('.header__hamburger');
    groups      = document.querySelectorAll('.sidebar__group[data-expandable]');
    navItems    = document.querySelectorAll('.sidebar__item[data-view]');

    if (!sidebar) return; // nothing to do

    // Restore collapsed state
    var state = loadState();
    if (!isMobile() && state.collapsed) {
      sidebar.classList.add('is-collapsed');
    }

    // Sidebar toggle button
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        if (isMobile()) {
          toggleMobileSidebar();
        } else {
          toggleSidebar();
        }
      });
    }

    // Mobile hamburger
    if (hamburgerBtn) {
      hamburgerBtn.addEventListener('click', toggleMobileSidebar);
    }

    // Overlay click closes mobile sidebar
    if (overlay) {
      overlay.addEventListener('click', closeMobileSidebar);
    }

    // Sub-menu group toggles
    groups.forEach(function (group) {
      var toggle = group.querySelector('.sidebar__group-toggle');
      if (toggle) {
        toggle.addEventListener('click', function () {
          // On collapsed sidebar, don't expand sub-menus (tooltip could be added later)
          if (!isMobile() && sidebar.classList.contains('is-collapsed')) return;
          toggleGroup(group);
        });
      }
    });

    // Nav item clicks
    navItems.forEach(function (item) {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        switchView(item.dataset.view);
      });
    });

    // Re-evaluate on resize
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (!isMobile()) {
          closeMobileSidebar();
          var saved = loadState();
          sidebar.classList.toggle('is-collapsed', !!saved.collapsed);
        }
      }, 150);
    });

    // Restore last view
    var lastView = localStorage.getItem('pwncorp_last_view');
    if (lastView && document.getElementById(lastView)) {
      switchView(lastView);
    }
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for external use if needed
  window.PwnNav = {
    switchView: switchView,
    toggleSidebar: toggleSidebar,
    openMobileSidebar: openMobileSidebar,
    closeMobileSidebar: closeMobileSidebar
  };
})();
