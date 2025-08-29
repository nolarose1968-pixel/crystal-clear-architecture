/**
 * 🔐 Enhanced Security Manager for JWT Authentication
 * Implements advanced security features: CSRF protection, input validation, rate limiting, secure storage
 */

class SecurityManager {
  constructor() {
    this.csrfToken = this.generateCSRFToken();
    this.rateLimiter = new RateLimiter();
    this.cacheManager = new CacheManager();
    this.inputValidator = new InputValidator();
    this.tokenStorage = new TokenStorage();
    this.securityHeaders = this.initializeSecurityHeaders();
  }

  /**
   * Generate CSRF token for protection against Cross-Site Request Forgery
   */
  generateCSRFToken() {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  /**
   * Initialize security headers for all requests
   */
  initializeSecurityHeaders() {
    return {
      "X-CSRF-Token": this.csrfToken,
      "X-API-Version": "v1",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "User-Agent": "JWT-Auth-Demo/2.1.0",
    };
  }

  /**
   * Sanitize input to prevent XSS attacks
   */
  sanitizeInput(input) {
    if (typeof input !== "string") return input;

    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
  }

  /**
   * Validate JWT token structure and expiration
   */
  validateToken(token) {
    try {
      if (!token || typeof token !== "string") return false;

      const parts = token.split(".");
      if (parts.length !== 3) return false;

      const payload = JSON.parse(atob(parts[1]));

      // Check required fields
      if (!payload.sub || !payload.iat || !payload.exp) return false;

      // Check expiration
      return payload.exp > Math.floor(Date.now() / 1000);
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  }

  /**
   * Enhanced fetch wrapper with security features
   */
  async secureFetch(url, options = {}) {
    // Check rate limit
    if (!this.rateLimiter.canMakeRequest()) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }

    // Validate URL
    if (!this.inputValidator.validateUrl(url)) {
      throw new Error("Invalid URL provided");
    }

    // Prepare secure headers
    const secureHeaders = { ...this.securityHeaders };

    // Add authorization token if available
    const token = this.tokenStorage.getToken();
    if (token) {
      secureHeaders["Authorization"] = `Bearer ${token}`;
    }

    // Merge with provided headers
    const finalHeaders = {
      ...secureHeaders,
      ...options.headers,
    };

    // Sanitize body if present
    let sanitizedBody = options.body;
    if (options.body && typeof options.body === "string") {
      try {
        const parsed = JSON.parse(options.body);
        const sanitized = this.inputValidator.sanitizeObject(parsed);
        sanitizedBody = JSON.stringify(sanitized);
      } catch (e) {
        // If not JSON, sanitize as string
        sanitizedBody = this.sanitizeInput(options.body);
      }
    }

    const secureOptions = {
      ...options,
      headers: finalHeaders,
      body: sanitizedBody,
      credentials: "include", // Include cookies for session management
    };

    try {
      const response = await fetch(url, secureOptions);

      // Handle security-related response headers
      this.handleSecurityHeaders(response);

      return response;
    } catch (error) {
      console.error("Secure fetch error:", error);
      throw error;
    }
  }

  /**
   * Handle security headers from response
   */
  handleSecurityHeaders(response) {
    const csrfToken = response.headers.get("X-CSRF-Token");
    if (csrfToken) {
      this.csrfToken = csrfToken;
      this.securityHeaders["X-CSRF-Token"] = csrfToken;
    }

    const newToken = response.headers.get("X-New-JWT-Token");
    if (newToken) {
      this.tokenStorage.setToken(newToken);
    }
  }

  /**
   * Login with enhanced security
   */
  async login(username, password) {
    // Validate inputs
    if (!this.inputValidator.validateUsername(username)) {
      throw new Error("Invalid username format");
    }

    if (!this.inputValidator.validatePassword(password)) {
      throw new Error("Invalid password format");
    }

    try {
      const response = await this.secureFetch("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token securely
        this.tokenStorage.setToken(data.token);

        // Cache user info
        this.cacheManager.set("user_info", data.user);

        return data;
      } else {
        throw new Error(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  /**
   * Logout with cleanup
   */
  async logout() {
    try {
      await this.secureFetch("/api/v1/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage regardless of API response
      this.tokenStorage.clearToken();
      this.cacheManager.clear();
      this.rateLimiter.reset();
    }
  }

  /**
   * Get current user info with caching
   */
  async getUserInfo() {
    // Check cache first
    const cached = this.cacheManager.get("user_info");
    if (cached) {
      return cached;
    }

    try {
      const response = await this.secureFetch("/api/v1/auth/me");
      const data = await response.json();

      if (response.ok) {
        this.cacheManager.set("user_info", data.user);
        return data.user;
      } else {
        throw new Error(data.error || "Failed to get user info");
      }
    } catch (error) {
      console.error("Get user info error:", error);
      throw error;
    }
  }

  /**
   * Refresh token with security checks
   */
  async refreshToken() {
    const currentToken = this.tokenStorage.getToken();
    if (!currentToken) {
      throw new Error("No token to refresh");
    }

    try {
      const response = await this.secureFetch("/api/v1/auth/refresh", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        this.tokenStorage.setToken(data.token);
        return data.token;
      } else {
        // If refresh fails, clear token and redirect to login
        this.tokenStorage.clearToken();
        throw new Error(data.error || "Token refresh failed");
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = this.tokenStorage.getToken();
    return token && this.validateToken(token);
  }

  /**
   * Get security status
   */
  getSecurityStatus() {
    return {
      csrfToken: this.csrfToken,
      rateLimitRemaining: this.rateLimiter.getRemainingRequests(),
      cacheSize: this.cacheManager.size(),
      hasToken: !!this.tokenStorage.getToken(),
      tokenValid: this.isAuthenticated(),
    };
  }
}

/**
 * Rate Limiter class for preventing abuse
 */
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.requests = [];
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest() {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Clean old requests
    this.requests = this.requests.filter((time) => time > windowStart);

    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return true;
    }

    return false;
  }

  getRemainingRequests() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const activeRequests = this.requests.filter((time) => time > windowStart);
    return Math.max(0, this.maxRequests - activeRequests.length);
  }

  reset() {
    this.requests = [];
  }
}

/**
 * Cache Manager for performance optimization
 */
class CacheManager {
  constructor(ttl = 5 * 60 * 1000) {
    // 5 minutes default
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

/**
 * Input Validator for security
 */
class InputValidator {
  validateUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  validateUsername(username) {
    return (
      typeof username === "string" &&
      username.length >= 3 &&
      username.length <= 50 &&
      /^[a-zA-Z0-9_]+$/.test(username)
    );
  }

  validatePassword(password) {
    return typeof password === "string" && password.length >= 8;
  }

  sanitizeObject(obj) {
    if (typeof obj !== "object" || obj === null) return obj;

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string") {
        sanitized[key] = this.sanitizeInput(value);
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  sanitizeInput(input) {
    if (typeof input !== "string") return input;

    return input
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/"/g, '"')
      .replace(/'/g, "&#x27;");
  }
}

/**
 * Secure Token Storage
 */
class TokenStorage {
  constructor() {
    this.storageKey = "jwt_auth_token";
    this.useHttpOnly = false; // Set to true if using httpOnly cookies
  }

  setToken(token) {
    if (this.useHttpOnly) {
      // Token will be set via httpOnly cookie by server
      return;
    }

    // Use sessionStorage for better security (cleared when tab closes)
    try {
      sessionStorage.setItem(this.storageKey, token);
    } catch (error) {
      console.error("Failed to store token:", error);
    }
  }

  getToken() {
    if (this.useHttpOnly) {
      // Token will be automatically sent via cookie
      return null;
    }

    try {
      return sessionStorage.getItem(this.storageKey);
    } catch (error) {
      console.error("Failed to get token:", error);
      return null;
    }
  }

  clearToken() {
    if (this.useHttpOnly) {
      // Cookie will be cleared by server
      return;
    }

    try {
      sessionStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error("Failed to clear token:", error);
    }
  }
}

// Environment configuration
const CONFIG = {
  development: {
    API_BASE_URL: "http://localhost:8788",
    CLOUDFLARE_ACCOUNT_ID: "your-dev-account",
    LOG_LEVEL: "debug",
    RATE_LIMIT_MAX: 20,
    RATE_LIMIT_WINDOW: 60000,
  },
  production: {
    API_BASE_URL: "https://your-worker.your-subdomain.workers.dev",
    CLOUDFLARE_ACCOUNT_ID: "your-prod-account",
    LOG_LEVEL: "error",
    RATE_LIMIT_MAX: 10,
    RATE_LIMIT_WINDOW: 60000,
  },
};

const currentConfig =
  CONFIG[
    window.location.hostname === "localhost" ? "development" : "production"
  ];

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = { SecurityManager, CONFIG, currentConfig };
} else {
  window.SecurityManager = SecurityManager;
  window.CONFIG = CONFIG;
  window.currentConfig = currentConfig;
}
