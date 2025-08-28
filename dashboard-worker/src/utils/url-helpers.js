/**
 * 🔗 Fire22 Dashboard - URL Helper Functions
 * Centralized URL generation to prevent hardcoded links
 */

import CONSTANTS from '../config/constants.js';

/**
 * Get the base URL for the current environment
 */
export const getBaseUrl = () => {
  const envConfig = CONSTANTS.getEnvironmentConfig();
  return envConfig.BASE_URL;
};

/**
 * Generate API endpoint URLs
 */
export const apiUrl = {
  health: () => `${getBaseUrl()}${CONSTANTS.API_CONFIG.ENDPOINTS.HEALTH}`,
  systemStatus: () => `${getBaseUrl()}${CONSTANTS.API_CONFIG.ENDPOINTS.SYSTEM_STATUS}`,
  docsStatus: () => `${getBaseUrl()}${CONSTANTS.API_CONFIG.ENDPOINTS.DOCS_DIAGNOSTICS}`,
  
  // Manager endpoints
  manager: {
    liveWagers: () => `${getBaseUrl()}/api/manager/getLiveWagers`,
    customerAdmin: () => `${getBaseUrl()}/api/manager/getCustomerAdmin`,
    pending: () => `${getBaseUrl()}/api/manager/getPending`,
    weeklyFigures: () => `${getBaseUrl()}/api/manager/getWeeklyFigureByAgent`,
    agentPerformance: () => `${getBaseUrl()}/api/manager/getAgentPerformance`,
    customerSummary: () => `${getBaseUrl()}/api/manager/getCustomerSummary`,
    transactions: () => `${getBaseUrl()}/api/manager/getTransactions`,
    bets: () => `${getBaseUrl()}/api/manager/getBets`
  },
  
  // Customer endpoints
  customer: {
    hierarchy: () => `${getBaseUrl()}/api/customer/getHeriarchy`
  },
  
  // Admin endpoints
  admin: {
    createCustomer: () => `${getBaseUrl()}/api/admin/create-customer`,
    processDeposit: () => `${getBaseUrl()}/api/admin/process-deposit`,
    importCustomers: () => `${getBaseUrl()}/api/admin/import-customers`
  }
};

/**
 * Generate documentation URLs
 */
export const docsUrl = {
  base: () => `${getBaseUrl()}/docs`,
  packages: () => `${getBaseUrl()}/docs/packages.html`,
  packagesAdvanced: () => `${getBaseUrl()}/docs/@packages.html`,
  environment: () => `${getBaseUrl()}/docs/environment-variables.html`,
  environmentManager: () => `${getBaseUrl()}/docs/environment-management.html`,
  apiPackages: () => `${getBaseUrl()}/docs/api-packages.html`,
  fire22Config: () => `${getBaseUrl()}/docs/fire22-dashboard-config.html`,
  wagerSystem: () => `${getBaseUrl()}/docs/wager-system-overview.html`,
  apiIntegration: () => `${getBaseUrl()}/docs/fire22-api-integration.html`,
  hub: () => `${getBaseUrl()}/docs/DOCUMENTATION-HUB.html`
};

/**
 * Generate static asset URLs
 */
export const assetUrl = {
  styles: (filename) => `${getBaseUrl()}/src/styles/${filename}`,
  framework: () => `${getBaseUrl()}/src/styles/framework.css`,
  fire22Theme: () => `${getBaseUrl()}/src/styles/themes/fire22.css`,
  components: () => `${getBaseUrl()}/src/styles/components`,
  images: (filename) => `${getBaseUrl()}/static/images/${filename}`,
  icons: (filename) => `${getBaseUrl()}/static/icons/${filename}`
};

/**
 * Generate dashboard URLs
 */
export const dashboardUrl = {
  main: () => `${getBaseUrl()}/dashboard`,
  login: () => `${getBaseUrl()}/login`,
  admin: () => `${getBaseUrl()}/admin`,
  reports: () => `${getBaseUrl()}/reports`,
  settings: () => `${getBaseUrl()}/settings`
};

/**
 * Validate URL format
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Build query string from object
 */
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.append(key, value.toString());
    }
  });
  return searchParams.toString();
};

/**
 * Build full URL with query parameters
 */
export const buildUrl = (baseUrl, params = {}) => {
  const queryString = buildQueryString(params);
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

/**
 * Get relative path from absolute URL
 */
export const getRelativePath = (absoluteUrl) => {
  try {
    const url = new URL(absoluteUrl);
    return url.pathname + url.search + url.hash;
  } catch {
    return absoluteUrl;
  }
};

/**
 * Navigation helper for documentation
 */
export const navigation = {
  docs: [
    { name: '📦 Packages', url: docsUrl.packages() },
    { name: '🌍 Environment', url: docsUrl.environment() },
    { name: '⚙️ Env Manager', url: docsUrl.environmentManager() },
    { name: '🔌 API', url: docsUrl.apiPackages() },
    { name: '⚙️ Config', url: docsUrl.fire22Config() },
    { name: '🧪 Testing', url: docsUrl.packagesAdvanced() },
    { name: '🎯 Wager System', url: docsUrl.wagerSystem() }
  ],
  
  dashboard: [
    { name: '🏠 Dashboard', url: dashboardUrl.main() },
    { name: '👥 Customers', url: `${dashboardUrl.main()}#customers` },
    { name: '💰 Transactions', url: `${dashboardUrl.main()}#transactions` },
    { name: '🎲 Bets', url: `${dashboardUrl.main()}#bets` },
    { name: '📊 Reports', url: dashboardUrl.reports() },
    { name: '⚙️ Settings', url: dashboardUrl.settings() }
  ]
};

/**
 * Export all URL helpers
 */
export default {
  getBaseUrl,
  apiUrl,
  docsUrl,
  assetUrl,
  dashboardUrl,
  isValidUrl,
  buildQueryString,
  buildUrl,
  getRelativePath,
  navigation
};
