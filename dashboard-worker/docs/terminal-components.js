/**
 * 🔥 Fire22 Terminal Components JavaScript Library
 * Interactive functionality and utilities for terminal-styled components
 *
 * @version 1.0.0
 * @author Fire22 Development Team
 * @requires terminal-framework.css, terminal-components.css
 */

class TerminalComponents {
  constructor(options = {}) {
    this.options = {
      theme: 'fire22',
      animations: true,
      realTime: false,
      autoRefresh: false,
      debug: false,
      ...options,
    };

    this.components = new Map();
    this.intervals = new Map();
    this.notifications = [];

    this.initialize();
  }

  /**
   * Initialize the terminal components system
   */
  initialize() {
    this.log('Initializing Terminal Components...');

    // Set up global event listeners
    this.setupGlobalEvents();

    // Initialize all components on the page
    this.initializeComponents();

    // Set up real-time updates if enabled
    if (this.options.realTime) {
      this.startRealTimeUpdates();
    }

    // Set up auto-refresh if enabled
    if (this.options.autoRefresh) {
      this.startAutoRefresh();
    }

    this.log('Terminal Components initialized successfully');
  }

  /**
   * Set up global event listeners
   */
  setupGlobalEvents() {
    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      this.handleKeyboardShortcuts(e);
    });

    // Window resize handling
    window.addEventListener('resize', () => {
      this.handleResize();
    });

    // Theme toggle
    document.addEventListener('click', e => {
      if (e.target.matches('[data-terminal-theme-toggle]')) {
        this.toggleTheme();
      }
    });

    // Component interactions
    document.addEventListener('click', e => {
      this.handleComponentClick(e);
    });
  }

  /**
   * Initialize all components on the page
   */
  initializeComponents() {
    // Initialize progress bars
    this.initializeProgressBars();

    // Initialize status dots
    this.initializeStatusDots();

    // Initialize buttons
    this.initializeButtons();

    // Initialize cards
    this.initializeCards();

    // Initialize forms
    this.initializeForms();

    // Initialize tables
    this.initializeTables();
  }

  /**
   * Initialize progress bar components
   */
  initializeProgressBars() {
    const progressBars = document.querySelectorAll('.terminal-progress__fill');

    progressBars.forEach((bar, index) => {
      const progress = parseFloat(bar.getAttribute('data-progress')) || 0;
      const progressBar = new TerminalProgressBar(bar, {
        value: progress,
        animated: this.options.animations,
      });

      this.components.set(`progress-${index}`, progressBar);
    });
  }

  /**
   * Initialize status dot components
   */
  initializeStatusDots() {
    const statusDots = document.querySelectorAll('.terminal-status-dot');

    statusDots.forEach((dot, index) => {
      const statusDot = new TerminalStatusDot(dot, {
        animated: this.options.animations,
      });

      this.components.set(`status-${index}`, statusDot);
    });
  }

  /**
   * Initialize button components
   */
  initializeButtons() {
    const buttons = document.querySelectorAll('.terminal-btn');

    buttons.forEach((button, index) => {
      const terminalButton = new TerminalButton(button, {
        rippleEffect: this.options.animations,
      });

      this.components.set(`button-${index}`, terminalButton);
    });
  }

  /**
   * Initialize card components
   */
  initializeCards() {
    const cards = document.querySelectorAll('.terminal-card');

    cards.forEach((card, index) => {
      const terminalCard = new TerminalCard(card, {
        interactive: card.classList.contains('terminal-card--interactive'),
        animated: this.options.animations,
      });

      this.components.set(`card-${index}`, terminalCard);
    });
  }

  /**
   * Initialize form components
   */
  initializeForms() {
    const forms = document.querySelectorAll('.terminal-form');

    forms.forEach((form, index) => {
      const terminalForm = new TerminalForm(form);
      this.components.set(`form-${index}`, terminalForm);
    });
  }

  /**
   * Initialize table components
   */
  initializeTables() {
    const tables = document.querySelectorAll('.terminal-table');

    tables.forEach((table, index) => {
      const terminalTable = new TerminalTable(table, {
        sortable: table.hasAttribute('data-sortable'),
        filterable: table.hasAttribute('data-filterable'),
      });

      this.components.set(`table-${index}`, terminalTable);
    });
  }

  /**
   * Handle keyboard shortcuts
   */
  handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + K: Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      this.focusSearch();
    }

    // Escape: Close modals/notifications
    if (e.key === 'Escape') {
      this.closeNotifications();
    }

    // Ctrl/Cmd + R: Refresh components
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      if (this.options.realTime) {
        e.preventDefault();
        this.refreshComponents();
      }
    }
  }

  /**
   * Handle window resize
   */
  handleResize() {
    // Debounce resize handling
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.components.forEach(component => {
        if (component.handleResize) {
          component.handleResize();
        }
      });
    }, 250);
  }

  /**
   * Handle component clicks
   */
  handleComponentClick(e) {
    const target = e.target.closest('[data-terminal-action]');
    if (!target) return;

    const action = target.getAttribute('data-terminal-action');
    const componentId = target.getAttribute('data-terminal-component');

    this.executeAction(action, componentId, target);
  }

  /**
   * Execute component action
   */
  executeAction(action, componentId, element) {
    switch (action) {
      case 'refresh':
        this.refreshComponent(componentId);
        break;
      case 'toggle':
        this.toggleComponent(componentId);
        break;
      case 'update':
        this.updateComponent(componentId, element.getAttribute('data-value'));
        break;
      case 'notify':
        this.notify(element.getAttribute('data-message'), element.getAttribute('data-type'));
        break;
      default:
        this.log(`Unknown action: ${action}`);
    }
  }

  /**
   * Update a metric component
   */
  updateMetric(id, value, trend = null, status = null) {
    const metricElement =
      document.getElementById(id) || document.querySelector(`[data-metric="${id}"]`);
    if (!metricElement) return;

    // Update value
    const valueElement = metricElement.querySelector('.terminal-metric__value');
    if (valueElement) {
      this.animateValueChange(valueElement, value);
    }

    // Update trend
    if (trend) {
      const trendElement = metricElement.querySelector('.terminal-metric__trend');
      if (trendElement) {
        trendElement.className = `terminal-metric__trend terminal-metric__trend--${trend}`;
        trendElement.textContent =
          this.getTrendIcon(trend) + ' ' + trendElement.textContent.split(' ').slice(1).join(' ');
      }
    }

    // Update status
    if (status) {
      const statusDot = metricElement.querySelector('.terminal-status-dot');
      if (statusDot) {
        statusDot.className = `terminal-status-dot terminal-status-dot--${status}`;
      }
    }
  }

  /**
   * Set progress bar value
   */
  setProgress(id, value, animated = true) {
    const component = this.components.get(id);
    if (component && component instanceof TerminalProgressBar) {
      component.setValue(value, animated);
      return;
    }

    const progressElement =
      document.getElementById(id) || document.querySelector(`[data-progress="${id}"]`);
    if (!progressElement) return;

    const fillElement = progressElement.querySelector('.terminal-progress__fill');
    const valueElement = progressElement.querySelector('.terminal-progress__value');

    if (fillElement) {
      if (animated) {
        fillElement.style.transition = 'width 0.5s ease';
      }
      fillElement.style.width = `${Math.max(0, Math.min(100, value))}%`;
    }

    if (valueElement) {
      valueElement.textContent = `${Math.round(value)}%`;
    }
  }

  /**
   * Show notification
   */
  notify(message, type = 'info', duration = 4000) {
    const notification = new TerminalNotification({
      message,
      type,
      duration,
      onClose: id => {
        this.notifications = this.notifications.filter(n => n.id !== id);
      },
    });

    this.notifications.push(notification);
    notification.show();

    return notification;
  }

  /**
   * Toggle component state
   */
  toggleState(id, state) {
    const element =
      document.getElementById(id) || document.querySelector(`[data-component="${id}"]`);
    if (!element) return;

    element.classList.toggle(`terminal-${state}`);
  }

  /**
   * Start real-time updates
   */
  startRealTimeUpdates() {
    if (this.realTimeInterval) {
      clearInterval(this.realTimeInterval);
    }

    this.realTimeInterval = setInterval(() => {
      this.updateRealTimeComponents();
    }, 3000);
  }

  /**
   * Update real-time components
   */
  updateRealTimeComponents() {
    // Update metrics with simulated data
    const metrics = document.querySelectorAll('.terminal-metric');
    metrics.forEach(metric => {
      if (metric.hasAttribute('data-live')) {
        this.updateLiveMetric(metric);
      }
    });

    // Update status dots
    const statusDots = document.querySelectorAll('.terminal-status-dot[data-live]');
    statusDots.forEach(dot => {
      this.updateLiveStatus(dot);
    });
  }

  /**
   * Update live metric with simulated data
   */
  updateLiveMetric(metricElement) {
    const baseValue = parseFloat(metricElement.getAttribute('data-base-value')) || 100;
    const variation = parseFloat(metricElement.getAttribute('data-variation')) || 10;
    const newValue = baseValue + (Math.random() - 0.5) * variation * 2;

    const valueElement = metricElement.querySelector('.terminal-metric__value');
    if (valueElement) {
      this.animateValueChange(valueElement, Math.round(newValue));
    }
  }

  /**
   * Update live status with rotation
   */
  updateLiveStatus(statusElement) {
    const states = ['active', 'warning', 'error'];
    const currentState = states.find(state =>
      statusElement.classList.contains(`terminal-status-dot--${state}`)
    );
    const currentIndex = states.indexOf(currentState);

    // Mostly stay in current state, occasionally change
    if (Math.random() < 0.1) {
      const newState = states[(currentIndex + 1) % states.length];
      statusElement.className = `terminal-status-dot terminal-status-dot--${newState}`;
    }
  }

  /**
   * Animate value change
   */
  animateValueChange(element, newValue) {
    const currentValue = parseFloat(element.textContent) || 0;
    const difference = newValue - currentValue;
    const steps = 20;
    const stepSize = difference / steps;
    let currentStep = 0;

    const animate = () => {
      if (currentStep < steps) {
        const value = currentValue + stepSize * currentStep;
        element.textContent = Math.round(value);
        currentStep++;
        requestAnimationFrame(animate);
      } else {
        element.textContent = newValue;
      }
    };

    animate();
  }

  /**
   * Get trend icon
   */
  getTrendIcon(trend) {
    const icons = {
      up: '↗',
      down: '↘',
      stable: '→',
    };
    return icons[trend] || '→';
  }

  /**
   * Toggle theme
   */
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('terminal-theme', newTheme);

    this.notify(`Switched to ${newTheme} theme`, 'info');
  }

  /**
   * Focus search input
   */
  focusSearch() {
    const searchInput = document.querySelector(
      'input[type="search"], input[placeholder*="search" i]'
    );
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }

  /**
   * Close all notifications
   */
  closeNotifications() {
    this.notifications.forEach(notification => notification.close());
    this.notifications = [];
  }

  /**
   * Refresh all components
   */
  refreshComponents() {
    this.components.forEach(component => {
      if (component.refresh) {
        component.refresh();
      }
    });

    this.notify('Components refreshed', 'success');
  }

  /**
   * Auto-refresh components
   */
  startAutoRefresh() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }

    this.autoRefreshInterval = setInterval(() => {
      this.refreshComponents();
    }, 30000); // Refresh every 30 seconds
  }

  /**
   * Format number for display
   */
  formatNumber(num, options = {}) {
    const defaults = {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    };

    return new Intl.NumberFormat('en-US', { ...defaults, ...options }).format(num);
  }

  /**
   * Format duration
   */
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Debounce function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Log message (if debug enabled)
   */
  log(...args) {
    if (this.options.debug) {
      console.log('[Terminal Components]', ...args);
    }
  }

  /**
   * Destroy the terminal components instance
   */
  destroy() {
    // Clear intervals
    if (this.realTimeInterval) {
      clearInterval(this.realTimeInterval);
    }
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }

    // Destroy all components
    this.components.forEach(component => {
      if (component.destroy) {
        component.destroy();
      }
    });

    // Clear notifications
    this.closeNotifications();

    this.log('Terminal Components destroyed');
  }
}

