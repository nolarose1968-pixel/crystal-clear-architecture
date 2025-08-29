/**
 * Fire22 Enterprise Test Setup
 * Global test configuration and setup for the Fire22 system
 *
 * This file is automatically loaded before running any tests
 * via the [test].preload configuration in bunfig.toml
 */

// Import test utilities
import { beforeAll, afterAll, beforeEach, afterEach } from 'bun:test';

// Global test configuration
const TEST_CONFIG = {
  environment: 'test',
  timeout: 30000, // 30 seconds
  retries: 3,
  parallel: true,
  enterprise: true,
  coverage: true
};

// Enterprise test database setup
let testDatabase: any = null;

// Setup global test environment
beforeAll(async () => {
  console.log('🧪 Fire22 Enterprise Test Setup');
  console.log('================================');

  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.FIRE22_ENV = 'test';
  process.env.FIRE22_TEST = 'true';

  // Initialize test database
  testDatabase = await setupTestDatabase();
  console.log('   ✅ Test database initialized');

  // Setup enterprise test services
  await setupTestServices();
  console.log('   ✅ Enterprise test services configured');

  // Configure test timeouts
  console.log(`   ✅ Test timeout: ${TEST_CONFIG.timeout}ms`);
  console.log(`   ✅ Test retries: ${TEST_CONFIG.retries}`);
  console.log(`   ✅ Parallel execution: ${TEST_CONFIG.parallel ? 'Enabled' : 'Disabled'}`);
  console.log(`   ✅ Enterprise mode: ${TEST_CONFIG.enterprise ? 'Enabled' : 'Disabled'}`);
  console.log(`   ✅ Coverage reporting: ${TEST_CONFIG.coverage ? 'Enabled' : 'Disabled'}`);

  console.log('');
  console.log('🎯 Test Environment Ready!');
  console.log('===========================');
});

// Cleanup after all tests
afterAll(async () => {
  console.log('');
  console.log('🧹 Fire22 Test Cleanup');
  console.log('=====================');

  // Cleanup test database
  if (testDatabase) {
    await cleanupTestDatabase(testDatabase);
    console.log('   ✅ Test database cleaned up');
  }

  // Cleanup test services
  await cleanupTestServices();
  console.log('   ✅ Test services cleaned up');

  console.log('');
  console.log('✨ All tests completed!');
});

// Setup for each individual test
beforeEach(() => {
  // Reset any global state
  // Clear caches, reset mocks, etc.
});

// Cleanup after each test
afterEach(() => {
  // Clean up after each test
  // Restore original state, clear temporary data, etc.
});

// Enterprise test database setup
async function setupTestDatabase() {
  // In a real enterprise environment, this would:
  // - Create isolated test database
  // - Load test data fixtures
  // - Configure enterprise database connections
  // - Set up database mocking/stubbing

  console.log('   🔧 Setting up enterprise test database...');

  return {
    connection: 'test-db-connection',
    fixtures: ['users', 'organizations', 'permissions'],
    cleanup: () => Promise.resolve()
  };
}

// Enterprise test services setup
async function setupTestServices() {
  // In a real enterprise environment, this would:
  // - Start mock services (Redis, Kafka, etc.)
  // - Configure enterprise service mocks
  // - Set up authentication mocks
  // - Initialize enterprise service clients

  console.log('   🔧 Setting up enterprise test services...');

  // Mock enterprise services
  globalThis.FIRE22_TEST_SERVICES = {
    redis: { connected: true },
    kafka: { connected: true },
    auth: { configured: true },
    audit: { enabled: true }
  };
}

// Cleanup functions
async function cleanupTestDatabase(db: any) {
  // Clean up test database
  if (db && db.cleanup) {
    await db.cleanup();
  }
}

async function cleanupTestServices() {
  // Clean up test services
  if (globalThis.FIRE22_TEST_SERVICES) {
    delete globalThis.FIRE22_TEST_SERVICES;
  }
}

// Export test utilities for use in test files
export {
  TEST_CONFIG,
  setupTestDatabase,
  setupTestServices,
  cleanupTestDatabase,
  cleanupTestServices
};

// Global test helpers
globalThis.FIRE22_TEST = {
  config: TEST_CONFIG,

  // Helper to create test users
  createTestUser: (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'user',
    organization: 'fire22',
    ...overrides
  }),

  // Helper to create test organizations
  createTestOrg: (overrides = {}) => ({
    id: 'test-org-id',
    name: 'Test Organization',
    type: 'enterprise',
    plan: 'premium',
    ...overrides
  }),

  // Helper to mock API responses
  mockApiResponse: (status = 200, data = {}) => ({
    status,
    data,
    headers: { 'content-type': 'application/json' }
  }),

  // Helper to wait for async operations
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to generate test IDs
  generateId: () => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
};

// Enterprise test matchers
export const enterpriseMatchers = {
  // Check if response has enterprise headers
  toHaveEnterpriseHeaders: (response: any) => {
    const hasHeaders = response.headers &&
                      response.headers['x-enterprise'] === 'true' &&
                      response.headers['x-fire22-version'];

    return {
      pass: hasHeaders,
      message: () => hasHeaders
        ? 'Expected response not to have enterprise headers'
        : 'Expected response to have enterprise headers'
    };
  },

  // Check if user has enterprise permissions
  toHaveEnterprisePermissions: (user: any) => {
    const hasPermissions = user.permissions &&
                          user.permissions.includes('enterprise') &&
                          user.organization?.type === 'enterprise';

    return {
      pass: hasPermissions,
      message: () => hasPermissions
        ? 'Expected user not to have enterprise permissions'
        : 'Expected user to have enterprise permissions'
    };
  }
};

// Register custom matchers (if supported by test framework)
if (typeof expect !== 'undefined') {
  expect.extend(enterpriseMatchers);
}
