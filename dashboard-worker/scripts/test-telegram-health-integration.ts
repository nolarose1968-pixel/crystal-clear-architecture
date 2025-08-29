#!/usr/bin/env bun

/**
 * 🧪 Test Telegram Health Check Integration
 *
 * Tests the integration between health check CLI and Telegram workflow system
 *
 * @version 1.0.0
 * @author Fire22 Development Team
 */

import { HealthCheckCommandHandler } from '../src/telegram/telegram-health-workflow';
import { HealthMonitor } from '../src/monitoring/health-check';

interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  duration?: number;
}

class TelegramHealthIntegrationTester {
  private results: TestResult[] = [];
  private healthHandler: HealthCheckCommandHandler;

  constructor() {
    this.healthHandler = new HealthCheckCommandHandler();
  }

  /**
   * Run all integration tests
   */
  async runAllTests(): Promise<void> {
    console.log('🧪 Testing Telegram Health Check Integration');
    console.log('!==!==!==!==!==!==!==!==\n');

    await this.testHealthMonitorIntegration();
    await this.testWorkflowStepIntegration();
    await this.testCommandHandlerIntegration();
    await this.testCallbackHandlerIntegration();

    this.printResults();
  }

  /**
   * Test HealthMonitor integration
   */
  private async testHealthMonitorIntegration(): Promise<void> {
    const startTime = Date.now();

    try {
      console.log('🔍 Testing HealthMonitor Integration...');

      // Test that we can access the health monitor
      const healthMonitor = (this.healthHandler as any).healthMonitor;
      if (!healthMonitor || !(healthMonitor instanceof HealthMonitor)) {
        throw new Error('HealthMonitor not properly initialized');
      }

      // Test basic health check
      const healthStatus = await healthMonitor.getSystemHealth();

      if (!healthStatus.status || !healthStatus.components) {
        throw new Error('Health status structure is invalid');
      }

      // Test component access
      const components = Object.keys(healthStatus.components);
      if (!components.includes('database') || !components.includes('api')) {
        throw new Error('Required components not found in health status');
      }

      this.results.push({
        test: 'HealthMonitor Integration',
        status: 'pass',
        message: 'HealthMonitor properly integrated and functional',
        duration: Date.now() - startTime,
      });
    } catch (error) {
      this.results.push({
        test: 'HealthMonitor Integration',
        status: 'fail',
        message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime,
      });
    }
  }

  /**
   * Test Workflow Step Integration
   */
  private async testWorkflowStepIntegration(): Promise<void> {
    const startTime = Date.now();

    try {
      console.log('🔄 Testing Workflow Step Integration...');

      // Import workflow steps dynamically to test integration
      const { HealthCheckWorkflowSteps } = await import('../src/telegram/telegram-health-workflow');

      // Test that workflow steps are properly defined
      const systemCheckStep = HealthCheckWorkflowSteps.systemHealthCheck();
      if (!systemCheckStep.id || !systemCheckStep.handler) {
        throw new Error('System health check step not properly defined');
      }

      const componentCheckStep = HealthCheckWorkflowSteps.componentHealthCheck();
      if (!componentCheckStep.id || !componentCheckStep.handler) {
        throw new Error('Component health check step not properly defined');
      }

      // Test step properties
      if (systemCheckStep.id !== 'health_system_check') {
        throw new Error('System check step has wrong ID');
      }

      if (
        componentCheckStep.permissions &&
        !componentCheckStep.permissions.includes('ops_analyst')
      ) {
        throw new Error('Component check step missing required permissions');
      }

      this.results.push({
        test: 'Workflow Step Integration',
        status: 'pass',
        message: 'Workflow steps properly defined and integrated',
        duration: Date.now() - startTime,
      });
    } catch (error) {
      this.results.push({
        test: 'Workflow Step Integration',
        status: 'fail',
        message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime,
      });
    }
  }

  /**
   * Test Command Handler Integration
   */
  private async testCommandHandlerIntegration(): Promise<void> {
    const startTime = Date.now();

    try {
      console.log('🤖 Testing Command Handler Integration...');

      // Test that command handler has required methods
      if (typeof this.healthHandler.handleHealthCommand !== 'function') {
        throw new Error('handleHealthCommand method not found');
      }

      // Test method accessibility
      const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this.healthHandler));
      const requiredMethods = ['handleHealthCommand', 'cleanup'];