/**
 * Terminal Progress Bar Component
 */
class TerminalProgressBar {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      value: 0,
      animated: true,
      ...options,
    };

    this.initialize();
  }

  initialize() {
    this.setValue(this.options.value, false);
  }

  setValue(value, animated = true) {
    const clampedValue = Math.max(0, Math.min(100, value));

    if (animated && this.options.animated) {
      this.element.style.transition = 'width 0.5s ease';
    } else {
      this.element.style.transition = 'none';
    }

    this.element.style.width = `${clampedValue}%`;
    this.element.setAttribute('data-progress', clampedValue);
  }
}

/**
 * Terminal Status Dot Component
 */
class TerminalStatusDot {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      animated: true,
      ...options,
    };
  }

  setStatus(status) {
    // Remove existing status classes
    this.element.classList.remove(
      'terminal-status-dot--active',
      'terminal-status-dot--warning',
      'terminal-status-dot--error',
      'terminal-status-dot--inactive'
    );

    // Add new status class
    this.element.classList.add(`terminal-status-dot--${status}`);
  }
}

/**
 * Terminal Button Component
 */
class TerminalButton {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      rippleEffect: true,
      ...options,
    };

    this.initialize();
  }

  initialize() {
    if (this.options.rippleEffect) {
      this.element.addEventListener('click', e => {
        this.createRipple(e);
      });
    }
  }

  createRipple(e) {
    const ripple = document.createElement('span');
    const rect = this.element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;

    this.element.style.position = 'relative';
    this.element.style.overflow = 'hidden';
    this.element.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
}

