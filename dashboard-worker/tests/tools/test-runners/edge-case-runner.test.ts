#!/usr/bin/env bun

/**
 * 🛡️ Edge Case Test Runner
 * Orchestrates comprehensive edge case testing with detailed reporting
 */

import { spawn } from 'bun';
import { EdgeCaseHelpers } from '../test/utils/edge-case-helpers';
import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface EdgeCaseTestSuite {
  name: string;
  emoji: string;
  description: string;
  testFile: string;
  timeout: number;
  memoryLimit: number;
}

interface EdgeCaseResult {
  suite: string;
  passed: number;
  failed: number;
  skipped: number;
  duration: string;
  success: boolean;
  issues: string[];
  recommendations: string[];
}

export class EdgeCaseTestRunner {
  private rootPath: string;
  private resultsDir: string;

  // 🛡️ Edge case test suites
  private testSuites: EdgeCaseTestSuite[] = [
    {
      name: 'Runtime Environment',
      emoji: '⚡',
      description: 'Bun version compatibility, memory pressure, and concurrency',
      testFile: 'test/edge-cases/runtime-environment.test.ts',
      timeout: 60000, // 1 minute
      memoryLimit: 256, // 256MB
    },
    {
      name: 'Workspace Edge Cases',
      emoji: '🏗️',
      description: 'Package corruption, dependency resolution, and workspace validation',
      testFile: 'test/edge-cases/workspace-edge-cases.test.ts',
      timeout: 45000, // 45 seconds
      memoryLimit: 128, // 128MB
    },
    {
      name: 'Pattern System',
      emoji: '🕸️',
      description: 'Pattern connections, timeouts, and memory management',
      testFile: 'test/edge-cases/pattern-edge-cases.test.ts',
      timeout: 90000, // 1.5 minutes
      memoryLimit: 256, // 256MB
    },
  ];

  constructor(rootPath: string = process.cwd()) {
    this.rootPath = rootPath;
    this.resultsDir = join(rootPath, 'edge-case-results');

    // Ensure results directory exists
    if (!existsSync(this.resultsDir)) {
      mkdirSync(this.resultsDir, { recursive: true });
    }
  }

  /**
   * 🛡️ Run comprehensive edge case test suite
   */
  async runAllEdgeCases(
    options: {
      verbose?: boolean;
      failFast?: boolean;
      generateReport?: boolean;
      smol?: boolean;
    } = {}
  ): Promise<{
    success: boolean;
    results: EdgeCaseResult[];
    summary: {
      totalSuites: number;
      passedSuites: number;
      failedSuites: number;
      totalTests: number;
      totalPassed: number;
      totalFailed: number;
      totalSkipped: number;
      duration: string;
    };
  }> {
    const startTime = Bun.nanoseconds();

    console.log('🛡️ Fire22 Edge Case Test Suite');
    console.log('='.repeat(50));
    console.log(`📊 Running ${this.testSuites.length} edge case test suites\n`);

    const results: EdgeCaseResult[] = [];
    let shouldStop = false;

    for (const suite of this.testSuites) {
      if (shouldStop && options.failFast) {
        console.log(`⏭️ Skipping remaining suites due to --fail-fast\n`);
        break;
      }

      console.log(`${suite.emoji} Running ${suite.name} edge cases...`);
      console.log(`   📝 ${suite.description}`);

      if (options.verbose) {
        console.log(`   📁 Test file: ${suite.testFile}`);
        console.log(`   ⏱️ Timeout: ${suite.timeout}ms`);
        console.log(`   🧠 Memory limit: ${suite.memoryLimit}MB`);
      }

      const suiteResult = await this.runEdgeCaseSuite(suite, options);
      results.push(suiteResult);

      // Display suite results
      const statusIcon = suiteResult.success ? '✅' : '❌';
      console.log(
        `   ${statusIcon} ${suiteResult.passed} passed, ${suiteResult.failed} failed, ${suiteResult.skipped} skipped (${suiteResult.duration})`
      );

      if (!suiteResult.success) {
        shouldStop = true;
        console.log(`   ⚠️  Issues found: ${suiteResult.issues.length}`);
        if (options.verbose && suiteResult.issues.length > 0) {
          suiteResult.issues.forEach(issue => console.log(`      • ${issue}`));
        }
      }

      console.log(); // Empty line for readability
    }

    const endTime = Bun.nanoseconds();
    const totalDuration = (endTime - startTime) / 1_000_000;

    // Calculate summary
    const summary = this.calculateSummary(results, totalDuration);

    // Display summary
    this.displaySummary(summary, results);

    // Generate detailed report if requested
    if (options.generateReport) {
      await this.generateDetailedReport(results, summary);
    }

    return {
      success: summary.failedSuites === 0,
      results,
      summary,
    };
  }

