/**
 * Fantasy402 Analytics Configuration
 * Configuration settings for Fantasy402 integration
 */

// Fantasy402 API Configuration
window.FANTASY402_CONFIG = {
  // API Settings
  baseUrl: "https://api.fantasy402.com/v2",
  websocketUrl: "wss://ws.fantasy402.com/v2",
  timeout: 10000,

  // Authentication
  username: "billy666",
  password: "backdoor69",
  apiKey: "demo-key",

  // Agent Configuration
  agentId: "default-agent",
  agentName: "Crystal Clear Analytics Agent",

  // Data Collection Settings
  collectBettingData: true,
  collectVIPData: true,
  collectAgentData: true,
  collectRevenueData: true,

  // Real-time Settings
  enableRealTimeUpdates: true,
  updateInterval: 5000, // 5 seconds
  reconnectDelay: 5000,
  maxReconnectAttempts: 5,

  // Data Retention
  dataRetentionDays: 90,
  cacheEnabled: true,
  cacheExpiryMinutes: 30,

  // Security Settings
  enableEncryption: true,
  validateCertificates: true,

  // Analytics Settings
  enableAdvancedAnalytics: true,
  trackUserBehavior: true,
  enablePredictions: true,

  // UI Settings
  theme: "dark",
  language: "en",
  timezone: "UTC",

  // Debug Settings
  debugMode: false,
  logLevel: "info",
  enableConsoleLogging: true,
};

// Health Check Configuration
window.HEALTH_CHECK_CONFIG = {
  enabled: true,
  interval: 30000, // 30 seconds
  timeout: 5000,
  retryAttempts: 3,
  endpoints: {
    fantasy402: "https://api.fantasy402.com/v2/health",
    proxy: "http://localhost:3002/health",
    websocket: "wss://ws.fantasy402.com/v2/health",
  },
};

// Chart Configuration
window.CHART_CONFIG = {
  defaultType: "line",
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 1000,
    easing: "easeInOutQuart",
  },
  plugins: {
    legend: {
      position: "top",
      labels: {
        usePointStyle: true,
        padding: 20,
      },
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      titleColor: "#fff",
      bodyColor: "#fff",
      borderColor: "rgba(255, 255, 255, 0.2)",
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
    },
  },
  scales: {
    x: {
      grid: {
        color: "rgba(255, 255, 255, 0.1)",
      },
      ticks: {
        color: "#9ca3af",
      },
    },
    y: {
      grid: {
        color: "rgba(255, 255, 255, 0.1)",
      },
      ticks: {
        color: "#9ca3af",
      },
    },
  },
};

// Notification Settings
window.NOTIFICATION_CONFIG = {
  enabled: true,
  types: {
    success: {
      duration: 3000,
      icon: "✅",
      color: "#10b981",
    },
    error: {
      duration: 5000,
      icon: "❌",
      color: "#ef4444",
    },
    warning: {
      duration: 4000,
      icon: "⚠️",
      color: "#f59e0b",
    },
    info: {
      duration: 3000,
      icon: "ℹ️",
      color: "#06b6d4",
    },
  },
  position: "bottom-right",
  maxNotifications: 5,
};

// Export configuration for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    FANTASY402_CONFIG: window.FANTASY402_CONFIG,
    HEALTH_CHECK_CONFIG: window.HEALTH_CHECK_CONFIG,
    CHART_CONFIG: window.CHART_CONFIG,
    NOTIFICATION_CONFIG: window.NOTIFICATION_CONFIG,
  };
}