      for (const method of requiredMethods) {
        if (!methods.includes(method)) {
          throw new Error(`Required method '${method}' not found in HealthCheckCommandHandler`);
        }
      }

      // Test cleanup method
      this.healthHandler.cleanup();

      this.results.push({
        test: 'Command Handler Integration',
        status: 'pass',
        message: 'Command handler properly integrated with required methods',
        duration: Date.now() - startTime,
      });
    } catch (error) {
      this.results.push({
        test: 'Command Handler Integration',
        status: 'fail',
        message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime,
      });
    }
  }

  /**
   * Test Callback Handler Integration
   */
  private async testCallbackHandlerIntegration(): Promise<void> {
    const startTime = Date.now();

    try {
      console.log('📱 Testing Callback Handler Integration...');

      // Test that workflow orchestrator can handle health callbacks
      const { TelegramWorkflowOrchestrator } = await import('../src/telegram/telegram-workflow');

      // Check if the orchestrator has health-related methods
      const proto = TelegramWorkflowOrchestrator.prototype;
      const methods = Object.getOwnPropertyNames(proto);

      if (!methods.includes('handleHealthCallback')) {
        throw new Error('handleHealthCallback method not found in orchestrator');
      }

      if (!methods.includes('handleHealthDetails')) {
        throw new Error('handleHealthDetails method not found in orchestrator');
      }

      this.results.push({
        test: 'Callback Handler Integration',
        status: 'pass',
        message: 'Callback handlers properly integrated in workflow orchestrator',
        duration: Date.now() - startTime,
      });
    } catch (error) {
      this.results.push({
        test: 'Callback Handler Integration',
        status: 'fail',
        message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime,
      });
    }
  }

  /**
   * Print test results
   */
  private printResults(): void {
    console.log('\n📊 Test Results Summary');
    console.log('!==!==!==!====');

    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const skipped = this.results.filter(r => r.status === 'skip').length;

    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️ Skipped: ${skipped}`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'fail')
        .forEach(result => {
          console.log(`  • ${result.test}: ${result.message}`);
        });
    }

    console.log('\n📋 Detailed Results:');
    this.results.forEach(result => {
      const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏭️';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`${icon} ${result.test}${duration}: ${result.message}`);
    });

    // Overall result
    if (failed === 0) {
      console.log(
        '\n🎉 All integration tests passed! Telegram health check integration is working correctly.'
      );
    } else {
      console.log(`\n⚠️ ${failed} test(s) failed. Please check the integration.`);
      process.exit(1);
    }
  }

  /**
   * Run specific test
   */
  async runTest(testName: string): Promise<void> {
    switch (testName) {
      case 'health-monitor':
        await this.testHealthMonitorIntegration();
        break;
      case 'workflow-steps':
        await this.testWorkflowStepIntegration();
        break;
      case 'command-handler':
        await this.testCommandHandlerIntegration();
        break;
      case 'callback-handler':
        await this.testCallbackHandlerIntegration();
        break;
      default:
        console.error(`Unknown test: ${testName}`);
        console.log(
          'Available tests: health-monitor, workflow-steps, command-handler, callback-handler'
        );
        return;
    }

    this.printResults();
  }
}

// CLI Interface
function showUsage(): void {
  console.log(`
🧪 Telegram Health Integration Tester

USAGE:
  bun run scripts/test-telegram-health-integration.ts [test-name]

TESTS:
  health-monitor    Test HealthMonitor integration
  workflow-steps    Test workflow step integration
  command-handler   Test command handler integration
  callback-handler  Test callback handler integration

EXAMPLES:
  bun run scripts/test-telegram-health-integration.ts
  bun run scripts/test-telegram-health-integration.ts health-monitor
  bun run scripts/test-telegram-health-integration.ts workflow-steps
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    showUsage();
    return;
  }

  const tester = new TelegramHealthIntegrationTester();

  if (args.length === 0) {
    // Run all tests
    await tester.runAllTests();
  } else {
    // Run specific test
    const testName = args[0];
    await tester.runTest(testName);
  }
}

// Run tests if this file is executed directly
if (import.meta.main) {
  main().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

export default TelegramHealthIntegrationTester;
