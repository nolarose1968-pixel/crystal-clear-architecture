#!/usr/bin/env bun

/**
 * 📊 Test Performance Benchmark & Regression Monitor
 * Tracks test suite performance over time and detects regressions
 */

import { $ } from "bun";
import { existsSync, writeFileSync, readFileSync, mkdirSync } from "fs";
import { join } from "path";

interface BenchmarkResult {
  timestamp: string;
  gitCommit: string;
  branch: string;
  bunVersion: string;
  testSuite: string;
  duration: number;
  testCount: number;
  passedCount: number;
  failedCount: number;
  coverage?: number;
  memoryUsage?: number;
}

interface BenchmarkAnalysis {
  current: BenchmarkResult;
  baseline?: BenchmarkResult;
  trend: 'improving' | 'stable' | 'regressing';
  regressionThreshold: number;
  performanceScore: number;
}

class TestBenchmarkRunner {
  private benchmarkDir = './reports/benchmarks';
  private historyFile = join(this.benchmarkDir, 'test-performance-history.json');
  private useBunx: boolean;

  constructor(useBunx = false) {
    this.useBunx = process.env.USE_BUNX === 'true' || useBunx;
    this.ensureBenchmarkDirectory();
  }

  private ensureBenchmarkDirectory(): void {
    if (!existsSync(this.benchmarkDir)) {
      mkdirSync(this.benchmarkDir, { recursive: true });
    }
  }

  async runBenchmark(testSuite = 'full'): Promise<BenchmarkAnalysis> {
    console.log("📊 Running test performance benchmark...");
    console.log(`🎯 Test suite: ${testSuite}`);
    console.log(`🔧 Runtime: ${this.useBunx ? 'bunx' : 'bun'}`);
    
    const startTime = Date.now();
    const memoryBefore = process.memoryUsage().heapUsed;

    // Run the test suite
    const result = await this.executeTestSuite(testSuite);
    
    const endTime = Date.now();
    const memoryAfter = process.memoryUsage().heapUsed;
    const duration = endTime - startTime;
    const memoryDelta = memoryAfter - memoryBefore;

    // Get Git info
    const gitInfo = await this.getGitInfo();

    // Create benchmark result
    const benchmarkResult: BenchmarkResult = {
      timestamp: new Date().toISOString(),
      gitCommit: gitInfo.commit,
      branch: gitInfo.branch,
      bunVersion: Bun.version,
      testSuite,
      duration,
      testCount: result.testCount,
      passedCount: result.passedCount,
      failedCount: result.failedCount,
      coverage: result.coverage,
      memoryUsage: Math.round(memoryDelta / 1024 / 1024) // MB
    };

    // Analyze performance
    const analysis = await this.analyzeBenchmark(benchmarkResult);
    
    // Save to history
    this.saveBenchmarkResult(benchmarkResult);
    
    // Generate report
    this.generateReport(analysis);

    return analysis;
  }

  private async executeTestSuite(suite: string): Promise<{
    testCount: number;
    passedCount: number;
    failedCount: number;
    coverage?: number;
  }> {
    const testPaths = this.getTestPaths(suite);
    
    try {
      const bunCommand = this.useBunx ? 'bunx' : '/opt/homebrew/bin/bun';
      const testArgs = this.useBunx 
        ? ['bun', 'test', ...testPaths, '--coverage']
        : ['test', ...testPaths, '--coverage'];

      const proc = Bun.spawn([bunCommand, ...testArgs], {
        stdout: "pipe",
        stderr: "pipe",
        env: {
          ...process.env,
          FORCE_COLOR: "0"
        }
      });

      const [stdout, stderr, exitCode] = await Promise.all([
        proc.stdout.text(),
        proc.stderr.text(),
        proc.exited
      ]);

      // Parse results
      const testCount = this.parseTestCount(stdout, 'total');
      const passedCount = this.parseTestCount(stdout, 'pass');
      const failedCount = this.parseTestCount(stdout, 'fail');
      const coverage = this.parseCoverage(stdout);

      return {
        testCount,
        passedCount,
        failedCount,
        coverage
      };

    } catch (error) {
      console.error("❌ Test execution failed:", error.message);
      return {
        testCount: 0,
        passedCount: 0,
        failedCount: 1
      };
    }
  }

  private getTestPaths(suite: string): string[] {
    const suiteConfig = {
      full: ['tests/'],
      unit: ['tests/unit/'],
      integration: ['tests/integration/'],
      quick: ['tests/unit/utils', 'tests/unit/database'],
      core: ['tests/unit/utils', 'tests/integration/health'],
      smoke: ['tests/unit/utils']
    };

    return suiteConfig[suite as keyof typeof suiteConfig] || ['tests/'];
  }

  private parseTestCount(output: string, type: 'total' | 'pass' | 'fail'): number {
    if (type === 'pass') {
      const match = output.match(/(\d+)\s+pass/);
      return match ? parseInt(match[1]) : 0;
    }
    
    if (type === 'fail') {
      const match = output.match(/(\d+)\s+fail/);
      return match ? parseInt(match[1]) : 0;
    }

    // Total tests
    const testMatch = output.match(/Ran\s+(\d+)\s+tests?/);
    return testMatch ? parseInt(testMatch[1]) : 0;
  }

  private parseCoverage(output: string): number | undefined {
    // Look for coverage percentage in output
    const coverageMatch = output.match(/All files\s+\|\s+([\d.]+)/);
    return coverageMatch ? parseFloat(coverageMatch[1]) : undefined;
  }