/**
 * Terminal Card Component
 */
class TerminalCard {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      interactive: false,
      animated: true,
      ...options,
    };
  }

  setLoading(loading) {
    if (loading) {
      this.element.classList.add('terminal-loading');
    } else {
      this.element.classList.remove('terminal-loading');
    }
  }
}

/**
 * Terminal Form Component
 */
class TerminalForm {
  constructor(element, options = {}) {
    this.element = element;
    this.options = options;

    this.initialize();
  }

  initialize() {
    // Add floating labels
    this.setupFloatingLabels();

    // Add validation
    this.setupValidation();
  }

  setupFloatingLabels() {
    const inputs = this.element.querySelectorAll('.terminal-form__input, .terminal-form__textarea');

    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        input.parentElement.classList.add('terminal-form__group--focused');
      });

      input.addEventListener('blur', () => {
        if (!input.value) {
          input.parentElement.classList.remove('terminal-form__group--focused');
        }
      });

      // Set initial state
      if (input.value) {
        input.parentElement.classList.add('terminal-form__group--focused');
      }
    });
  }

  setupValidation() {
    const inputs = this.element.querySelectorAll(
      '.terminal-form__input[required], .terminal-form__textarea[required]'
    );

    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        this.validateInput(input);
      });
    });
  }

  validateInput(input) {
    const isValid = input.checkValidity();
    const group = input.parentElement;

    if (isValid) {
      group.classList.remove('terminal-form__group--error');
      group.classList.add('terminal-form__group--valid');
    } else {
      group.classList.remove('terminal-form__group--valid');
      group.classList.add('terminal-form__group--error');
    }
  }
}

