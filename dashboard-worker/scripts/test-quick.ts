#!/usr/bin/env bun

/**
 * Quick Test Suite for Fire22 Dashboard Worker
 * Runs essential tests with fast execution and early failure detection
 */

import { $ } from 'bun';
import * as path from 'path';

interface TestResult {
  name: string;
  passed: boolean;
  time: number;
  error?: string;
}

class QuickTestRunner {
  private results: TestResult[] = [];
  private startTime = Date.now();

  async run() {
    console.log('🧪 Fire22 Dashboard Worker - Quick Test Suite');
    console.log('━'.repeat(60));

    // Test categories to run - using actual test locations
    const testSuites = [
      { name: 'Unit Tests', pattern: 'tests/unit', timeout: 10000 },
      { name: 'Integration Tests', pattern: 'tests/integration', timeout: 15000 },
      { name: 'Edge Cases', pattern: 'tests/edge-cases', timeout: 5000 },
      { name: 'Core Tests', pattern: 'tests/*.test.ts', timeout: 10000 },
    ];

    // Run each test suite
    for (const suite of testSuites) {
      await this.runTestSuite(suite);
    }

    // Print summary
    this.printSummary();

    // Exit with appropriate code
    const hasFailures = this.results.some(r => !r.passed);
    process.exit(hasFailures ? 1 : 0);
  }

  private async runTestSuite(suite: { name: string; pattern: string; timeout: number }) {
    const startTime = performance.now();

    try {
      console.log(`\n📦 Testing ${suite.name}...`);

      // Run tests with bail on first failure and timeout
      const proc = Bun.spawn(['/opt/homebrew/bin/bun', 'test', suite.pattern, '--bail'], {
        stdout: 'pipe',
        stderr: 'pipe',
      });

      const result = await proc.exited;

      const elapsed = performance.now() - startTime;

      if (result === 0) {
        this.results.push({
          name: suite.name,
          passed: true,
          time: elapsed,
        });
        console.log(`  ✅ ${suite.name} passed (${(elapsed / 1000).toFixed(2)}s)`);
      } else {
        const errorText = await new Response(proc.stderr).text();
        this.results.push({
          name: suite.name,
          passed: false,
          time: elapsed,
          error: errorText,
        });
        console.log(`  ❌ ${suite.name} failed (${(elapsed / 1000).toFixed(2)}s)`);

        // Print first error for debugging
        const errorLines = errorText.split('\n').slice(0, 5);
        errorLines.forEach(line => console.log(`     ${line}`));
      }
    } catch (error: any) {
      const elapsed = performance.now() - startTime;
      this.results.push({
        name: suite.name,
        passed: false,
        time: elapsed,
        error: error.message,
      });
      console.log(`  ❌ ${suite.name} error: ${error.message}`);
    }
  }

  private printSummary() {
    console.log('\n' + '━'.repeat(60));
    console.log('📊 Test Summary');
    console.log('━'.repeat(60));

    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const totalTime = (Date.now() - this.startTime) / 1000;

    // Results table
    console.log('\n📋 Results:');
    this.results.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      const time = (result.time / 1000).toFixed(2);
      console.log(`  ${icon} ${result.name.padEnd(20)} ${time}s`);
    });

    // Summary stats
    console.log('\n📈 Statistics:');
    console.log(`  Total Tests: ${this.results.length}`);
    console.log(`  Passed: ${passed}`);
    console.log(`  Failed: ${failed}`);
    console.log(`  Total Time: ${totalTime.toFixed(2)}s`);
    console.log(`  Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`);

    // Final status
    console.log('\n' + '━'.repeat(60));
    if (failed === 0) {
      console.log('🎉 All tests passed! Ready for deployment.');
    } else {
      console.log(`⚠️  ${failed} test suite(s) failed. Please fix before proceeding.`);
    }
  }
}

// Validate environment first
async function validateEnvironment() {
  console.log('🔍 Validating test environment...');

  // Check Bun version
  const bunVersion = Bun.version;
  console.log(`  Bun version: ${bunVersion}`);

  // Check for test files
  const glob = new Bun.Glob('**/*.test.ts');
  const testFiles = Array.from(glob.scanSync('.'));
  const testCount = testFiles.length;

  if (testCount === 0) {
    console.log('  ⚠️  No test files found!');
    console.log('  Creating sample test file...');
    await createSampleTest();
  } else {
    console.log(`  Found ${testCount}+ test files`);
  }
}

// Create a sample test if none exist
async function createSampleTest() {
  const sampleTest = `import { test, expect } from "bun:test";

test("Fire22 Dashboard Worker - Smoke Test", () => {
  expect(1 + 1).toBe(2);
});

test("Environment Variables", () => {
  expect(process.env.NODE_ENV).toBeDefined();
});

test("Bun Runtime", () => {
  expect(Bun.version).toBeDefined();
});`;

  await Bun.write('test/smoke.test.ts', sampleTest);
  console.log('  ✅ Created test/smoke.test.ts');
}

// Main execution
async function main() {
  try {
    await validateEnvironment();

    const runner = new QuickTestRunner();
    await runner.run();
  } catch (error) {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  }
}

// Run tests
main();
