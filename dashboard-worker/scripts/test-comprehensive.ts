#!/usr/bin/env bun

/**
 * Comprehensive Test Suite for Fire22 Dashboard Worker
 * Runs all tests with proper error handling and reporting
 */

import { $ } from "bun";
import * as path from "path";
import { existsSync } from "fs";

interface TestSuite {
  name: string;
  path: string;
  pattern?: string;
  critical?: boolean;
}

interface TestResult {
  suite: string;
  passed: boolean;
  tests: number;
  failures: number;
  time: number;
  error?: string;
}

class ComprehensiveTestRunner {
  private results: TestResult[] = [];
  private startTime = Date.now();

  async run() {
    console.log("🧪 Fire22 Dashboard Worker - Comprehensive Test Suite");
    console.log("━".repeat(60));
    
    // Define test suites in order of importance
    const testSuites: TestSuite[] = [
      // Unit Tests
      { name: "Utils", path: "tests/unit/utils", critical: true },
      { name: "Config", path: "tests/unit/config", critical: true },
      { name: "Database", path: "tests/unit/database" },
      { name: "API", path: "tests/unit/api" },
      { name: "Components", path: "tests/unit/components" },
      { name: "Patterns", path: "tests/unit/patterns" },
      
      // Integration Tests
      { name: "Health", path: "tests/integration/health" },
      { name: "Security", path: "tests/integration/security" },
      { name: "Performance", path: "tests/integration/performance" },
      
      // Security Tests
      { name: "Security Audit", path: "tests/security" },
      
      // Edge Cases
      { name: "Edge Cases", path: "tests/edge-cases", pattern: "*.test.ts" },
      
      // Performance Tests
      { name: "Performance", path: "tests/performance" },
      
      // E2E Tests
      { name: "E2E", path: "tests/e2e" },
      
      // Core Tests
      { name: "Migrations", path: "tests", pattern: "migrations.test.ts" },
      { name: "Fire22 API", path: "tests", pattern: "fire22-api-integration.test.ts" }
    ];

    // Filter to only existing test paths
    const availableSuites = testSuites.filter(suite => {
      const fullPath = path.join(process.cwd(), suite.path);
      const exists = existsSync(fullPath);
      if (!exists && suite.critical) {
        console.log(`⚠️  Critical test path missing: ${suite.path}`);
      }
      return exists;
    });

    console.log(`\n📊 Found ${availableSuites.length} test suites to run\n`);

    // Run each test suite
    for (const suite of availableSuites) {
      await this.runTestSuite(suite);
    }

    // Print detailed summary
    this.printSummary();

    // Exit with appropriate code
    const hasFailures = this.results.some(r => !r.passed);
    const criticalFailure = this.results.some(r => {
      const suite = availableSuites.find(s => s.name === r.suite);
      return suite?.critical && !r.passed;
    });

    if (criticalFailure) {
      console.log("\n❌ Critical test failures detected!");
      process.exit(2);
    } else if (hasFailures) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }

  private async runTestSuite(suite: TestSuite): Promise<void> {
    const startTime = performance.now();
    console.log(`\n📦 Testing ${suite.name}...`);
    
    try {
      // Construct test command
      const testPath = suite.pattern 
        ? `${suite.path}/${suite.pattern}`
        : suite.path;
      
      // Run tests with coverage if available
      const proc = Bun.spawn([
        "/opt/homebrew/bin/bun", 
        "test", 
        testPath,
        "--bail",
        "--coverage"
      ], {
        stdout: "pipe",
        stderr: "pipe",
        env: {
          ...process.env,
          FORCE_COLOR: "0"  // Disable colors for cleaner parsing
        }
      });
      
      const [stdout, stderr, exitCode] = await Promise.all([
        proc.stdout.text(),
        proc.stderr.text(),
        proc.exited
      ]);
      
      const elapsed = performance.now() - startTime;
      
      // Parse test output
      const testStats = this.parseTestOutput(stdout);
      
      if (exitCode === 0) {
        this.results.push({
          suite: suite.name,
          passed: true,
          tests: testStats.tests,
          failures: 0,
          time: elapsed
        });
        console.log(`  ✅ ${suite.name}: ${testStats.tests} tests passed (${(elapsed / 1000).toFixed(2)}s)`);
      } else {
        const error = stderr || this.extractError(stdout);
        this.results.push({
          suite: suite.name,
          passed: false,
          tests: testStats.tests,
          failures: testStats.failures,
          time: elapsed,
          error: error.slice(0, 200)  // Truncate error message
        });
        console.log(`  ❌ ${suite.name}: ${testStats.failures} failures (${(elapsed / 1000).toFixed(2)}s)`);
        
        // Show first error for debugging
        if (error) {
          const errorLines = error.split('\n').slice(0, 3);
          errorLines.forEach(line => console.log(`     ${line}`));
        }
      }
    } catch (error: any) {
      const elapsed = performance.now() - startTime;
      this.results.push({
        suite: suite.name,
        passed: false,
        tests: 0,
        failures: 1,
        time: elapsed,
        error: error.message
      });
      console.log(`  ❌ ${suite.name} error: ${error.message}`);
    }
  }