/**
 * Terminal Table Component
 */
class TerminalTable {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      sortable: false,
      filterable: false,
      ...options,
    };

    this.initialize();
  }

  initialize() {
    if (this.options.sortable) {
      this.setupSorting();
    }

    if (this.options.filterable) {
      this.setupFiltering();
    }
  }

  setupSorting() {
    const headers = this.element.querySelectorAll(
      '.terminal-table__row--header .terminal-table__cell'
    );

    headers.forEach((header, index) => {
      header.style.cursor = 'pointer';
      header.addEventListener('click', () => {
        this.sortColumn(index);
      });
    });
  }

  sortColumn(columnIndex) {
    const table = this.element.querySelector('.terminal-table__table');
    const rows = Array.from(table.querySelectorAll('tbody .terminal-table__row'));

    rows.sort((a, b) => {
      const aText = a.cells[columnIndex].textContent.trim();
      const bText = b.cells[columnIndex].textContent.trim();

      return aText.localeCompare(bText, undefined, { numeric: true });
    });

    const tbody = table.querySelector('tbody');
    rows.forEach(row => tbody.appendChild(row));
  }

  setupFiltering() {
    // Implementation for table filtering
    console.log('Table filtering setup');
  }
}

/**
 * Terminal Notification Component
 */
class TerminalNotification {
  constructor(options = {}) {
    this.options = {
      message: '',
      type: 'info',
      duration: 4000,
      position: 'top-right',
      onClose: null,
      ...options,
    };

    this.id = Date.now() + Math.random();
    this.element = null;

    this.create();
  }

