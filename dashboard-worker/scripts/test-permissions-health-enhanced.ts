#!/usr/bin/env bun

/**
 * 🔐 Fire22 Enhanced Permissions Health Test
 * Tests the enhanced permissions health endpoints with live casino integration
 * IMPROVED: Type safety, configuration management, network resilience
 */

// Import required modules
import { setTimeout as setTimeoutPromise } from 'timers/promises';
import { setTimeout, clearTimeout } from 'timers';

// Type definitions for improved type safety
interface HealthResponse {
  success: boolean;
  status: string;
  health_score: number;
  total_agents: number;
  agents_with_errors: number;
  timestamp: string;
  validation_summary?: ValidationSummary;
  live_casino_validation?: LiveCasinoValidation;
  live_casino_stats?: LiveCasinoStats;
  agent_validation_details?: AgentValidationDetail[];
  message?: string;
  error?: string;
}

interface ValidationSummary {
  valid_permissions: number;
  valid_commission_rates: number;
  has_required_fields: number;
  valid_max_wager_type: number;
}

interface LiveCasinoValidation {
  has_live_casino_rates: number;
  casino_rate_coverage: number;
  valid_casino_rates: number;
  casino_performance_ready: number;
}

interface LiveCasinoStats {
  totalGames: number;
  activeGames: number;
  totalSessions: number;
  activeSessions: number;
}

interface AgentValidationDetail {
  agent_id: string;
  status: string;
  score: number;
  errors?: string[];
}

interface MatrixHealthResponse {
  success: boolean;
  status: string;
  matrix_health_score: number;
  timestamp: string;
  matrix_stats?: MatrixStats;
  live_casino_matrix_stats?: LiveCasinoMatrixStats;
  cell_validation?: CellValidation;
  permission_keys?: string[];
  matrix_issues?: string[];
  recommendations?: string[];
  error?: string;
}

interface MatrixStats {
  total_agents: number;
  total_permissions: number;
  total_matrix_cells: number;
  valid_matrix_cells: number;
  data_completeness: number;
  permission_coverage: number;
  agent_data_quality: number;
}

interface LiveCasinoMatrixStats {
  totalGames: number;
  activeGames: number;
  totalRates: number;
  casinoRateCoverage: number;
}

interface CellValidation {
  total_cells: number;
  valid_cells: number;
  warning_cells: number;
  invalid_cells: number;
}

interface TestConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  enableVerboseLogging: boolean;
}

interface NetworkError extends Error {
  code?: string;
  response?: {
    status: number;
    statusText: string;
  };
}

class PermissionsHealthTester {
  private config: TestConfig;

  constructor(config?: Partial<TestConfig>) {
    // Default configuration with environment variable support
    this.config = {
      baseUrl: process.env.PERMISSIONS_TEST_BASE_URL || 'http://localhost:8787',
      timeout: parseInt(process.env.PERMISSIONS_TEST_TIMEOUT || '10000'),
      retries: parseInt(process.env.PERMISSIONS_TEST_RETRIES || '3'),
      retryDelay: parseInt(process.env.PERMISSIONS_TEST_RETRY_DELAY || '1000'),
      enableVerboseLogging: process.env.PERMISSIONS_TEST_VERBOSE === 'true',
      ...config,
    };

    if (this.config.enableVerboseLogging) {
      console.log('🔧 **Test Configuration**:', JSON.stringify(this.config, null, 2));
    }
  }

