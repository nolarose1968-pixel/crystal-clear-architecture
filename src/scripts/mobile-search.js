/**
 * Mobile Search Functionality
 * Handles mobile-specific search and navigation features
 */

class MobileSearch {
  constructor() {
    this.mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    this.mobileMenu = document.getElementById('mobile-menu');
    this.mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    this.mobileMenuClose = document.getElementById('mobile-menu-close');

    this.init();
  }

  init() {
    if (this.mobileMenuToggle && this.mobileMenu && this.mobileMenuOverlay) {
      this.setupEventListeners();
    }
  }

  setupEventListeners() {
    // Mobile menu toggle
    this.mobileMenuToggle.addEventListener('click', () => {
      this.toggleMobileMenu();
    });

    // Mobile menu close
    if (this.mobileMenuClose) {
      this.mobileMenuClose.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    }

    // Overlay click to close
    this.mobileMenuOverlay.addEventListener('click', () => {
      this.closeMobileMenu();
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeMobileMenu();
      }
    });

    // Close on window resize (desktop breakpoint)
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        this.closeMobileMenu();
      }
    });
  }

  toggleMobileMenu() {
    const isActive = this.mobileMenu.classList.contains('active');

    if (isActive) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  openMobileMenu() {
    this.mobileMenu.classList.add('active');
    this.mobileMenuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Update ARIA attributes
    this.mobileMenuToggle.setAttribute('aria-expanded', 'true');
    this.mobileMenu.setAttribute('aria-hidden', 'false');
  }

  closeMobileMenu() {
    this.mobileMenu.classList.remove('active');
    this.mobileMenuOverlay.classList.remove('active');
    document.body.style.overflow = '';

    // Update ARIA attributes
    this.mobileMenuToggle.setAttribute('aria-expanded', 'false');
    this.mobileMenu.setAttribute('aria-hidden', 'true');
  }
}

// Initialize mobile search when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new MobileSearch();
});

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MobileSearch;
}
