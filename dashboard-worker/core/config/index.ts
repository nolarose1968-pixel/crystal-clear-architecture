/**
 * Core Config Module
 * Configuration management
 */

export const config = {
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000'),
  api: {
    baseUrl: process.env.API_BASE_URL || '/api',
    timeout: 30000
  },
  database: {
    url: process.env.DATABASE_URL
  }
};

export function getConfig() {
  return config;
}
