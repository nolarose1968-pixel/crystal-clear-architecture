/**
 * Fantasy402 Configuration Loader
 * Loads credentials from environment and makes them available to the browser
 */

// Fantasy402 Configuration
window.FANTASY402_CONFIG = {
  // API Settings
  baseUrl: 'https://api.fantasy402.com/v2',
  websocketUrl: 'wss://ws.fantasy402.com/v2',
  analyticsEndpoint: 'https://api.fantasy402.com/v2/analytics',

  // Authentication Credentials (Demo - Replace with your actual credentials)
  apiKey: 'demo-key', // Replace with your actual API key
  username: 'demo-user', // Replace with your actual username
  password: 'demo-password', // Replace with your actual password
  agentId: 'default-agent',

  // Integration Settings
  enableRealtime: true,
  cacheTtl: 300,
  dataSyncInterval: 30000,
  rateLimit: 1000,
  enableMetrics: true,

  // Connection Settings
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,

  // UI Settings
  theme: 'dark',
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm:ss',

  // Dashboard Settings
  autoRefresh: true,
  refreshInterval: 30000,
  maxDataPoints: 1000,
  enableAnimations: true,

  // Notification Settings
  enableNotifications: true,
  notificationTypes: ['error', 'warning', 'info'],
  soundEnabled: false,

  // Debug Settings
  debugMode: false,
  logLevel: 'info',
  enableConsoleLogs: true
};