  create() {
    this.element = document.createElement('div');
    this.element.className = `terminal-notification terminal-notification--${this.options.type}`;
    this.element.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--secondary);
            border: 1px solid var(--accent);
            color: var(--text);
            padding: var(--space-4);
            border-radius: var(--border-radius);
            font-family: var(--font-mono);
            font-weight: bold;
            z-index: 1000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            max-width: 400px;
            box-shadow: var(--shadow-lg);
        `;

    // Set type-specific styles
    const typeColors = {
      success: 'var(--success)',
      error: 'var(--danger)',
      warning: 'var(--warning)',
      info: 'var(--accent)',
    };

    this.element.style.borderColor = typeColors[this.options.type] || typeColors.info;

    this.element.innerHTML = `
            <div style="display: flex; align-items: center; gap: var(--space-2);">
                <span style="color: ${typeColors[this.options.type]};">
                    ${this.getTypeIcon()}
                </span>
                <span>${this.options.message}</span>
                <button style="
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                    margin-left: auto;
                    font-size: 1.2em;
                ">×</button>
            </div>
        `;

    // Add close button event
    const closeBtn = this.element.querySelector('button');
    closeBtn.addEventListener('click', () => this.close());

    document.body.appendChild(this.element);
  }

  getTypeIcon() {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    };
    return icons[this.options.type] || icons.info;
  }

  show() {
    requestAnimationFrame(() => {
      this.element.style.opacity = '1';
      this.element.style.transform = 'translateX(0)';
    });

    if (this.options.duration > 0) {
      this.autoCloseTimeout = setTimeout(() => {
        this.close();
      }, this.options.duration);
    }
  }

  close() {
    if (this.autoCloseTimeout) {
      clearTimeout(this.autoCloseTimeout);
    }

    this.element.style.opacity = '0';
    this.element.style.transform = 'translateX(100%)';

    setTimeout(() => {
      if (this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }

      if (this.options.onClose) {
        this.options.onClose(this.id);
      }
    }, 300);
  }
}

// Add CSS animations via JavaScript if not already present
if (!document.querySelector('#terminal-animations')) {
  const style = document.createElement('style');
  style.id = 'terminal-animations';
  style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
        
        .terminal-loading::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(88, 166, 255, 0.1) 10px,
                rgba(88, 166, 255, 0.1) 20px
            );
            animation: loading-stripes 1s linear infinite;
        }
        
        @keyframes loading-stripes {
            0% { background-position: 0 0; }
            100% { background-position: 28px 0; }
        }
        
        .terminal-form__group--focused .terminal-form__label {
            transform: translateY(-8px) scale(0.85);
            color: var(--accent);
        }
        
        .terminal-form__group--error .terminal-form__input,
        .terminal-form__group--error .terminal-form__textarea {
            border-color: var(--danger);
        }
        
        .terminal-form__group--valid .terminal-form__input,
        .terminal-form__group--valid .terminal-form__textarea {
            border-color: var(--success);
        }
    `;
  document.head.appendChild(style);
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.terminalComponents = new TerminalComponents();
  });
} else {
  window.terminalComponents = new TerminalComponents();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TerminalComponents;
}
