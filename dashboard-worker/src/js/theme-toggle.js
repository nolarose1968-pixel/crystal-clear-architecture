/**
 * Fire22 Dashboard Theme Toggle System
 * Handles dark/light mode with system preference detection and manual override
 */

class ThemeToggle {
  constructor() {
    this.STORAGE_KEY = 'fire22-theme-preference';
    this.THEMES = {
      LIGHT: 'light',
      DARK: 'dark',
      SYSTEM: 'system',
    };

    this.currentTheme = null;
    this.systemPreference = null;
    this.toggleButton = null;

    this.init();
  }

  /**
   * Initialize the theme toggle system
   */
  init() {
    // Detect system preference
    this.detectSystemPreference();

    // Load saved preference or use system default
    this.loadThemePreference();

    // Apply the initial theme
    this.applyTheme();

    // Set up event listeners
    this.setupEventListeners();

    // Create toggle button if it doesn't exist
    this.createToggleButton();
  }

  /**
   * Detect system color scheme preference
   */
  detectSystemPreference() {
    if (window.matchMedia) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemPreference = darkModeQuery.matches ? this.THEMES.DARK : this.THEMES.LIGHT;

      // Listen for system theme changes
      darkModeQuery.addEventListener('change', e => {
        this.systemPreference = e.matches ? this.THEMES.DARK : this.THEMES.LIGHT;

        // If user is using system theme, update automatically
        if (this.currentTheme === this.THEMES.SYSTEM) {
          this.applyTheme();
        }
      });
    }
  }

  /**
   * Load theme preference from localStorage
   */
  loadThemePreference() {
    const saved = localStorage.getItem(this.STORAGE_KEY);

    if (saved && Object.values(this.THEMES).includes(saved)) {
      this.currentTheme = saved;
    } else {
      // Default to system preference
      this.currentTheme = this.THEMES.SYSTEM;
    }
  }

  /**
   * Save theme preference to localStorage
   */
  saveThemePreference() {
    localStorage.setItem(this.STORAGE_KEY, this.currentTheme);
  }

  /**
   * Apply the current theme to the document
   */
  applyTheme() {
    const effectiveTheme = this.getEffectiveTheme();

    // Remove existing theme attributes
    document.documentElement.removeAttribute('data-theme');
    document.body.classList.remove('dark-mode', 'light-mode');

    // Apply new theme
    if (effectiveTheme === this.THEMES.DARK) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.classList.add('light-mode');
    }

    // Update toggle button appearance
    this.updateToggleButton();

    // Dispatch custom event for other components
    window.dispatchEvent(
      new CustomEvent('theme-changed', {
        detail: { theme: effectiveTheme, userPreference: this.currentTheme },
      })
    );
  }

  /**
   * Get the effective theme (resolving system preference if needed)
   */
  getEffectiveTheme() {
    if (this.currentTheme === this.THEMES.SYSTEM) {
      return this.systemPreference || this.THEMES.LIGHT;
    }
    return this.currentTheme;
  }

  /**
   * Toggle between themes
   */
  toggle() {
    const effectiveTheme = this.getEffectiveTheme();

    // Cycle through: light -> dark -> system
    if (effectiveTheme === this.THEMES.LIGHT) {
      this.currentTheme = this.THEMES.DARK;
    } else if (effectiveTheme === this.THEMES.DARK) {
      this.currentTheme = this.THEMES.SYSTEM;
    } else {
      this.currentTheme = this.THEMES.LIGHT;
    }

    this.saveThemePreference();
    this.applyTheme();
  }

  /**
   * Set theme directly
   */
  setTheme(theme) {
    if (Object.values(this.THEMES).includes(theme)) {
      this.currentTheme = theme;
      this.saveThemePreference();
      this.applyTheme();
    }
  }

  /**
   * Create the toggle button UI
   */
  createToggleButton() {
    // Check if button already exists
    if (document.getElementById('theme-toggle-btn')) {
      this.toggleButton = document.getElementById('theme-toggle-btn');
      return;
    }

    // Create button container
    const button = document.createElement('button');
    button.id = 'theme-toggle-btn';
    button.className = 'theme-toggle';
    button.setAttribute('aria-label', 'Toggle theme');
    button.setAttribute('title', 'Toggle theme (current: ' + this.getEffectiveTheme() + ')');

    // Create icons
    button.innerHTML = `
      <span class="theme-toggle-icon theme-icon-light">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      </span>
      <span class="theme-toggle-icon theme-icon-dark">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </span>
      <span class="theme-toggle-text"></span>
    `;

    // Add click handler
    button.addEventListener('click', () => this.toggle());

    // Append to body
    document.body.appendChild(button);
    this.toggleButton = button;

    // Update initial state
    this.updateToggleButton();
  }

  /**
   * Update toggle button appearance
   */
  updateToggleButton() {
    if (!this.toggleButton) return;

    const textElement = this.toggleButton.querySelector('.theme-toggle-text');
    if (textElement) {
      const effectiveTheme = this.getEffectiveTheme();
      let displayText = '';

      if (this.currentTheme === this.THEMES.SYSTEM) {
        displayText = `System (${effectiveTheme})`;
      } else {
        displayText = effectiveTheme.charAt(0).toUpperCase() + effectiveTheme.slice(1);
      }

      textElement.textContent = displayText;
      this.toggleButton.setAttribute('title', `Toggle theme (current: ${displayText})`);
    }
  }

  /**
   * Set up keyboard shortcuts and other event listeners
   */
  setupEventListeners() {
    // Keyboard shortcut: Ctrl/Cmd + Shift + L
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  /**
   * Create a settings modal for theme preferences
   */
  createSettingsModal() {
    const modal = document.createElement('div');
    modal.className = 'theme-settings-modal';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <h2>Theme Settings</h2>
        <div class="theme-options">
          <label>
            <input type="radio" name="theme" value="light" ${this.currentTheme === this.THEMES.LIGHT ? 'checked' : ''}>
            <span>Light</span>
          </label>
          <label>
            <input type="radio" name="theme" value="dark" ${this.currentTheme === this.THEMES.DARK ? 'checked' : ''}>
            <span>Dark</span>
          </label>
          <label>
            <input type="radio" name="theme" value="system" ${this.currentTheme === this.THEMES.SYSTEM ? 'checked' : ''}>
            <span>System (${this.systemPreference})</span>
          </label>
        </div>
        <button class="close-modal">Close</button>
      </div>
    `;

    // Handle radio button changes
    modal.querySelectorAll('input[name="theme"]').forEach(input => {
      input.addEventListener('change', e => {
        this.setTheme(e.target.value);
      });
    });

    // Handle close button
    modal.querySelector('.close-modal').addEventListener('click', () => {
      modal.remove();
    });

    // Handle overlay click
    modal.querySelector('.modal-overlay').addEventListener('click', () => {
      modal.remove();
    });

    document.body.appendChild(modal);
  }

  /**
   * Get current theme information
   */
  getThemeInfo() {
    return {
      userPreference: this.currentTheme,
      effectiveTheme: this.getEffectiveTheme(),
      systemPreference: this.systemPreference,
    };
  }
}

// Initialize theme toggle when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.themeToggle = new ThemeToggle();
  });
} else {
  window.themeToggle = new ThemeToggle();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeToggle;
}
