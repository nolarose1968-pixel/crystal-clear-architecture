#!/usr/bin/env bun
/**
 * 🧪 Fire22 Integration Test Suite
 * 
 * Tests all integrated tools and commands to ensure they work together
 * Validates the complete Fire22 development environment
 * 
 * @version 3.0.9
 * @author Fire22 Development Team
 */

import { spawn } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface TestResult {
  name: string;
  command: string;
  success: boolean;
  output?: string;
  error?: string;
  duration: number;
}

interface TestCategory {
  name: string;
  tests: TestDefinition[];
}

interface TestDefinition {
  name: string;
  command: string;
  args?: string[];
  timeout?: number;
  checkOutput?: (output: string) => boolean;
}

class IntegrationTester {
  private results: TestResult[] = [];
  private startTime = Date.now();

  /**
   * Define test categories
   */
  private getTestCategories(): TestCategory[] {
    return [
      {
        name: 'CLI Commands',
        tests: [
          { name: 'Fire22 CLI Help', command: 'node', args: ['fire22-cli.js', '--help'] },
          { name: 'Fire22 CLI Version', command: 'node', args: ['fire22-cli.js', '--version'] },
          { name: 'Fire22 Status', command: 'node', args: ['fire22-cli.js', 'status'] },
        ]
      },
      {
        name: 'Health Checks',
        tests: [
          { 
            name: 'Matrix Health Check', 
            command: 'bun', 
            args: ['run', 'scripts/matrix-health.ts'],
            checkOutput: (output) => output.includes('Matrix Health Score')
          },
          { 
            name: 'Integrated Health System', 
            command: 'bun', 
            args: ['run', 'scripts/integrated-health-system.ts', '--quick'],
            timeout: 10000
          }
        ]
      },
      {
        name: 'Monitoring Tools',
        tests: [
          { 
            name: 'Monitor Snapshot', 
            command: 'bun', 
            args: ['run', 'scripts/monitor-snapshot.ts'],
            checkOutput: (output) => output.includes('Fire22 Real-Time Performance Dashboard')
          },
          { 
            name: 'Monitor Tree View', 
            command: 'bun', 
            args: ['run', 'scripts/monitor-snapshot.ts', '--tree'],
            checkOutput: (output) => output.includes('Fire22 Monitor Component Tree')
          },
          { 
            name: 'Monitor Capabilities', 
            command: 'bun', 
            args: ['run', 'scripts/monitor-snapshot.ts', '--capabilities'],
            checkOutput: (output) => output.includes('Fire22 Monitor Capabilities')
          }
        ]
      },
      {
        name: 'Quality Tools',
        tests: [
          { 
            name: 'QA Automation Help', 
            command: 'bun', 
            args: ['run', 'scripts/qa-automation.ts', '--help'],
            checkOutput: (output) => output.includes('Fire22 QA Automation')
          },
          { 
            name: 'Pre-commit Check Help', 
            command: 'bun', 
            args: ['run', 'scripts/pre-commit-check.ts', '--help'],
            checkOutput: (output) => output.includes('Pre-Commit Quality Gate')
          }
        ]
      },
      {
        name: 'Validation Tools',
        tests: [
          { 
            name: 'Dry-Run Validator Help', 
            command: 'bun', 
            args: ['run', 'scripts/dry-run-validator.ts', '--help'],
            checkOutput: (output) => output.includes('Fire22 Dry-Run Validator')
          }
        ]
      },
      {
        name: 'Dashboard & Workflows',
        tests: [
          { 
            name: 'Dashboard Help', 
            command: 'bun', 
            args: ['run', 'scripts/fire22-dashboard.ts', '--help'],
            checkOutput: (output) => output.includes('Fire22 Unified Dashboard')
          },
          { 
            name: 'Workflow List', 
            command: 'bun', 
            args: ['run', 'scripts/workflow-automation.ts', '--list'],
            checkOutput: (output) => output.includes('Available Workflows')
          },
          { 
            name: 'Workflow Help', 
            command: 'bun', 
            args: ['run', 'scripts/workflow-automation.ts', '--help'],
            checkOutput: (output) => output.includes('Fire22 Workflow Automation')
          }
        ]
      },
      {
        name: 'Package.json Scripts',
        tests: [
          { 
            name: 'Dashboard Script', 
            command: 'bun', 
            args: ['run', 'dashboard', '--help'],
            checkOutput: (output) => output.includes('Fire22 Unified Dashboard')
          },
          { 
            name: 'Workflow Script', 
            command: 'bun', 
            args: ['run', 'workflow', '--list'],
            checkOutput: (output) => output.includes('Available Workflows')
          },
          { 
            name: 'Monitor Snapshot Script', 
            command: 'bun', 
            args: ['run', 'monitor:snapshot'],
            checkOutput: (output) => output.includes('Fire22 Real-Time Performance Dashboard')
          }
        ]
      }
    ];
  }

