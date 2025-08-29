/**
 * 🔐 Enhanced API Service with JWT Authentication and Security Features
 * Integrates with the existing security manager for comprehensive protection
 */

class APIService {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.token = null;
    this.refreshToken = null;
    this.securityManager = null;
    this.rateLimiter = new RateLimiter();
    this.cacheManager = new CacheManager();
    this.defaultHeaders = {
      "Content-Type": "application/json",
      "X-API-Version": "v1",
      "User-Agent": "JWT-Auth-Demo/2.1.0",
      "X-Client-ID": this.generateClientId(),
    };
  }

  /**
   * Initialize with security manager for enhanced protection
   */
  initSecurityManager(securityManager) {
    this.securityManager = securityManager;
    this.token = securityManager.tokenStorage.getToken();
  }

  generateClientId() {
    return "client_" + Math.random().toString(36).substr(2, 9);
  }

  setAuthToken(token, refreshToken = null) {
    this.token = token;
    if (refreshToken) {
      this.refreshToken = refreshToken;
      sessionStorage.setItem("refresh_token", refreshToken);
    }

    // Store in sessionStorage for persistence
    sessionStorage.setItem("jwt_token", token);

    // Update security manager if available
    if (this.securityManager) {
      this.securityManager.tokenStorage.setToken(token);
    }
  }

  getAuthHeaders() {
    const headers = { ...this.defaultHeaders };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    // Add CSRF token from security manager or DOM
    if (this.securityManager) {
      headers["X-CSRF-Token"] = this.securityManager.csrfToken;
    } else {
      headers["X-CSRF-Token"] =
        document.querySelector('meta[name="csrf-token"]')?.content || "";
    }

    // Add security headers
    headers["X-Content-Type-Options"] = "nosniff";
    headers["X-Frame-Options"] = "DENY";
    headers["X-XSS-Protection"] = "1; mode=block";

    return headers;
  }

  /**
   * Enhanced request method with security features
   */
  async request(endpoint, options = {}) {
    // Check rate limit
    if (!this.rateLimiter.canMakeRequest()) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }

    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      credentials: "include", // Include cookies
    };

    // Validate and sanitize request data
    if (config.body && typeof config.body === "string") {
      try {
        const parsed = JSON.parse(config.body);
        const sanitized = this.sanitizeRequestData(parsed);
        config.body = JSON.stringify(sanitized);
      } catch (e) {
        // If not JSON, sanitize as string
        config.body = this.sanitizeString(config.body);
      }
    }

    try {
      const response = await fetch(url, config);

      // Handle security headers from response
      this.handleSecurityHeaders(response);

      // Auto-refresh token if expired
      if (response.status === 401) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          config.headers["Authorization"] = `Bearer ${this.token}`;
          return fetch(url, config);
        } else {
          // Token refresh failed, clear authentication
          this.clearAuth();
          throw new Error("Session expired. Please login again.");
        }
      }

      return response;
    } catch (error) {
      console.error("API Request failed:", error);
      throw error;
    }
  }

  /**
   * Handle security headers from response
   */
  handleSecurityHeaders(response) {
    const csrfToken = response.headers.get("X-CSRF-Token");
    if (csrfToken && this.securityManager) {
      this.securityManager.csrfToken = csrfToken;
    }

    const newToken = response.headers.get("X-New-JWT-Token");
    if (newToken) {
      this.setAuthToken(newToken);
    }
  }

  /**
   * Enhanced login with security validation
   */
  async login(credentials) {
    // Validate credentials format
    if (!this.validateCredentials(credentials)) {
      throw new Error("Invalid credentials format");
    }

    const response = await this.request("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.ok) {
      const data = await response.json();

      // Set tokens
      if (data.token) {
        this.setAuthToken(data.token, data.refresh_token);
      }

      // Cache user info
      if (data.user) {
        this.cacheManager.set("user_info", data.user);
      }

      return data;
    }

    return response;
  }

  /**
   * Enhanced token request with validation
   */
  async getToken() {
    const response = await this.request("/api/v1/token", {
      method: "POST",
      body: JSON.stringify({ grant_type: "password" }),
    });

    if (response.ok) {
      const data = await response.json();
      this.setAuthToken(data.access_token, data.refresh_token);
      return data;
    }

    return response;
  }

  /**
   * Enhanced token refresh with error handling
   */
  async refreshToken() {
    const refreshToken =
      this.refreshToken || sessionStorage.getItem("refresh_token");
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await this.request("/api/v1/token/refresh", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setAuthToken(data.access_token, data.refresh_token);
        return true;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
    }

    return false;
  }

  /**
   * Token verification with caching
   */
  async verifyToken() {
    // Check cache first
    const cached = this.cacheManager.get("token_verification");
    if (cached) {
      return cached;
    }

    const response = await this.request("/api/v1/verify", {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      this.cacheManager.set("token_verification", data, 30000); // Cache for 30 seconds
      return data;
    }

    return response;
  }

  /**
   * Token revocation with cleanup
   */
  async revokeToken() {
    try {
      const response = await this.request("/api/v1/token/revoke", {
        method: "POST",
      });

      if (response.ok) {
        this.clearAuth();
        return true;
      }
    } catch (error) {
      console.error("Token revocation failed:", error);
    }

    return false;
  }

  /**
   * Enhanced protected resource access
   */
  async getProtectedResource(endpoint) {
    // Check cache first for GET requests
    if (endpoint.startsWith("/")) {
      const cached = this.cacheManager.get(`resource_${endpoint}`);
      if (cached) {
        return cached;
      }
    }

    const response = await this.request(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();

      // Cache successful GET responses
      if (endpoint.startsWith("/")) {
        this.cacheManager.set(`resource_${endpoint}`, data);
      }

      return data;
    }

    return response;
  }

  /**
   * POST request with enhanced security
   */
  async post(endpoint, data) {
    const response = await this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const responseData = await response.json();

      // Clear related cache on successful POST
      this.clearRelatedCache(endpoint);

      return responseData;
    }

    return response;
  }

  /**
   * PUT request with enhanced security
   */
  async put(endpoint, data) {
    const response = await this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const responseData = await response.json();

      // Clear related cache on successful PUT
      this.clearRelatedCache(endpoint);

      return responseData;
    }

    return response;
  }

  /**
   * DELETE request with enhanced security
   */
  async delete(endpoint) {
    const response = await this.request(endpoint, {
      method: "DELETE",
    });

    if (response.ok) {
      // Clear related cache on successful DELETE
      this.clearRelatedCache(endpoint);

      return true;
    }

    return false;
  }

  /**
   * Clear authentication data
   */
  clearAuth() {
    this.token = null;
    this.refreshToken = null;
    sessionStorage.removeItem("jwt_token");
    sessionStorage.removeItem("refresh_token");
    this.cacheManager.clear();
    this.rateLimiter.reset();

    if (this.securityManager) {
      this.securityManager.tokenStorage.clearToken();
    }
  }

  /**
   * Validate credentials format
   */
  validateCredentials(credentials) {
    return (
      credentials &&
      typeof credentials === "object" &&
      typeof credentials.username === "string" &&
      typeof credentials.password === "string" &&
      credentials.username.length >= 3 &&
      credentials.password.length >= 8
    );
  }

  /**
   * Sanitize request data
   */
  sanitizeRequestData(data) {
    if (typeof data !== "object" || data === null) return data;

    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "string") {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = this.sanitizeRequestData(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  /**
   * Sanitize string to prevent XSS
   */
  sanitizeString(str) {
    if (typeof str !== "string") return str;

    return str
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/"/g, '"')
      .replace(/'/g, "&#x27;");
  }

  /**
   * Clear related cache entries
   */
  clearRelatedCache(endpoint) {
    const baseEndpoint = endpoint.split("?")[0];
    const keysToDelete = [];

    for (const key of this.cacheManager.cache.keys()) {
      if (key.includes(baseEndpoint)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cacheManager.cache.delete(key));
  }

  /**
   * Get API service status
   */
  getStatus() {
    return {
      baseURL: this.baseURL,
      hasToken: !!this.token,
      hasRefreshToken: !!this.refreshToken,
      rateLimitRemaining: this.rateLimiter.getRemainingRequests(),
      cacheSize: this.cacheManager.size(),
      hasSecurityManager: !!this.securityManager,
    };
  }
}

/**
 * Rate Limiter for API requests
 */
class RateLimiter {
  constructor(maxRequests = 50, windowMs = 60000) {
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
 * Cache Manager for API responses
 */
class CacheManager {
  constructor(defaultTTL = 5 * 60 * 1000) {
    // 5 minutes default
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  set(key, value, ttl = this.defaultTTL) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
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

  clearExpired() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Environment configuration
const CONFIG = {
  development: {
    API_BASE_URL: "http://localhost:8788",
    RATE_LIMIT_MAX: 100,
    RATE_LIMIT_WINDOW: 60000,
    CACHE_TTL: 2 * 60 * 1000, // 2 minutes for development
  },
  production: {
    API_BASE_URL: "https://your-worker.your-subdomain.workers.dev",
    RATE_LIMIT_MAX: 50,
    RATE_LIMIT_WINDOW: 60000,
    CACHE_TTL: 5 * 60 * 1000, // 5 minutes for production
  },
};

const currentConfig =
  CONFIG[
    window.location.hostname === "localhost" ? "development" : "production"
  ];

// Initialize API service with environment-specific config
const api = new APIService(currentConfig.API_BASE_URL);

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    APIService,
    RateLimiter,
    CacheManager,
    CONFIG,
    currentConfig,
    api,
  };
} else {
  window.APIService = APIService;
  window.RateLimiter = RateLimiter;
  window.CacheManager = CacheManager;
  window.CONFIG = CONFIG;
  window.currentConfig = currentConfig;
  window.api = api;
}