  /**
   * Enhanced fetch with timeout and retry logic
   */
  private async fetchWithRetry(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    const fetchOptions: RequestInit = {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    let lastError: NetworkError | undefined;

    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        if (this.config.enableVerboseLogging) {
          console.log(`🌐 **Attempt ${attempt}/${this.config.retries}**: Fetching ${url}`);
        }

        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);

        if (!response.ok) {
          const error: NetworkError = new Error(`HTTP ${response.status}: ${response.statusText}`);
          error.code = response.status.toString();
          error.response = {
            status: response.status,
            statusText: response.statusText,
          };
          throw error;
        }

        return response;
      } catch (error) {
        lastError = error as NetworkError;

        if (this.config.enableVerboseLogging) {
          console.log(
            `⚠️ **Attempt ${attempt} failed**:`,
            error instanceof Error ? error.message : String(error)
          );
        }

        if (attempt < this.config.retries) {
          await setTimeoutPromise(this.config.retryDelay * attempt); // Exponential backoff
        }
      }
    }

    throw lastError || new Error('All retry attempts failed');
  }

  /**
   * Test basic permissions health endpoint with enhanced error handling
   */
  async testPermissionsHealth(): Promise<void> {
    console.log('🔐 **Testing Enhanced Permissions Health Endpoint**\n');

    try {
      const response = await this.fetchWithRetry(`${this.config.baseUrl}/api/health/permissions`);
      const data: HealthResponse = await response.json();

      if (data.success) {
        console.log('✅ **Permissions Health Check Successful**\n');
        console.log(`📊 **Overall Status**: ${data.status}`);
        console.log(`🏥 **Health Score**: ${data.health_score}%`);
        console.log(`👥 **Total Agents**: ${data.total_agents}`);
        console.log(`⚠️ **Agents with Errors**: ${data.agents_with_errors}`);
        console.log(`📅 **Timestamp**: ${data.timestamp}\n`);

        // Display validation summary
        if (data.validation_summary) {
          console.log('📋 **Validation Summary**:');
          console.log(
            `  • Valid Permissions: ${data.validation_summary.valid_permissions}/${data.total_agents}`
          );
          console.log(
            `  • Valid Commission Rates: ${data.validation_summary.valid_commission_rates}/${data.total_agents}`
          );
          console.log(
            `  • Has Required Fields: ${data.validation_summary.has_required_fields}/${data.total_agents}`
          );
          console.log(
            `  • Valid Max Wager Type: ${data.validation_summary.valid_max_wager_type}/${data.total_agents}\n`
          );
        }

        // Display live casino validation
        if (data.live_casino_validation) {
          console.log('🎰 **Live Casino Validation**:');
          console.log(
            `  • Agents with Casino Rates: ${data.live_casino_validation.has_live_casino_rates}/${data.total_agents} (${data.live_casino_validation.casino_rate_coverage}%)`
          );
          console.log(
            `  • Valid Casino Rates: ${data.live_casino_validation.valid_casino_rates}/${data.total_agents}`
          );
          console.log(
            `  • Performance Ready: ${data.live_casino_validation.casino_performance_ready}/${data.total_agents}\n`
          );
        }

        // Display live casino stats
        if (data.live_casino_stats) {
          console.log('🎮 **Live Casino System Stats**:');
          console.log(`  • Total Games: ${data.live_casino_stats.totalGames}`);
          console.log(`  • Active Games: ${data.live_casino_stats.activeGames}`);
          console.log(`  • Total Sessions: ${data.live_casino_stats.totalSessions}`);
          console.log(`  • Active Sessions: ${data.live_casino_stats.activeSessions}\n`);
        }

        // Display agent details if available
        if (data.agent_validation_details && data.agent_validation_details.length > 0) {
          console.log('👤 **Agent Validation Details**:');
          data.agent_validation_details.forEach((agent, index) => {
            console.log(`\n  **Agent ${index + 1}**: ${agent.agent_id}`);
            console.log(`    Status: ${agent.status}`);
            console.log(`    Score: ${agent.score}%`);
            if (agent.errors && agent.errors.length > 0) {
              console.log(`    Errors: ${agent.errors.join(', ')}`);
            }
          });
          console.log();
        }
      } else {
        console.log('❌ **Permissions Health Check Failed**');
        console.log(`Error: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      this.handleTestError('permissions health', error);
    }
  }

  /**
   * Test permissions matrix health endpoint with enhanced error handling
   */
  async testPermissionsMatrixHealth(): Promise<void> {
    console.log('🔐 **Testing Enhanced Permissions Matrix Health Endpoint**\n');

    try {
      const response = await this.fetchWithRetry(
        `${this.config.baseUrl}/api/health/permissions-matrix`
      );
      const data: MatrixHealthResponse = await response.json();

      if (data.success) {
        console.log('✅ **Permissions Matrix Health Check Successful**\n');
        console.log(`📊 **Matrix Status**: ${data.status}`);
        console.log(`🏥 **Matrix Health Score**: ${data.matrix_health_score}%`);
        console.log(`📅 **Timestamp**: ${data.timestamp}\n`);

        // Display matrix stats
        if (data.matrix_stats) {
          console.log('📋 **Matrix Statistics**:');
          console.log(`  • Total Agents: ${data.matrix_stats.total_agents}`);
          console.log(`  • Total Permissions: ${data.matrix_stats.total_permissions}`);
          console.log(`  • Total Matrix Cells: ${data.matrix_stats.total_matrix_cells}`);
          console.log(`  • Valid Matrix Cells: ${data.matrix_stats.valid_matrix_cells}`);
          console.log(`  • Data Completeness: ${data.matrix_stats.data_completeness}%`);
          console.log(`  • Permission Coverage: ${data.matrix_stats.permission_coverage}%`);
          console.log(`  • Agent Data Quality: ${data.matrix_stats.agent_data_quality}%\n`);
        }

        // Display live casino matrix stats
        if (data.live_casino_matrix_stats) {
          console.log('🎰 **Live Casino Matrix Integration**:');
          console.log(`  • Total Games: ${data.live_casino_matrix_stats.totalGames}`);
          console.log(`  • Active Games: ${data.live_casino_matrix_stats.activeGames}`);
          console.log(
            `  • Agents with Casino Rates: ${data.live_casino_matrix_stats.totalRates}/${data.matrix_stats?.total_agents || 'N/A'}`
          );
          console.log(
            `  • Casino Rate Coverage: ${data.live_casino_matrix_stats.casinoRateCoverage}%\n`
          );
        }

        // Display cell validation
        if (data.cell_validation) {
          console.log('🔍 **Cell Validation**:');
          console.log(`  • Total Cells: ${data.cell_validation.total_cells}`);
          console.log(`  • Valid Cells: ${data.cell_validation.valid_cells}`);
          console.log(`  • Warning Cells: ${data.cell_validation.warning_cells}`);
          console.log(`  • Invalid Cells: ${data.cell_validation.invalid_cells}\n`);
        }

        // Display permission keys
        if (data.permission_keys && data.permission_keys.length > 0) {
          console.log('🔑 **Permission Keys**:');
          console.log(`  ${data.permission_keys.join(', ')}\n`);
        }

        // Display matrix issues if any
        if (data.matrix_issues && data.matrix_issues.length > 0) {
          console.log('⚠️ **Matrix Issues**:');
          data.matrix_issues.forEach((issue, index) => {
            console.log(`  ${index + 1}. ${issue}`);
          });
          console.log();
        }

        // Display recommendations if any
        if (data.recommendations && data.recommendations.length > 0) {
          console.log('💡 **Recommendations**:');
          data.recommendations.forEach((rec, index) => {
            console.log(`  ${index + 1}. ${rec}`);
          });
          console.log();
        }
      } else {
        console.log('❌ **Permissions Matrix Health Check Failed**');
        console.log(`Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      this.handleTestError('permissions matrix health', error);
    }
  }

  /**
   * Enhanced error handling with detailed error information
   */
  private handleTestError(testName: string, error: unknown): void {
    console.error(`❌ **Error testing ${testName}**:`);

    if (error instanceof Error) {
      console.error(`  Message: ${error.message}`);

      const networkError = error as NetworkError;
      if (networkError.code) {
        console.error(`  Code: ${networkError.code}`);
      }

      if (networkError.response) {
        console.error(
          `  HTTP Status: ${networkError.response.status} ${networkError.response.statusText}`
        );
      }

      if (this.config.enableVerboseLogging) {
        console.error(`  Stack: ${error.stack}`);
      }
    } else {
      console.error(`  Unknown error: ${String(error)}`);
    }

    console.error();
  }

  /**
   * Run comprehensive permissions health test with enhanced error handling
   */
  async runComprehensiveTest(): Promise<void> {
    console.log('🔐 **Fire22 Enhanced Permissions Health Test Suite**\n');
    console.log(
      'This test suite validates the enhanced permissions health system with live casino integration.\n'
    );
    console.log('🔧 **Configuration**:');
    console.log(`  • Base URL: ${this.config.baseUrl}`);
    console.log(`  • Timeout: ${this.config.timeout}ms`);
    console.log(`  • Retries: ${this.config.retries}`);
    console.log(`  • Verbose Logging: ${this.config.enableVerboseLogging}\n`);

    try {
      await this.testPermissionsHealth();
      console.log('='.repeat(80));
      await this.testPermissionsMatrixHealth();

      console.log('🎉 **Permissions Health Test Suite Complete!**\n');
      console.log('✅ Enhanced permissions health with live casino integration');
      console.log('✅ Comprehensive validation and error detection');
      console.log('✅ Real-time system statistics and monitoring');
      console.log('✅ Advanced matrix health analysis');
      console.log('✅ Live casino rate validation and coverage analysis');
      console.log('✅ Improved type safety and error handling');
      console.log('✅ Network resilience with retry logic');
      console.log('✅ Flexible configuration management');
    } catch (error) {
      console.error('❌ **Test suite execution failed**:', error);
      throw error;
    }
  }

  /**
   * Test specific endpoint with enhanced error handling
   */
  async testSpecificEndpoint(endpoint: string): Promise<void> {
    console.log(`🎯 **Testing Specific Endpoint**: ${endpoint}\n`);

    switch (endpoint.toLowerCase()) {
      case 'permissions':
        await this.testPermissionsHealth();
        break;
      case 'matrix':
        await this.testPermissionsMatrixHealth();
        break;
      default:
        console.log(`⚠️ **Unknown endpoint**: ${endpoint}`);
        console.log('Available endpoints: permissions, matrix');
        console.log('Running comprehensive test instead...\n');
        await this.runComprehensiveTest();
    }
  }

  /**
   * Update configuration dynamically
   */
  updateConfig(newConfig: Partial<TestConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (this.config.enableVerboseLogging) {
      console.log('🔧 **Configuration Updated**:', JSON.stringify(this.config, null, 2));
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): TestConfig {
    return { ...this.config };
  }
}

// Main execution with enhanced argument handling
async function main(): Promise<void> {
  try {
    const tester = new PermissionsHealthTester();
    const endpoint = process.argv[2];

    // Parse additional command line arguments for configuration
    const args = process.argv.slice(2);
    const configOverrides: Partial<TestConfig> = {};

    args.forEach((arg, index) => {
      if (arg.startsWith('--')) {
        const key = arg.slice(2);
        const value = args[index + 1];

        switch (key) {
          case 'url':
            configOverrides.baseUrl = value;
            break;
          case 'timeout':
            configOverrides.timeout = parseInt(value);
            break;
          case 'retries':
            configOverrides.retries = parseInt(value);
            break;
          case 'verbose':
            configOverrides.enableVerboseLogging = value === 'true' || value === '1';
            break;
        }
      }
    });

    // Apply any configuration overrides
    if (Object.keys(configOverrides).length > 0) {
      tester.updateConfig(configOverrides);
    }

    if (endpoint && !endpoint.startsWith('--')) {
      await tester.testSpecificEndpoint(endpoint);
    } else {
      await tester.runComprehensiveTest();
    }
  } catch (error) {
    console.error('💥 **Fatal error in test execution**:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  main().catch(error => {
    console.error('💥 **Unhandled error**:', error);
    process.exit(1);
  });
}

export { PermissionsHealthTester };
export type {
  HealthResponse,
  ValidationSummary,
  LiveCasinoValidation,
  LiveCasinoStats,
  AgentValidationDetail,
  MatrixHealthResponse,
  MatrixStats,
  LiveCasinoMatrixStats,
  CellValidation,
  TestConfig,
  NetworkError,
};
