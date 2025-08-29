/**
 * 🔧 Fire22 Dashboard - System Constants
 * Centralized configuration for all hardcoded values
 */

// Server Configuration
export const SERVER_CONFIG = {
  DEFAULT_PORT: 4000,
  FALLBACK_PORTS: [4001, 4002, 4003],
  MAX_REQUEST_SIZE: '1mb',
  RATE_LIMIT: {
    WINDOW_MS: 60000,
    MAX_REQUESTS: 100,
  },
  CORS: {
    ORIGIN:
      process.env.NODE_ENV === 'production'
        ? ['https://fire22.com', 'https://dashboard.fire22.com']
        : ['http://localhost:3000', 'http://localhost:4000', 'http://127.0.0.1:4000'],
  },
};

// Database Configuration
export const DATABASE_CONFIG = {
  DEFAULT_PATH: './dashboard.db',
  BACKUP_PATH: './backups/',
  CONNECTION_TIMEOUT: 5000,
  QUERY_TIMEOUT: 30000,
  REQUIRED_TABLES: ['customers', 'transactions', 'bets'],
  SCHEMA_VERSION: '1.0.0',
};

// API Configuration
export const API_CONFIG = {
  VERSION: 'v1',
  BASE_PATH: '/api',
  ENDPOINTS: {
    HEALTH: '/health',
    SYSTEM_STATUS: '/api/system/status',
    DOCS_DIAGNOSTICS: '/api/docs/diagnostics',
  },
  DEFAULT_AGENT_ID: 'BLAKEPPH',
  DEFAULT_MASTER_AGENT: 'BLAKEPPH',
};

// File Paths
export const PATHS = {
  DOCS: './docs',
  STYLES: './src/styles',
  PUBLIC: './public',
  LOGS: './logs',
  UPLOADS: './uploads',
  TEMP: './temp',
};

// URL Patterns
export const URL_PATTERNS = {
  DOCS: '/docs',
  STYLES: '/src/styles',
  API: '/api',
  STATIC: '/static',
};

// Fire22 Business Constants
export const FIRE22_CONFIG = {
  BRAND_NAME: 'Fire22',
  COMPANY_NAME: 'Fire22 Sportsbook',
  DEFAULT_CURRENCY: 'USD',
  DEFAULT_TIMEZONE: 'America/New_York',
  SUPPORTED_LANGUAGES: ['en', 'es', 'fr'],
  DEFAULT_LANGUAGE: 'en',
};

// Security Constants
export const SECURITY_CONFIG = {
  SESSION_TIMEOUT: 3600000, // 1 hour
  MAX_LOGIN_ATTEMPTS: 5,
  PASSWORD_MIN_LENGTH: 8,
  API_KEY_LENGTH: 32,
  ENCRYPTION_ALGORITHM: 'aes-256-gcm',
};

// Validation Constants
export const VALIDATION = {
  CUSTOMER_ID: {
    MIN_LENGTH: 4,
    MAX_LENGTH: 20,
    PATTERN: /^[A-Z0-9]+$/,
  },
  AMOUNT: {
    MIN: 0.01,
    MAX: 100000,
    DECIMAL_PLACES: 2,
  },
  ODDS: {
    MIN: 1.01,
    MAX: 999.99,
  },
};

// Error Messages
export const ERROR_MESSAGES = {
  DATABASE: {
    CONNECTION_FAILED: 'Database connection failed',
    QUERY_TIMEOUT: 'Database query timeout',
    INVALID_SCHEMA: 'Invalid database schema',
  },
  API: {
    INVALID_REQUEST: 'Invalid request format',
    UNAUTHORIZED: 'Unauthorized access',
    RATE_LIMITED: 'Rate limit exceeded',
    NOT_FOUND: 'Endpoint not found',
  },
  VALIDATION: {
    INVALID_CUSTOMER_ID: 'Invalid customer ID format',
    INVALID_AMOUNT: 'Invalid amount value',
    REQUIRED_FIELD: 'Required field missing',
  },
};

// Success Messages
export const SUCCESS_MESSAGES = {
  DATABASE: {
    CONNECTED: 'Database connected successfully',
    QUERY_SUCCESS: 'Query executed successfully',
  },
  API: {
    REQUEST_SUCCESS: 'Request processed successfully',
    DATA_UPDATED: 'Data updated successfully',
  },
};

// Environment-specific overrides
export const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development';

  const configs = {
    development: {
      DEBUG: true,
      LOG_LEVEL: 'debug',
      CACHE_TTL: 60,
      BASE_URL: `http://localhost:${SERVER_CONFIG.DEFAULT_PORT}`,
    },
    production: {
      DEBUG: false,
      LOG_LEVEL: 'error',
      CACHE_TTL: 3600,
      BASE_URL: process.env.PRODUCTION_URL || 'https://dashboard.fire22.com',
    },
    test: {
      DEBUG: false,
      LOG_LEVEL: 'silent',
      CACHE_TTL: 0,
      BASE_URL: 'http://localhost:4000',
    },
  };

  return configs[env] || configs.development;
};

// Export all constants as a single object for easy importing
export default {
  SERVER_CONFIG,
  DATABASE_CONFIG,
  API_CONFIG,
  PATHS,
  URL_PATTERNS,
  FIRE22_CONFIG,
  SECURITY_CONFIG,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  getEnvironmentConfig,
};