  private async getGitInfo(): Promise<{ commit: string; branch: string }> {
    try {
      const commitResult = await $`git rev-parse HEAD`.quiet();
      const branchResult = await $`git branch --show-current`.quiet();
      
      return {
        commit: commitResult.text.trim().slice(0, 8),
        branch: branchResult.text.trim()
      };
    } catch (error) {
      return {
        commit: 'unknown',
        branch: 'unknown'
      };
    }
  }

  private async analyzeBenchmark(current: BenchmarkResult): Promise<BenchmarkAnalysis> {
    const history = this.loadBenchmarkHistory();
    const baseline = this.findBaseline(history, current.testSuite);
    
    let trend: 'improving' | 'stable' | 'regressing' = 'stable';
    let regressionThreshold = 1.2; // 20% slower considered regression
    let performanceScore = 100;

    if (baseline) {
      const performanceRatio = current.duration / baseline.duration;
      
      if (performanceRatio > regressionThreshold) {
        trend = 'regressing';
        performanceScore = Math.max(0, 100 - ((performanceRatio - 1) * 100));
      } else if (performanceRatio < 0.9) { // 10% faster
        trend = 'improving';
        performanceScore = Math.min(120, 100 + ((1 - performanceRatio) * 100));
      }
    }

    return {
      current,
      baseline,
      trend,
      regressionThreshold,
      performanceScore
    };
  }

  private loadBenchmarkHistory(): BenchmarkResult[] {
    if (!existsSync(this.historyFile)) {
      return [];
    }

    try {
      const content = readFileSync(this.historyFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.warn("⚠️  Could not load benchmark history:", error.message);
      return [];
    }
  }

  private findBaseline(history: BenchmarkResult[], testSuite: string): BenchmarkResult | undefined {
    // Find the most recent successful run of the same test suite
    const sameTestSuite = history
      .filter(r => r.testSuite === testSuite && r.failedCount === 0)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return sameTestSuite[0];
  }

  private saveBenchmarkResult(result: BenchmarkResult): void {
    const history = this.loadBenchmarkHistory();
    history.push(result);

    // Keep only last 50 results
    const recentHistory = history.slice(-50);

    try {
      writeFileSync(this.historyFile, JSON.stringify(recentHistory, null, 2));
      console.log(`💾 Benchmark saved to ${this.historyFile}`);
    } catch (error) {
      console.warn("⚠️  Could not save benchmark history:", error.message);
    }
  }

  private generateReport(analysis: BenchmarkAnalysis): void {
    const { current, baseline, trend, performanceScore } = analysis;
    
    console.log("\n" + "━".repeat(60));
    console.log("📊 Test Performance Benchmark Report");
    console.log("━".repeat(60));

    // Current results
    console.log("\n📋 Current Results:");
    console.log(`  Duration: ${(current.duration / 1000).toFixed(2)}s`);
    console.log(`  Tests: ${current.testCount} (${current.passedCount} passed, ${current.failedCount} failed)`);
    if (current.coverage) {
      console.log(`  Coverage: ${current.coverage.toFixed(1)}%`);
    }
    if (current.memoryUsage) {
      console.log(`  Memory: ${current.memoryUsage}MB`);
    }

    // Comparison with baseline
    if (baseline) {
      console.log("\n📈 Performance Comparison:");
      const durationChange = ((current.duration - baseline.duration) / baseline.duration * 100).toFixed(1);
      const durationIcon = parseFloat(durationChange) > 0 ? '📈' : '📉';
      console.log(`  Duration change: ${durationChange}% ${durationIcon}`);
      console.log(`  Baseline: ${(baseline.duration / 1000).toFixed(2)}s (${baseline.timestamp.split('T')[0]})`);
    }

    // Performance assessment
    console.log("\n🎯 Performance Assessment:");
    const trendIcon = {
      improving: '🚀',
      stable: '✅',
      regressing: '⚠️'
    }[trend];
    
    console.log(`  Trend: ${trend} ${trendIcon}`);
    console.log(`  Score: ${performanceScore.toFixed(0)}/100`);

    if (trend === 'regressing') {
      console.log("\n⚠️  PERFORMANCE REGRESSION DETECTED!");
      console.log("  Consider investigating recent changes that may impact performance.");
    } else if (trend === 'improving') {
      console.log("\n🎉 Performance improvement detected!");
    }

    // Recommendations
    console.log("\n💡 Recommendations:");
    if (current.failedCount > 0) {
      console.log("  • Fix failing tests to get accurate performance metrics");
    }
    if (current.coverage && current.coverage < 80) {
      console.log("  • Consider increasing test coverage");
    }
    if (current.duration > 30000) { // > 30 seconds
      console.log("  • Test suite is getting slow, consider parallelization or test optimization");
    }

    // Save detailed report
    const reportFile = join(this.benchmarkDir, `benchmark-${current.timestamp.split('T')[0]}-${current.gitCommit}.json`);
    try {
      writeFileSync(reportFile, JSON.stringify(analysis, null, 2));
      console.log(`\n📄 Detailed report saved to ${reportFile}`);
    } catch (error) {
      console.warn("⚠️  Could not save detailed report:", error.message);
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const testSuite = args.find(arg => !arg.startsWith('--')) || 'quick';
  const useBunx = args.includes('--bunx') || process.env.USE_BUNX === 'true';

  console.log("📊 Test Performance Benchmark");
  console.log("━".repeat(40));

  const benchmark = new TestBenchmarkRunner(useBunx);
  
  try {
    const analysis = await benchmark.runBenchmark(testSuite);
    
    // Exit with error code if regression detected
    if (analysis.trend === 'regressing' && analysis.performanceScore < 80) {
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Benchmark failed:", error.message);
    process.exit(1);
  }
}

main();