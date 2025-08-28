/**
 * 🧪 Fire22 Dashboard - Bun Test Configuration
 * Configuration for the Bun test runner
 */

import { defineConfig } from 'bun';

export default defineConfig({
  test: {
    // Test file patterns
    include: [
      'tests/**/*.test.ts',
      'tests/**/*.test.js',
      'tests/**/*.spec.ts',
      'tests/**/*.spec.js'
    ],
    
    // Exclude patterns
    exclude: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '**/*.d.ts'
    ],

    // Test environment
    env: {
      NODE_ENV: 'test',
      TEST_DATABASE_URL: 'file:./test-dashboard.db',
      TEST_PORT: '4001',
      TEST_API_KEY: 'test_key_123',
      TEST_DEBUG: 'false'
    },

    // Test timeout (30 seconds)
    timeout: 30000,

    // Setup files
    setupFiles: [
      './tests/setup/global-setup.ts'
    ],

    // Coverage configuration
    coverage: {
      enabled: true,
      reporter: ['text', 'html', 'json'],
      dir: './coverage',
      include: [
        'src/**/*.ts',
        'src/**/*.js'
      ],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/**/*.d.ts',
        'tests/**/*'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80
      }
    },

    // Parallel execution
    parallel: true,
    
    // Bail on first failure (for CI)
    bail: process.env.CI === 'true' ? 1 : 0,

    // Verbose output
    verbose: process.env.TEST_VERBOSE === 'true',

    // Watch mode configuration
    watch: {
      ignore: [
        'node_modules/**',
        'dist/**',
        'coverage/**',
        '*.log',
        '.git/**'
      ]
    }
  }
});
