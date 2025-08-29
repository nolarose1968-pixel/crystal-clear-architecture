/**
 * Configuration management for Fire22 Personal Subdomains Worker
 */

import type { CacheConfig, EmployeeTier } from '../types';

export const CONFIG = {
  // Application
  BRAND_NAME: 'Fire22',
  DOMAIN: 'sportsfire.co',
  VERSION: '1.0.0',

  // Cache Configuration
  CACHE: {
    PROFILE: { ttl: 300, cacheControl: 'public, max-age=300' } as CacheConfig,
    SCHEDULE: { ttl: 60, cacheControl: 'private, max-age=60' } as CacheConfig,
    TOOLS: { ttl: 300, cacheControl: 'private, max-age=300' } as CacheConfig,
    CONTACT: { ttl: 600, cacheControl: 'public, max-age=600' } as CacheConfig,
    API: { ttl: 60, cacheControl: 'private, max-age=60' } as CacheConfig,
    DASHBOARD: { ttl: 300, cacheControl: 'private, max-age=300' } as CacheConfig,
  },

  // Security Headers
  SECURITY_HEADERS: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'X-XSS-Protection': '1; mode=block',
  },

  // Tier Configurations
  TIERS: {
    1: { name: 'Executive', color: '#ffd700', features: ['scheduling', 'analytics', 'team-management', 'advanced-tools'] },
    2: { name: 'Management', color: '#10b981', features: ['scheduling', 'team-management', 'advanced-tools'] },
    3: { name: 'Specialist', color: '#06b6d4', features: ['scheduling', 'specialized-tools'] },
    4: { name: 'Standard', color: '#ff6b35', features: ['basic-tools'] },
    5: { name: 'VIP', color: '#ffd700', features: ['scheduling', 'vip-tools', 'analytics', 'custom-features'] },
  },

  // Department Tools
  DEPARTMENT_TOOLS: {
    'Technology': [
      { icon: '💻', title: 'Code Repository', description: 'Access to GitHub repositories and CI/CD pipelines', url: '/tools/code' },
      { icon: '🔧', title: 'DevOps Dashboard', description: 'Monitor deployments and infrastructure health', url: '/tools/devops' },
      { icon: '📊', title: 'System Analytics', description: 'Performance metrics and system monitoring', url: '/tools/analytics' },
    ],
    'Finance': [
      { icon: '💰', title: 'Financial Dashboard', description: 'Budget tracking and expense management', url: '/tools/finance' },
      { icon: '📈', title: 'Reporting Tools', description: 'Generate financial reports and analytics', url: '/tools/reports' },
    ],
    'HR': [
      { icon: '👥', title: 'Employee Portal', description: 'Manage employee records and onboarding', url: '/tools/hr' },
      { icon: '📋', title: 'Recruitment Tools', description: 'Job postings and candidate tracking', url: '/tools/recruiting' },
    ],
    'Operations': [
      { icon: '⚙️', title: 'Operations Dashboard', description: 'Monitor operational metrics and workflows', url: '/tools/ops' },
      { icon: '📦', title: 'Inventory System', description: 'Track inventory and supply chain', url: '/tools/inventory' },
    ],
    'VIP Management': [
      { icon: '👑', title: 'VIP Client Portal', description: 'Manage high-value client relationships', url: '/tools/vip' },
      { icon: '🚨', title: 'Escalation System', description: 'Handle VIP escalations and issues', url: '/tools/escalation' },
      { icon: '📊', title: 'VIP Analytics', description: 'Performance metrics for VIP services', url: '/tools/vip-analytics' },
    ],
  },

  // Default configurations
  DEFAULTS: {
    TEMPLATE: 'standard',
    CACHE_TTL: 300,
    MAX_REQUEST_SIZE: 1024 * 1024, // 1MB
    RATE_LIMIT: 100, // requests per minute
  },

  // API Configuration
  API: {
    VERSION: 'v1',
    ENDPOINTS: {
      HEALTH: '/api/health',
      STATUS: '/api/status',
      ANALYTICS: '/api/analytics',
      EXPORT: '/api/export',
    },
  },

  // Error Messages
  ERRORS: {
    EMPLOYEE_NOT_FOUND: 'Employee not found',
    INVALID_SUBDOMAIN: 'Invalid subdomain format',
    UNAUTHORIZED: 'Unauthorized access',
    RATE_LIMITED: 'Rate limit exceeded',
    INTERNAL_ERROR: 'Internal server error',
  },
} as const;

export function getCacheConfigForRoute(pathname: string): CacheConfig {
  if (pathname.startsWith('/api/')) {
    return CONFIG.CACHE.API;
  } else if (pathname === '/schedule') {
    return CONFIG.CACHE.SCHEDULE;
  } else if (pathname.startsWith('/tools/')) {
    return CONFIG.CACHE.TOOLS;
  } else if (pathname === '/contact') {
    return CONFIG.CACHE.CONTACT;
  } else if (pathname === '/dashboard') {
    return CONFIG.CACHE.DASHBOARD;
  } else {
    return CONFIG.CACHE.PROFILE;
  }
}

export function getFeaturesForTier(tier: EmployeeTier): string[] {
  return [...(CONFIG.TIERS[tier]?.features || CONFIG.TIERS[4].features)];
}

export function getTierName(tier: EmployeeTier): string {
  return CONFIG.TIERS[tier]?.name || 'Standard';
}

export function getTierColor(tier: EmployeeTier): string {
  return CONFIG.TIERS[tier]?.color || CONFIG.TIERS[4].color;
}

export function getToolsForDepartment(department: string): any[] {
  return [...(CONFIG.DEPARTMENT_TOOLS[department as keyof typeof CONFIG.DEPARTMENT_TOOLS] || [
    { icon: '🔧', title: 'Department Tools', description: 'Access department-specific resources', url: '/tools/dept' },
  ])];
}
