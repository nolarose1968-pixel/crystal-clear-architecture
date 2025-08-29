/**
 * 🔥 Fire22 Terminal Components - Browser Polyfills & Feature Detection
 * Polyfills and feature detection for older browsers and unsupported features
 *
 * @version 1.0.0
 * @author Fire22 Development Team
 * @requires terminal-fallbacks.css
 */

(function (window, document) {
  'use strict';

  /**
   * Terminal Browser Compatibility Manager
   * Handles feature detection and applies appropriate fallbacks
   */
  class TerminalPolyfills {
    constructor() {
      this.features = {};
      this.userAgent = navigator.userAgent;
      this.browserInfo = this.detectBrowser();

      this.initialize();
    }

    /**
     * Initialize polyfills and feature detection
     */
    initialize() {
      console.log('🔥 Fire22 Terminal Polyfills initializing...');

      // Run feature detection
      this.detectFeatures();

      // Apply fallback classes
      this.applyFallbacks();

      // Load polyfills
      this.loadPolyfills();

      // Set up monitoring
      this.setupMonitoring();

      console.log('🔥 Terminal Polyfills initialized:', this.features);
    }

    /**
     * Detect browser information
     */
    detectBrowser() {
      const ua = this.userAgent;

      // Browser detection
      const browsers = {
        chrome: /Chrome\/(\d+)/.exec(ua),
        firefox: /Firefox\/(\d+)/.exec(ua),
        safari: /Version\/(\d+).*Safari/.exec(ua),
        edge: /Edg\/(\d+)/.exec(ua),
        ie: /MSIE (\d+)|Trident.*rv:(\d+)/.exec(ua),
      };

      for (const [name, match] of Object.entries(browsers)) {
        if (match) {
          const version = parseInt(match[1] || match[2]);
          return { name, version, isLegacy: this.isLegacyBrowser(name, version) };
        }
      }

      return { name: 'unknown', version: 0, isLegacy: true };
    }

    /**
     * Determine if browser is legacy
     */
    isLegacyBrowser(name, version) {
      const minimumVersions = {
        chrome: 60,
        firefox: 55,
        safari: 12,
        edge: 79,
        ie: Infinity, // IE is always legacy for our purposes
      };

      return version < (minimumVersions[name] || 0);
    }

    /**
     * Detect browser features
     */
    detectFeatures() {
      this.features = {
        // CSS Features
        cssVariables: this.testCSSVariables(),
        flexbox: this.testFlexbox(),
        grid: this.testGrid(),
        transforms: this.testTransforms(),
        animations: this.testAnimations(),
        backdropFilter: this.testBackdropFilter(),

        // Font Features
        customFonts: this.testCustomFonts(),
        boxDrawing: this.testBoxDrawingChars(),
        monospace: this.testMonospaceConsistency(),

        // JavaScript Features
        es6: this.testES6(),
        promises: this.testPromises(),
        fetch: this.testFetch(),
        intersectionObserver: this.testIntersectionObserver(),

        // Performance Features
        requestAnimationFrame: this.testRequestAnimationFrame(),
        passiveEvents: this.testPassiveEvents(),
        webgl: this.testWebGL(),

        // Accessibility Features
        reducedMotion: this.testReducedMotion(),
        highContrast: this.testHighContrast(),
        touchSupport: this.testTouchSupport(),
      };
    }

    /**
     * Test CSS Custom Properties support
     */
    testCSSVariables() {
      try {
        const testElement = document.createElement('div');
        testElement.style.setProperty('--test-var', 'test');
        const computedStyle = getComputedStyle(testElement);
        return computedStyle.getPropertyValue('--test-var') === 'test';
      } catch (e) {
        return false;
      }
    }

    /**
     * Test Flexbox support
     */
    testFlexbox() {
      try {
        const testElement = document.createElement('div');
        testElement.style.display = 'flex';
        return testElement.style.display === 'flex';
      } catch (e) {
        return false;
      }
    }

    /**
     * Test CSS Grid support
     */
    testGrid() {
      try {
        const testElement = document.createElement('div');
        testElement.style.display = 'grid';
        return testElement.style.display === 'grid';
      } catch (e) {
        return false;
      }
    }

    /**
     * Test CSS Transforms support
     */
    testTransforms() {
      try {
        const testElement = document.createElement('div');
        testElement.style.transform = 'translateX(1px)';
        return testElement.style.transform !== '';
      } catch (e) {
        return false;
      }
    }

    /**
     * Test CSS Animations support
     */
    testAnimations() {
      try {
        const testElement = document.createElement('div');
        testElement.style.animation = 'test 1s';
        return testElement.style.animation !== '';
      } catch (e) {
        return false;
      }
    }

    /**
     * Test backdrop-filter support
     */
    testBackdropFilter() {
      try {
        const testElement = document.createElement('div');
        testElement.style.backdropFilter = 'blur(1px)';
        testElement.style.webkitBackdropFilter = 'blur(1px)';
        return (
          testElement.style.backdropFilter !== '' || testElement.style.webkitBackdropFilter !== ''
        );
      } catch (e) {
        return false;
      }
    }

    /**
     * Test custom font loading
     */
    testCustomFonts() {
      return 'fonts' in document && 'load' in document.fonts;
    }

    /**
     * Test box drawing characters rendering
     */
    testBoxDrawingChars() {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) return false;

        ctx.font = '16px monospace';
        const normalWidth = ctx.measureText('M').width;
        const boxWidth = ctx.measureText('╭').width;

        // Box drawing chars should render with similar width to normal chars
        return Math.abs(normalWidth - boxWidth) < 2;
      } catch (e) {
        return false;
      }
    }

    /**
     * Test monospace font consistency
     */
    testMonospaceConsistency() {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) return false;

        ctx.font = '16px monospace';
        const chars = ['M', 'i', 'l', '1'];
        const widths = chars.map(char => ctx.measureText(char).width);

        // All characters should have the same width in monospace
        return widths.every(width => Math.abs(width - widths[0]) < 0.5);
      } catch (e) {
        return false;
      }
    }

    /**
     * Test ES6 support
     */
    testES6() {
      try {
        // Test arrow functions, const/let, template literals
        return (
          typeof Symbol !== 'undefined' &&
          typeof Promise !== 'undefined' &&
          typeof Map !== 'undefined'
        );
      } catch (e) {
        return false;
      }
    }

    /**
     * Test Promise support
     */
    testPromises() {
      return typeof Promise !== 'undefined' && Promise.toString().indexOf('[native code]') !== -1;
    }

    /**
     * Test Fetch API support
     */
    testFetch() {
      return typeof fetch !== 'undefined';
    }

    /**
     * Test Intersection Observer support
     */
    testIntersectionObserver() {
      return 'IntersectionObserver' in window;
    }

    /**
     * Test requestAnimationFrame support
     */
    testRequestAnimationFrame() {
      return typeof requestAnimationFrame !== 'undefined';
    }

    /**
     * Test passive event listeners support
     */
    testPassiveEvents() {
      try {
        let supportsPassive = false;
        const opts = Object.defineProperty({}, 'passive', {
          get: function () {
            supportsPassive = true;
            return true;
          },
        });
        window.addEventListener('test', null, opts);
        window.removeEventListener('test', null, opts);
        return supportsPassive;
      } catch (e) {
        return false;
      }
    }

    /**
     * Test WebGL support
     */
    testWebGL() {
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      } catch (e) {
        return false;
      }
    }

    /**
     * Test reduced motion preference
     */
    testReducedMotion() {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /**
     * Test high contrast preference
     */
    testHighContrast() {
      return window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches;
    }

    /**
     * Test touch support
     */
    testTouchSupport() {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    /**
     * Apply fallback classes based on feature detection
     */
    applyFallbacks() {
      const html = document.documentElement;

      // Apply feature classes
      Object.entries(this.features).forEach(([feature, supported]) => {
        if (supported) {
          html.classList.add(`has-${feature.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
        } else {
          html.classList.add(`no-${feature.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
        }
      });

      // Apply browser-specific classes
      html.classList.add(`browser-${this.browserInfo.name}`);
      html.classList.add(`browser-${this.browserInfo.name}-${this.browserInfo.version}`);

      if (this.browserInfo.isLegacy) {
        html.classList.add('legacy-browser');
      }

      // Apply emergency fallback for very old browsers
      if (this.browserInfo.name === 'ie' && this.browserInfo.version < 11) {
        html.classList.add('terminal-emergency-fallback');
      }
    }

    /**
     * Load necessary polyfills
     */
    loadPolyfills() {
      const polyfills = [];

      // CSS Variables polyfill for IE
      if (!this.features.cssVariables && this.browserInfo.name === 'ie') {
        polyfills.push(this.loadCSSVariablesPolyfill());
      }

      // Flexbox polyfill for very old browsers
      if (!this.features.flexbox) {
        this.applyFlexboxFallbacks();
      }

      // Promise polyfill
      if (!this.features.promises) {
        polyfills.push(this.loadPromisePolyfill());
      }

      // Fetch polyfill
      if (!this.features.fetch) {
        polyfills.push(this.loadFetchPolyfill());
      }

      // requestAnimationFrame polyfill
      if (!this.features.requestAnimationFrame) {
        this.loadAnimationFramePolyfill();
      }

      // Box drawing character fallbacks
      if (!this.features.boxDrawing) {
        this.applyBoxDrawingFallbacks();
      }

      return Promise.all(polyfills);
    }

    /**
     * Load CSS Variables polyfill
     */
    loadCSSVariablesPolyfill() {
      return new Promise(resolve => {
        // Simple CSS variables polyfill for IE
        const style = document.createElement('style');
        style.innerHTML = `
                    .terminal-card { background: #161b22; border: 1px solid #30363d; color: #f0f6fc; }
                    .terminal-btn--primary { background: transparent; border: 1px solid #ff6b35; color: #ff6b35; }
                    .terminal-btn--primary:hover { background: #ff6b35; color: #0d1117; }
                    .terminal-header { background: #161b22; border: 1px solid #58a6ff; }
                    .terminal-title { color: #ff6b35; font-family: 'Courier New', monospace; }
                `;
        document.head.appendChild(style);
        resolve();
      });
    }

    /**
     * Apply flexbox fallbacks
     */
    applyFlexboxFallbacks() {
      const style = document.createElement('style');
      style.innerHTML = `
                .no-flexbox .terminal-header { text-align: center; }
                .no-flexbox .terminal-card__header { display: block; }
                .no-flexbox .terminal-btn { display: inline-block; margin: 4px; }
            `;
      document.head.appendChild(style);
    }

    /**
     * Load Promise polyfill
     */
    loadPromisePolyfill() {
      return new Promise(resolve => {
        if (typeof Promise !== 'undefined') {
          resolve();
          return;
        }

        // Simple Promise polyfill
        window.Promise = function (executor) {
          const self = this;
          self.state = 'pending';
          self.value = undefined;
          self.handlers = [];

          function resolve(result) {
            if (self.state === 'pending') {
              self.state = 'fulfilled';
              self.value = result;
              self.handlers.forEach(handle);
            }
          }

          function reject(error) {
            if (self.state === 'pending') {
              self.state = 'rejected';
              self.value = error;
              self.handlers.forEach(handle);
            }
          }

          function handle(handler) {
            if (self.state === 'pending') {
              self.handlers.push(handler);
            } else {
              if (self.state === 'fulfilled' && typeof handler.onFulfilled === 'function') {
                handler.onFulfilled(self.value);
              }
              if (self.state === 'rejected' && typeof handler.onRejected === 'function') {
                handler.onRejected(self.value);
              }
            }
          }

          this.then = function (onFulfilled, onRejected) {
            return new Promise(function (resolve, reject) {
              handle({
                onFulfilled: function (result) {
                  if (typeof onFulfilled === 'function') {
                    try {
                      resolve(onFulfilled(result));
                    } catch (ex) {
                      reject(ex);
                    }
                  } else {
                    resolve(result);
                  }
                },
                onRejected: function (error) {
                  if (typeof onRejected === 'function') {
                    try {
                      resolve(onRejected(error));
                    } catch (ex) {
                      reject(ex);
                    }
                  } else {
                    reject(error);
                  }
                },
              });
            });
          };

          executor(resolve, reject);
        };

        resolve();
      });
    }

    /**
     * Load Fetch polyfill
     */
    loadFetchPolyfill() {
      return new Promise(resolve => {
        if (typeof fetch !== 'undefined') {
          resolve();
          return;
        }

        // Simple fetch polyfill using XMLHttpRequest
        window.fetch = function (url, options) {
          return new Promise(function (resolve, reject) {
            const xhr = new XMLHttpRequest();
            const method = (options && options.method) || 'GET';

            xhr.open(method, url);

            if (options && options.headers) {
              Object.keys(options.headers).forEach(key => {
                xhr.setRequestHeader(key, options.headers[key]);
              });
            }

            xhr.onload = function () {
              resolve({
                ok: xhr.status >= 200 && xhr.status < 300,
                status: xhr.status,
                statusText: xhr.statusText,
                text: function () {
                  return Promise.resolve(xhr.responseText);
                },
                json: function () {
                  return Promise.resolve(JSON.parse(xhr.responseText));
                },
              });
            };

            xhr.onerror = function () {
              reject(new Error('Network error'));
            };

            xhr.send((options && options.body) || null);
          });
        };

        resolve();
      });
    }

    /**
     * Load requestAnimationFrame polyfill
     */
    loadAnimationFramePolyfill() {
      if (typeof requestAnimationFrame !== 'undefined') return;

      let lastTime = 0;
      const vendors = ['webkit', 'moz'];

      for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x] + 'CancelAnimationFrame'] ||
          window[vendors[x] + 'CancelRequestAnimationFrame'];
      }

      if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (callback) {
          const currTime = new Date().getTime();
          const timeToCall = Math.max(0, 16 - (currTime - lastTime));
          const id = window.setTimeout(function () {
            callback(currTime + timeToCall);
          }, timeToCall);
          lastTime = currTime + timeToCall;
          return id;
        };
      }

      if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (id) {
          clearTimeout(id);
        };
      }
    }

    /**
     * Apply box drawing character fallbacks
     */
    applyBoxDrawingFallbacks() {
      // Replace box drawing characters with ASCII alternatives
      const style = document.createElement('style');
      style.innerHTML = `
                .no-box-drawing .terminal-header::before { content: '+--------------------------------------------------------------------+'; }
                .no-box-drawing .terminal-header::after { content: '+--------------------------------------------------------------------+'; }
                .no-box-drawing .terminal-card::before { content: '+'; }
                .no-box-drawing .terminal-card::after { content: '+'; }
                .no-box-drawing .terminal-btn::before { content: '['; }
                .no-box-drawing .terminal-btn::after { content: ']'; }
            `;
      document.head.appendChild(style);
    }

    /**
     * Set up performance and compatibility monitoring
     */
    setupMonitoring() {
      // Monitor for font loading failures
      if (this.features.customFonts) {
        this.monitorFontLoading();
      }

      // Monitor performance
      this.monitorPerformance();

      // Set up error reporting
      this.setupErrorReporting();
    }

    /**
     * Monitor font loading
     */
    monitorFontLoading() {
      if (!document.fonts) return;

      document.fonts.ready
        .then(() => {
          console.log('🔤 Terminal fonts loaded successfully');
        })
        .catch(error => {
          console.warn('⚠️ Terminal font loading failed:', error);
          document.documentElement.classList.add('no-custom-fonts');
        });
    }

    /**
     * Monitor performance
     */
    monitorPerformance() {
      if (typeof performance === 'undefined') return;

      // Monitor animation performance
      let frameCount = 0;
      let lastTime = performance.now();

      const checkPerformance = () => {
        frameCount++;
        const currentTime = performance.now();

        if (frameCount % 60 === 0) {
          // Check every 60 frames
          const fps = 60000 / (currentTime - lastTime);

          if (fps < 30) {
            console.warn('⚠️ Poor animation performance detected, disabling animations');
            document.documentElement.classList.add('no-animations');
          }

          lastTime = currentTime;
        }

        if (!document.documentElement.classList.contains('no-animations')) {
          requestAnimationFrame(checkPerformance);
        }
      };

      if (this.features.requestAnimationFrame && !this.features.reducedMotion) {
        requestAnimationFrame(checkPerformance);
      }
    }

    /**
     * Set up error reporting
     */
    setupErrorReporting() {
      window.addEventListener('error', event => {
        if (event.filename && event.filename.includes('terminal')) {
          console.error('🔥 Terminal component error:', event.error);

          // Apply emergency fallback if too many errors
          if (!this.errorCount) this.errorCount = 0;
          this.errorCount++;

          if (this.errorCount > 5) {
            console.warn('🚨 Too many terminal errors, applying emergency fallback');
            document.documentElement.classList.add('terminal-emergency-fallback');
          }
        }
      });
    }

    /**
     * Get compatibility report
     */
    getCompatibilityReport() {
      return {
        browser: this.browserInfo,
        features: this.features,
        userAgent: this.userAgent,
        timestamp: new Date().toISOString(),
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          pixelRatio: window.devicePixelRatio,
        },
      };
    }
  }

  // Auto-initialize when DOM is ready
  function initializePolyfills() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        window.terminalPolyfills = new TerminalPolyfills();
      });
    } else {
      window.terminalPolyfills = new TerminalPolyfills();
    }
  }

  // Initialize immediately
  initializePolyfills();

  // Export for module use
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TerminalPolyfills;
  }
})(window, document);