  /**
   * Run a single test
   */
  private async runTest(test: TestDefinition): Promise<TestResult> {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const timeout = test.timeout || 5000;
      let output = '';
      let error = '';
      let timedOut = false;

      const child = spawn(test.command, test.args || [], {
        stdio: 'pipe',
        shell: false
      });

      const timeoutId = setTimeout(() => {
        timedOut = true;
        child.kill();
        resolve({
          name: test.name,
          command: `${test.command} ${test.args?.join(' ') || ''}`,
          success: false,
          error: `Test timed out after ${timeout}ms`,
          duration: Date.now() - startTime
        });
      }, timeout);

      child.stdout?.on('data', (data) => {
        output += data.toString();
      });

      child.stderr?.on('data', (data) => {
        error += data.toString();
      });

      child.on('close', (code) => {
        if (timedOut) return;
        clearTimeout(timeoutId);

        const success = code === 0 && (!test.checkOutput || test.checkOutput(output));
        
        resolve({
          name: test.name,
          command: `${test.command} ${test.args?.join(' ') || ''}`,
          success,
          output: output.slice(0, 200), // Limit output size
          error: error ? error.slice(0, 200) : undefined,
          duration: Date.now() - startTime
        });
      });

      child.on('error', (err) => {
        if (timedOut) return;
        clearTimeout(timeoutId);
        
        resolve({
          name: test.name,
          command: `${test.command} ${test.args?.join(' ') || ''}`,
          success: false,
          error: err.message,
          duration: Date.now() - startTime
        });
      });
    });
  }

  /**
   * Run all integration tests
   */
  async runAllTests(): Promise<void> {
    console.log('🧪 Fire22 Integration Test Suite');
    console.log('=' .repeat(60));
    console.log('Testing all integrated tools and commands...\n');

    const categories = this.getTestCategories();
    let totalTests = 0;
    let passedTests = 0;

    for (const category of categories) {
      console.log(`\n📦 ${category.name}`);
      console.log('-'.repeat(40));

      for (const test of category.tests) {
        totalTests++;
        process.stdout.write(`  Testing ${test.name}... `);
        
        const result = await this.runTest(test);
        this.results.push(result);

        if (result.success) {
          passedTests++;
          console.log(`✅ PASS (${result.duration}ms)`);
        } else {
          console.log(`❌ FAIL (${result.duration}ms)`);
          if (result.error) {
            console.log(`    Error: ${result.error}`);
          }
        }
      }
    }

    // Display summary
    this.displaySummary(totalTests, passedTests);
  }

  /**
   * Display test summary
   */
  private displaySummary(total: number, passed: number): void {
    const failed = total - passed;
    const duration = Date.now() - this.startTime;
    const passRate = ((passed / total) * 100).toFixed(1);

    console.log('\n' + '=' .repeat(60));
    console.log('📊 Test Summary');
    console.log('-'.repeat(60));
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Pass Rate: ${passRate}%`);
    console.log(`⏱️  Duration: ${(duration / 1000).toFixed(1)}s`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => !r.success)
        .forEach(result => {
          console.log(`  • ${result.name}`);
          if (result.error) {
            console.log(`    ${result.error}`);
          }
        });
    }

    // Overall status
    console.log('\n' + '=' .repeat(60));
    if (passed === total) {
      console.log('✅ All integration tests passed! System is ready.');
    } else if (passRate >= '80') {
      console.log('⚠️  Most tests passed, but some issues need attention.');
    } else {
      console.log('❌ Integration tests failed. Please fix issues before proceeding.');
    }
  }

  /**
   * Quick smoke test
   */
  async runSmokeTest(): Promise<boolean> {
    console.log('🔥 Running smoke test...\n');

    const criticalTests: TestDefinition[] = [
      { name: 'CLI Available', command: 'node', args: ['fire22-cli.js', '--version'] },
      { name: 'Scripts Directory', command: 'ls', args: ['scripts'] },
      { name: 'Package.json', command: 'ls', args: ['package.json'] }
    ];

    for (const test of criticalTests) {
      const result = await this.runTest(test);
      if (!result.success) {
        console.log(`❌ Critical test failed: ${test.name}`);
        return false;
      }
      console.log(`✅ ${test.name}`);
    }

    console.log('\n✅ Smoke test passed!');
    return true;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const tester = new IntegrationTester();

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🧪 Fire22 Integration Test Suite

DESCRIPTION:
  Tests all integrated tools and commands to ensure they work together.
  Validates the complete Fire22 development environment.

USAGE:
  bun run scripts/test-integration.ts [options]

OPTIONS:
  --smoke        Run quick smoke test only
  --help, -h     Show this help message

EXAMPLES:
  bun run scripts/test-integration.ts          # Run all tests
  bun run scripts/test-integration.ts --smoke  # Quick smoke test
  fire22 test:integration                      # Via package.json

🔥 Fire22 Development Team - Enterprise Dashboard System
`);
    process.exit(0);
  }

  if (args.includes('--smoke')) {
    const success = await tester.runSmokeTest();
    process.exit(success ? 0 : 1);
  }

  try {
    await tester.runAllTests();
    const allPassed = tester['results'].every(r => r.success);
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('💥 Integration tests failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  main().catch(error => {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  });
}

export { IntegrationTester };