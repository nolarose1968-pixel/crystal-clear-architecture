// Enhanced test setup for Fire22
import { beforeEach, afterEach, expect, mock } from "bun:test";

// Mock console methods for cleaner test output
const originalConsole = { ...console };
global.console = {
  ...console,
  log: mock(() => {}),
  error: mock(() => {}),
  warn: mock(() => {}),
};

// Global test configuration
beforeEach(() => {
  // Reset all mocks before each test
  mock.restore();
});

// Global test teardown
afterEach(() => {
  // Clean up any global state
  // Restore original console methods
  global.console = originalConsole;
});
