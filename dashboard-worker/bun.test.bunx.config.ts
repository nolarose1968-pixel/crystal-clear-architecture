#!/usr/bin/env bun

/**
 * Bun Test Configuration for bunx Compatibility
 * Optimized for both bun test and bunx bun test
 */

export default {
  // Test discovery
  test: {
    // Root directory for test files
    root: "./tests",
    
    // Test file patterns
    include: [
      "**/*.test.{ts,tsx,js,jsx}",
      "**/*.spec.{ts,tsx,js,jsx}"
    ],
    
    // Exclude patterns
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/.next/**"
    ]
  },
  
  // Coverage settings
  coverage: {
    enabled: true,
    threshold: {
      line: 75,
      function: 75,
      branch: 70,
      statement: 75
    },
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/tests/**",
      "**/*.config.{ts,js}",
      "**/*.setup.{ts,js}",
      "**/setup/**",
      "**/fixtures/**",
      "**/helpers/**",
      "**/utils/test-*.{ts,js}"
    ]
  },
  
  // Environment settings
  env: {
    NODE_ENV: "test",
    BUN_ENV: "test"
  },
  
  // Timeout settings
  timeout: {
    test: 30000,      // 30 seconds for individual tests
    hook: 10000       // 10 seconds for hooks
  },
  
  // Setup files
  setup: [
    "./tests/setup/global-setup.ts"
  ],
  
  // Module resolution
  module: {
    preload: [
      "./tests/setup.ts"
    ]
  },
  
  // bunx compatibility
  bunx: {
    enabled: true,
    fallback: true
  }
};