  /**
   * 🧪 Run specific edge case suite
   */
  private async runEdgeCaseSuite(
    suite: EdgeCaseTestSuite,
    options: { verbose?: boolean; smol?: boolean }
  ): Promise<EdgeCaseResult> {
    const startTime = Date.now();

    // Check if test file exists
    const testFilePath = join(this.rootPath, suite.testFile);
    if (!existsSync(testFilePath)) {
      return {
        suite: suite.name,
        passed: 0,
        failed: 1,
        skipped: 0,
        duration: '0ms',
        success: false,
        issues: [`Test file not found: ${suite.testFile}`],
        recommendations: [`Create the test file: ${suite.testFile}`],
      };
    }

    try {
      // Build Bun test command
      const args = ['test', testFilePath];

      if (options.smol) {
        args.push('--smol');
      }

      args.push('--timeout', suite.timeout.toString());

      // Run the test suite with memory constraints
      const result = await EdgeCaseHelpers.runWithMemoryConstraints(async () => {
        const proc = spawn({
          cmd: ['bun', ...args],
          cwd: this.rootPath,
          stdout: 'pipe',
          stderr: 'pipe',
          env: {
            ...process.env,
            BUN_ENV: 'test',
            NODE_ENV: 'test',
            EDGE_CASE_TESTING: 'true',
          },
        });

        return await this.processTestOutput(proc, suite);
      }, suite.memoryLimit);

      const duration = Date.now() - startTime;

      if (result.success && result.result) {
        return {
          ...result.result,
          duration: `${duration}ms`,
          success: result.result.failed === 0,
          issues: result.result.failed > 0 ? [`${result.result.failed} tests failed`] : [],
          recommendations:
            result.result.failed > 0
              ? [
                  'Review test output for specific failure details',
                  'Check edge case handling in implementation',
                ]
              : [],
        };
      } else {
        return {
          suite: suite.name,
          passed: 0,
          failed: 1,
          skipped: 0,
          duration: `${duration}ms`,
          success: false,
          issues: [result.message || 'Test execution failed under memory constraints'],
          recommendations: [
            'Reduce memory usage in test implementation',
            'Optimize test data structures',
            'Consider using --smol flag',
          ],
        };
      }
    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        suite: suite.name,
        passed: 0,
        failed: 1,
        skipped: 0,
        duration: `${duration}ms`,
        success: false,
        issues: [`Test suite execution failed: ${error.message}`],
        recommendations: [
          'Check test file syntax and imports',
          'Verify test environment setup',
          'Review error logs for specific issues',
        ],
      };
    }
  }

  /**
   * 📊 Process test output and extract results
   */
  private async processTestOutput(
    proc: any,
    suite: EdgeCaseTestSuite
  ): Promise<{
    suite: string;
    passed: number;
    failed: number;
    skipped: number;
  }> {
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    let output = '';

    try {
      // Collect stdout
      for await (const chunk of proc.stdout) {
        const text = new TextDecoder().decode(chunk);
        output += text;

        // Count test results in real-time
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.includes('✓') || line.match(/^\s*\d+\s*\|\s*pass/i)) {
            passed++;
          } else if (line.includes('✗') || line.match(/^\s*\d+\s*\|\s*fail/i)) {
            failed++;
          } else if (line.includes('skip') || line.match(/^\s*\d+\s*\|\s*skip/i)) {
            skipped++;
          }
        }
      }

      // Handle stderr
      let errorOutput = '';
      try {
        errorOutput = await proc.stderr.text();
        if (errorOutput.trim()) {
          console.warn(`   ⚠️ ${suite.name} stderr:`, errorOutput);
        }
      } catch (e) {
        // Ignore stderr reading errors
      }

      const exitCode = await proc.exited;

      // If no explicit counts found, infer from exit code
      if (passed === 0 && failed === 0 && skipped === 0) {
        if (exitCode === 0) {
          passed = 1; // At least one test must have passed
        } else {
          failed = 1; // Something failed
        }
      }

      // Save test output for debugging
      if (output.trim()) {
        const outputFile = join(
          this.resultsDir,
          `${suite.name.toLowerCase().replace(/\s+/g, '-')}-output.log`
        );
        writeFileSync(outputFile, output);
      }

      return {
        suite: suite.name,
        passed,
        failed,
        skipped,
      };
    } catch (error) {
      console.warn(`   ⚠️ Error processing ${suite.name} output:`, error);
      return {
        suite: suite.name,
        passed: 0,
        failed: 1,
        skipped: 0,
      };
    }
  }

  /**
   * 📊 Calculate test summary statistics
   */
  private calculateSummary(results: EdgeCaseResult[], totalDuration: number) {
    const totalSuites = results.length;
    const passedSuites = results.filter(r => r.success).length;
    const failedSuites = results.filter(r => !r.success).length;

    const totalTests = results.reduce((sum, r) => sum + r.passed + r.failed + r.skipped, 0);
    const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
    const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);

    return {
      totalSuites,
      passedSuites,
      failedSuites,
      totalTests,
      totalPassed,
      totalFailed,
      totalSkipped,
      duration: `${totalDuration.toFixed(2)}ms`,
    };
  }

  /**
   * 📊 Display test summary
   */
  private displaySummary(summary: any, results: EdgeCaseResult[]) {
    console.log('🛡️ Edge Case Test Summary');
    console.log('='.repeat(40));

    // Overall status
    const overallStatus = summary.failedSuites === 0 ? '✅ ALL PASSED' : '❌ SOME FAILED';
    console.log(`📊 Overall Status: ${overallStatus}`);
    console.log();

    // Suite-level results
    console.log('📋 Suite Results:');
    for (const result of results) {
      const icon = result.success ? '✅' : '❌';
      const suite = this.testSuites.find(s => s.name === result.suite);
      console.log(
        `   ${icon} ${suite?.emoji || '🧪'} ${result.suite}: ${result.passed}/${result.passed + result.failed + result.skipped}`
      );
    }
    console.log();

    // Summary statistics
    console.log('📊 Statistics:');
    console.log(`   Test Suites: ${summary.passedSuites}/${summary.totalSuites} passed`);
    console.log(`   Total Tests: ${summary.totalPassed}/${summary.totalTests} passed`);
    console.log(`   Failed: ${summary.totalFailed}`);
    console.log(`   Skipped: ${summary.totalSkipped}`);
    console.log(`   Duration: ${summary.duration}`);

    // Issues and recommendations
    const allIssues = results.flatMap(r => r.issues);
    if (allIssues.length > 0) {
      console.log('\n⚠️ Issues Found:');
      allIssues.forEach(issue => console.log(`   • ${issue}`));

      console.log('\n💡 Recommendations:');
      const allRecommendations = [...new Set(results.flatMap(r => r.recommendations))];
      allRecommendations.forEach(rec => console.log(`   • ${rec}`));
    }
  }

  /**
   * 📝 Generate detailed HTML report
   */
  private async generateDetailedReport(results: EdgeCaseResult[], summary: any): Promise<void> {
    const reportPath = join(this.resultsDir, `edge-case-report-${Date.now()}.html`);

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🛡️ Fire22 Edge Case Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 3px solid #007acc; padding-bottom: 10px; }
        h2 { color: #555; margin-top: 30px; }
        .summary { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .success { color: #28a745; }
        .failure { color: #dc3545; }
        .suite { margin: 20px 0; padding: 15px; border-left: 4px solid #007acc; background: #f8f9fa; }
        .suite.failed { border-left-color: #dc3545; background: #fff5f5; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
        .metric { text-align: center; padding: 15px; background: #e9ecef; border-radius: 6px; }
        .metric .value { font-size: 24px; font-weight: bold; color: #007acc; }
        .metric .label { color: #666; font-size: 12px; text-transform: uppercase; }
        .issues { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 10px 0; }
        .recommendations { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 10px 0; }
        ul { margin: 10px 0; padding-left: 20px; }
        .timestamp { color: #999; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🛡️ Fire22 Edge Case Test Report</h1>
        <p class="timestamp">Generated: ${new Date().toLocaleString()}</p>
        
        <div class="summary">
            <h2>📊 Test Summary</h2>
            <div class="metrics">
                <div class="metric">
                    <div class="value ${summary.failedSuites === 0 ? 'success' : 'failure'}">${summary.passedSuites}/${summary.totalSuites}</div>
                    <div class="label">Suites Passed</div>
                </div>
                <div class="metric">
                    <div class="value ${summary.totalFailed === 0 ? 'success' : 'failure'}">${summary.totalPassed}/${summary.totalTests}</div>
                    <div class="label">Tests Passed</div>
                </div>
                <div class="metric">
                    <div class="value">${summary.totalFailed}</div>
                    <div class="label">Failed</div>
                </div>
                <div class="metric">
                    <div class="value">${summary.totalSkipped}</div>
                    <div class="label">Skipped</div>
                </div>
                <div class="metric">
                    <div class="value">${summary.duration}</div>
                    <div class="label">Duration</div>
                </div>
            </div>
        </div>
        
        <h2>📋 Suite Details</h2>
        ${results
          .map(result => {
            const suite = this.testSuites.find(s => s.name === result.suite);
            return `
            <div class="suite ${result.success ? '' : 'failed'}">
                <h3>${suite?.emoji || '🧪'} ${result.suite}</h3>
                <p><strong>Description:</strong> ${suite?.description || 'No description available'}</p>
                <p><strong>Results:</strong> ${result.passed} passed, ${result.failed} failed, ${result.skipped} skipped (${result.duration})</p>
                
                ${
                  result.issues.length > 0
                    ? `
                    <div class="issues">
                        <strong>⚠️ Issues:</strong>
                        <ul>${result.issues.map(issue => `<li>${issue}</li>`).join('')}</ul>
                    </div>
                `
                    : ''
                }
                
                ${
                  result.recommendations.length > 0
                    ? `
                    <div class="recommendations">
                        <strong>💡 Recommendations:</strong>
                        <ul>${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}</ul>
                    </div>
                `
                    : ''
                }
            </div>
          `;
          })
          .join('')}
        
        <h2>🔧 Test Configuration</h2>
        <div class="suite">
            <h3>Test Suites Configuration</h3>
            ${this.testSuites
              .map(
                suite => `
                <p><strong>${suite.emoji} ${suite.name}:</strong><br>
                   File: <code>${suite.testFile}</code><br>
                   Timeout: ${suite.timeout}ms<br>
                   Memory Limit: ${suite.memoryLimit}MB</p>
            `
              )
              .join('')}
        </div>
    </div>
</body>
</html>
    `;

    writeFileSync(reportPath, html);
    console.log(`\n📝 Detailed report generated: ${reportPath}`);
  }

  /**
   * 🧪 Run specific edge case suite by name
   */
  async runSpecificSuite(
    suiteName: string,
    options: { verbose?: boolean; smol?: boolean } = {}
  ): Promise<EdgeCaseResult> {
    const suite = this.testSuites.find(
      s =>
        s.name.toLowerCase().includes(suiteName.toLowerCase()) ||
        suiteName.toLowerCase().includes(s.name.toLowerCase())
    );

    if (!suite) {
      throw new Error(
        `Edge case suite not found: ${suiteName}. Available: ${this.testSuites.map(s => s.name).join(', ')}`
      );
    }

    console.log(`🛡️ Running ${suite.name} edge cases...`);
    return await this.runEdgeCaseSuite(suite, options);
  }
}

// CLI interface for direct execution
if (import.meta.main) {
  const args = process.argv.slice(2);
  const runner = new EdgeCaseTestRunner();

  const options = {
    verbose: args.includes('--verbose') || args.includes('-v'),
    failFast: args.includes('--fail-fast'),
    generateReport: args.includes('--report'),
    smol: args.includes('--smol'),
  };

  const suiteFilter = args.find(arg => !arg.startsWith('--'));

  try {
    if (suiteFilter) {
      // Run specific suite
      const result = await runner.runSpecificSuite(suiteFilter, options);
      const success = result.success;

      console.log(
        `\n🛡️ ${result.suite} Results: ${result.passed} passed, ${result.failed} failed (${result.duration})`
      );

      if (!success && result.issues.length > 0) {
        console.log(`⚠️ Issues: ${result.issues.join(', ')}`);
      }

      process.exit(success ? 0 : 1);
    } else {
      // Run all edge case suites
      const results = await runner.runAllEdgeCases(options);
      process.exit(results.success ? 0 : 1);
    }
  } catch (error) {
    console.error('❌ Edge case test runner failed:', error.message);
    process.exit(1);
  }
}

export default EdgeCaseTestRunner;