  private parseTestOutput(output: string): { tests: number; failures: number } {
    // Parse Bun test output
    const passMatch = output.match(/(\d+)\s+pass/);
    const failMatch = output.match(/(\d+)\s+fail/);
    const testMatch = output.match(/Ran\s+(\d+)\s+tests?/);
    
    return {
      tests: testMatch ? parseInt(testMatch[1]) : 0,
      failures: failMatch ? parseInt(failMatch[1]) : 0
    };
  }

  private extractError(output: string): string {
    // Extract error message from test output
    const errorMatch = output.match(/error:\s+(.+)/i);
    if (errorMatch) return errorMatch[1];
    
    const failMatch = output.match(/\(fail\)\s+(.+)/);
    if (failMatch) return failMatch[1];
    
    const lines = output.split('\n');
    const errorLine = lines.find(line => 
      line.includes('error') || 
      line.includes('Error') || 
      line.includes('failed')
    );
    
    return errorLine || 'Test failed';
  }

  private printSummary() {
    console.log("\n" + "━".repeat(60));
    console.log("📊 Test Summary");
    console.log("━".repeat(60));

    const totalTests = this.results.reduce((acc, r) => acc + r.tests, 0);
    const totalFailures = this.results.reduce((acc, r) => acc + r.failures, 0);
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const totalTime = (Date.now() - this.startTime) / 1000;

    // Results table
    console.log("\n📋 Results:");
    console.log("─".repeat(60));
    console.log("  Suite                    Tests   Status     Time");
    console.log("─".repeat(60));
    
    this.results.forEach(result => {
      const icon = result.passed ? "✅" : "❌";
      const status = result.passed ? "PASS" : "FAIL";
      const time = (result.time / 1000).toFixed(2) + "s";
      const suiteName = result.suite.padEnd(22);
      const tests = result.tests.toString().padStart(5);
      
      console.log(`  ${icon} ${suiteName} ${tests}   ${status.padEnd(9)} ${time}`);
    });

    // Summary stats
    console.log("\n📈 Statistics:");
    console.log(`  Total Test Suites: ${this.results.length}`);
    console.log(`  Passed Suites: ${passed}`);
    console.log(`  Failed Suites: ${failed}`);
    console.log(`  Total Tests Run: ${totalTests}`);
    console.log(`  Total Failures: ${totalFailures}`);
    console.log(`  Total Time: ${totalTime.toFixed(2)}s`);
    console.log(`  Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`);

    // Final status
    console.log("\n" + "━".repeat(60));
    if (failed === 0) {
      console.log("🎉 All test suites passed! Ready for deployment.");
    } else {
      console.log(`⚠️  ${failed} test suite(s) failed. See details above.`);
      
      // Show failing suites
      console.log("\n📝 Failed Suites:");
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  • ${r.suite}: ${r.error || 'Unknown error'}`);
        });
    }
  }
}

// Main execution
async function main() {
  try {
    console.log("🔍 Pre-flight checks...");
    
    // Check Bun version
    const bunVersion = Bun.version;
    console.log(`  ✓ Bun version: ${bunVersion}`);
    
    // Check test directory exists
    if (!existsSync("tests")) {
      console.error("  ✗ Tests directory not found!");
      process.exit(1);
    }
    console.log("  ✓ Tests directory found");
    
    // Run comprehensive tests
    const runner = new ComprehensiveTestRunner();
    await runner.run();
  } catch (error) {
    console.error("❌ Test runner failed:", error);
    process.exit(1);
  }
}

// Run tests
main();