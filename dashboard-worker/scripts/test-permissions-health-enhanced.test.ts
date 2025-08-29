#!/usr/bin/env bun

/**
 * 🔐 Enhanced Permissions Health Test Suite - Unit Tests
 * Tests the enhanced permissions health tester functionality
 */

import { describe, it, expect, beforeEach, afterEach, jest } from 'bun:test';
import { PermissionsHealthTester } from './test-permissions-health-enhanced';
import type {
  HealthResponse,
  MatrixHealthResponse,
  TestConfig,
  NetworkError,
} from './test-permissions-health-enhanced';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

// Mock setTimeout for testing
const mockSetTimeout = jest.fn().mockResolvedValue(undefined);

describe('PermissionsHealthTester', () => {
  let tester: PermissionsHealthTester;
  let defaultConfig: TestConfig;

  beforeEach(() => {
    // Reset all mocks
    mockFetch.mockClear();
    jest.clearAllMocks();

    // Default test configuration
    defaultConfig = {
      baseUrl: 'http://test.example.com',
      timeout: 5000,
      retries: 3,
      retryDelay: 100,
      enableVerboseLogging: false,
    };

    // Create tester instance
    tester = new PermissionsHealthTester(defaultConfig);
  });

  afterEach(() => {
    // Clean up
    jest.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should create instance with default configuration', () => {
      const tester = new PermissionsHealthTester();
      const config = tester.getConfig();

      expect(config.baseUrl).toBe('http://localhost:8787');
      expect(config.timeout).toBe(10000);
      expect(config.retries).toBe(3);
      expect(config.retryDelay).toBe(1000);
      expect(config.enableVerboseLogging).toBe(false);
    });

    it('should create instance with custom configuration', () => {
      const customConfig = {
        baseUrl: 'http://custom.example.com',
        timeout: 15000,
        retries: 5,
        retryDelay: 2000,
        enableVerboseLogging: true,
      };

      const tester = new PermissionsHealthTester(customConfig);
      const config = tester.getConfig();

      expect(config.baseUrl).toBe('http://custom.example.com');
      expect(config.timeout).toBe(15000);
      expect(config.retries).toBe(5);
      expect(config.retryDelay).toBe(2000);
      expect(config.enableVerboseLogging).toBe(true);
    });

    it('should merge custom config with defaults', () => {
      const partialConfig = {
        baseUrl: 'http://partial.example.com',
        timeout: 20000,
      };

      const tester = new PermissionsHealthTester(partialConfig);
      const config = tester.getConfig();

      expect(config.baseUrl).toBe('http://partial.example.com');
      expect(config.timeout).toBe(20000);
      expect(config.retries).toBe(3); // default
      expect(config.retryDelay).toBe(1000); // default
      expect(config.enableVerboseLogging).toBe(false); // default
    });

    it('should use environment variables when available', () => {
      // Set environment variables
      process.env.PERMISSIONS_TEST_BASE_URL = 'http://env.example.com';
      process.env.PERMISSIONS_TEST_TIMEOUT = '25000';
      process.env.PERMISSIONS_TEST_RETRIES = '7';
      process.env.PERMISSIONS_TEST_RETRY_DELAY = '3000';
      process.env.PERMISSIONS_TEST_VERBOSE = 'true';

      const tester = new PermissionsHealthTester();
      const config = tester.getConfig();

      expect(config.baseUrl).toBe('http://env.example.com');
      expect(config.timeout).toBe(25000);
      expect(config.retries).toBe(7);
      expect(config.retryDelay).toBe(3000);
      expect(config.enableVerboseLogging).toBe(true);

      // Clean up environment variables
      delete process.env.PERMISSIONS_TEST_BASE_URL;
      delete process.env.PERMISSIONS_TEST_TIMEOUT;
      delete process.env.PERMISSIONS_TEST_RETRIES;
      delete process.env.PERMISSIONS_TEST_RETRY_DELAY;
      delete process.env.PERMISSIONS_TEST_VERBOSE;
    });
  });

  describe('Configuration Management', () => {
    it('should update configuration dynamically', () => {
      const newConfig = {
        baseUrl: 'http://updated.example.com',
        timeout: 30000,
        enableVerboseLogging: true,
      };

      tester.updateConfig(newConfig);
      const config = tester.getConfig();

      expect(config.baseUrl).toBe('http://updated.example.com');
      expect(config.timeout).toBe(30000);
      expect(config.enableVerboseLogging).toBe(true);
      expect(config.retries).toBe(3); // unchanged
      expect(config.retryDelay).toBe(100); // unchanged
    });

    it('should return a copy of configuration', () => {
      const config = tester.getConfig();
      config.baseUrl = 'http://modified.example.com';

      // Original config should not be modified
      const originalConfig = tester.getConfig();
      expect(originalConfig.baseUrl).toBe('http://test.example.com');
    });
  });

  describe('fetchWithRetry', () => {
    it('should make successful request on first attempt', async () => {
      const mockResponse: HealthResponse = {
        success: true,
        status: 'healthy',
        health_score: 95,
        total_agents: 10,
        agents_with_errors: 1,
        timestamp: new Date().toISOString(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const response = await (tester as any).fetchWithRetry(
        `${defaultConfig.baseUrl}/api/health/permissions`
      );

      expect(response).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on network failure', async () => {
      const mockResponse: HealthResponse = {
        success: true,
        status: 'healthy',
        health_score: 95,
        total_agents: 10,
        agents_with_errors: 1,
        timestamp: new Date().toISOString(),
      };

      // First two calls fail, third succeeds
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        } as Response);

      const response = await (tester as any).fetchWithRetry(
        `${defaultConfig.baseUrl}/api/health/permissions`
      );

      expect(response).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should throw error after all retries exhausted', async () => {
      // All calls fail
      mockFetch.mockRejectedValue(new Error('Persistent network error'));

      await expect(
        (tester as any).fetchWithRetry(`${defaultConfig.baseUrl}/api/health/permissions`)
      ).rejects.toThrow('Persistent network error');

      expect(mockFetch).toHaveBeenCalledTimes(3); // 3 retries
    });

    it('should handle HTTP errors properly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      await expect(
        (tester as any).fetchWithRetry(`${defaultConfig.baseUrl}/api/health/permissions`)
      ).rejects.toThrow('HTTP 404: Not Found');

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should include proper headers in request', async () => {
      const mockResponse: HealthResponse = {
        success: true,
        status: 'healthy',
        health_score: 95,
        total_agents: 10,
        agents_with_errors: 1,
        timestamp: new Date().toISOString(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await (tester as any).fetchWithRetry(`${defaultConfig.baseUrl}/api/health/permissions`);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const call = mockFetch.mock.calls[0];
      expect(call[1]?.headers).toEqual({
        'Content-Type': 'application/json',
      });
    });

    it('should respect timeout configuration', async () => {
      const mockResponse: HealthResponse = {
        success: true,
        status: 'healthy',
        health_score: 95,
        total_agents: 10,
        agents_with_errors: 1,
        timestamp: new Date().toISOString(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await (tester as any).fetchWithRetry(`${defaultConfig.baseUrl}/api/health/permissions`);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const call = mockFetch.mock.calls[0];
      expect(call[1]?.signal).toBeDefined();
    });
  });

  describe('testPermissionsHealth', () => {
    it('should test permissions health endpoint successfully', async () => {
      const mockResponse: HealthResponse = {
        success: true,
        status: 'healthy',
        health_score: 95,
        total_agents: 10,
        agents_with_errors: 1,
        timestamp: '2023-01-01T00:00:00Z',
        validation_summary: {
          valid_permissions: 9,
          valid_commission_rates: 8,
          has_required_fields: 10,
          valid_max_wager_type: 7,
        },
        live_casino_validation: {
          has_live_casino_rates: 8,
          casino_rate_coverage: 80,
          valid_casino_rates: 7,
          casino_performance_ready: 6,
        },
        live_casino_stats: {
          totalGames: 100,
          activeGames: 50,
          totalSessions: 200,
          activeSessions: 75,
        },
        agent_validation_details: [
          {
            agent_id: 'agent1',
            status: 'valid',
            score: 95,
            errors: [],
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      // Mock console.log to capture output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await expect(tester.testPermissionsHealth()).resolves.not.toThrow();

      expect(mockFetch).toHaveBeenCalledWith(
        `${defaultConfig.baseUrl}/api/health/permissions`,
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });

    it('should handle API error response', async () => {
      const mockResponse: HealthResponse = {
        success: false,
        status: 'error',
        health_score: 0,
        total_agents: 0,
        agents_with_errors: 0,
        timestamp: '2023-01-01T00:00:00Z',
        message: 'Internal server error',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await expect(tester.testPermissionsHealth()).resolves.not.toThrow();

      consoleSpy.mockRestore();
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network connection failed'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(tester.testPermissionsHealth()).resolves.not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error testing permissions health')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('testPermissionsMatrixHealth', () => {
    it('should test permissions matrix health endpoint successfully', async () => {
      const mockResponse: MatrixHealthResponse = {
        success: true,
        status: 'healthy',
        matrix_health_score: 90,
        timestamp: '2023-01-01T00:00:00Z',
        matrix_stats: {
          total_agents: 10,
          total_permissions: 5,
          total_matrix_cells: 50,
          valid_matrix_cells: 45,
          data_completeness: 90,
          permission_coverage: 100,
          agent_data_quality: 95,
        },
        live_casino_matrix_stats: {
          totalGames: 100,
          activeGames: 50,
          totalRates: 8,
          casinoRateCoverage: 80,
        },
        cell_validation: {
          total_cells: 50,
          valid_cells: 45,
          warning_cells: 3,
          invalid_cells: 2,
        },
        permission_keys: ['read', 'write', 'execute', 'admin', 'casino'],
        matrix_issues: [],
        recommendations: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await expect(tester.testPermissionsMatrixHealth()).resolves.not.toThrow();

      expect(mockFetch).toHaveBeenCalledWith(
        `${defaultConfig.baseUrl}/api/health/permissions-matrix`,
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });

    it('should handle matrix API error response', async () => {
      const mockResponse: MatrixHealthResponse = {
        success: false,
        status: 'error',
        matrix_health_score: 0,
        timestamp: '2023-01-01T00:00:00Z',
        error: 'Matrix calculation failed',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await expect(tester.testPermissionsMatrixHealth()).resolves.not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('testSpecificEndpoint', () => {
    it('should test permissions endpoint when specified', async () => {
      const mockResponse: HealthResponse = {
        success: true,
        status: 'healthy',
        health_score: 95,
        total_agents: 10,
        agents_with_errors: 1,
        timestamp: '2023-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await expect(tester.testSpecificEndpoint('permissions')).resolves.not.toThrow();

      expect(mockFetch).toHaveBeenCalledWith(
        `${defaultConfig.baseUrl}/api/health/permissions`,
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });

    it('should test matrix endpoint when specified', async () => {
      const mockResponse: MatrixHealthResponse = {
        success: true,
        status: 'healthy',
        matrix_health_score: 90,
        timestamp: '2023-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await expect(tester.testSpecificEndpoint('matrix')).resolves.not.toThrow();

      expect(mockFetch).toHaveBeenCalledWith(
        `${defaultConfig.baseUrl}/api/health/permissions-matrix`,
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });

    it('should run comprehensive test for unknown endpoint', async () => {
      const mockHealthResponse: HealthResponse = {
        success: true,
        status: 'healthy',
        health_score: 95,
        total_agents: 10,
        agents_with_errors: 1,
        timestamp: '2023-01-01T00:00:00Z',
      };

      const mockMatrixResponse: MatrixHealthResponse = {
        success: true,
        status: 'healthy',
        matrix_health_score: 90,
        timestamp: '2023-01-01T00:00:00Z',
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockHealthResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMatrixResponse,
        } as Response);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await expect(tester.testSpecificEndpoint('unknown')).resolves.not.toThrow();

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown endpoint'));

      consoleSpy.mockRestore();
    });
  });

  describe('runComprehensiveTest', () => {
    it('should run both permissions and matrix tests', async () => {
      const mockHealthResponse: HealthResponse = {
        success: true,
        status: 'healthy',
        health_score: 95,
        total_agents: 10,
        agents_with_errors: 1,
        timestamp: '2023-01-01T00:00:00Z',
      };

      const mockMatrixResponse: MatrixHealthResponse = {
        success: true,
        status: 'healthy',
        matrix_health_score: 90,
        timestamp: '2023-01-01T00:00:00Z',
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockHealthResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMatrixResponse,
        } as Response);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await expect(tester.runComprehensiveTest()).resolves.not.toThrow();

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        `${defaultConfig.baseUrl}/api/health/permissions`,
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        `${defaultConfig.baseUrl}/api/health/permissions-matrix`,
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });

    it('should handle errors in comprehensive test', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(tester.runComprehensiveTest()).rejects.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors with detailed information', async () => {
      const networkError: NetworkError = new Error('Connection refused');
      networkError.code = 'ECONNREFUSED';
      networkError.response = {
        status: 0,
        statusText: 'Connection refused',
      };

      mockFetch.mockRejectedValue(networkError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(tester.testPermissionsHealth()).resolves.not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error testing permissions health')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Message: Connection refused')
      );
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Code: ECONNREFUSED'));

      consoleSpy.mockRestore();
    });

    it('should handle HTTP status errors', async () => {
      const httpError: NetworkError = new Error('HTTP 500: Internal Server Error');
      httpError.code = '500';
      httpError.response = {
        status: 500,
        statusText: 'Internal Server Error',
      };

      mockFetch.mockRejectedValue(httpError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(tester.testPermissionsHealth()).resolves.not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('HTTP Status: 500 Internal Server Error')
      );

      consoleSpy.mockRestore();
    });

    it('should handle unknown error types', async () => {
      mockFetch.mockRejectedValue('Unknown error string');

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(tester.testPermissionsHealth()).resolves.not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown error: Unknown error string')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Verbose Logging', () => {
    it('should log configuration when verbose logging is enabled', () => {
      const verboseTester = new PermissionsHealthTester({
        ...defaultConfig,
        enableVerboseLogging: true,
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      verboseTester.getConfig(); // This should trigger config logging

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Test Configuration'));

      consoleSpy.mockRestore();
    });

    it('should log retry attempts when verbose logging is enabled', async () => {
      const verboseTester = new PermissionsHealthTester({
        ...defaultConfig,
        enableVerboseLogging: true,
      });

      const mockResponse: HealthResponse = {
        success: true,
        status: 'healthy',
        health_score: 95,
        total_agents: 10,
        agents_with_errors: 1,
        timestamp: '2023-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await (verboseTester as any).fetchWithRetry(
        `${defaultConfig.baseUrl}/api/health/permissions`
      );

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Attempt 1/3'));

      consoleSpy.mockRestore();
    });
  });
});
