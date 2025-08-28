#!/usr/bin/env bun

/**
 * 🎯 Git-Aware Smart Test Runner
 * Analyzes Git changes to run only relevant tests
 * Dramatically speeds up local development loops
 */

import { $ } from "bun";
import { existsSync } from "fs";
import { dirname, basename, join } from "path";

interface TestTarget {
  file: string;
  testFiles: string[];
  category: 'unit' | 'integration' | 'e2e' | 'performance' | 'security';
  priority: number;
}

interface GitChangeAnalysis {
  changedFiles: string[];
  testTargets: TestTarget[];
  estimatedRunTime: number;
  categories: Set<string>;
}

class GitAwareTestRunner {
  private baseBranch: string;
  private useBundle: boolean;

  constructor(baseBranch = 'main', useBundle = false) {
    this.baseBranch = baseBranch;
    this.useBundle = process.env.USE_BUNX === 'true' || useBundle;
  }

  async analyzeChanges(): Promise<GitChangeAnalysis> {
    console.log("🔍 Analyzing Git changes...");
    
    // Get changed files since base branch
    const changedFiles = await this.getChangedFiles();
    console.log(`  📝 Found ${changedFiles.length} changed files`);

    // Map changed files to test targets
    const testTargets = await this.mapFilesToTests(changedFiles);
    console.log(`  🎯 Identified ${testTargets.length} test targets`);

    // Calculate estimated run time
    const estimatedRunTime = this.estimateRunTime(testTargets);
    
    // Extract categories
    const categories = new Set(testTargets.map(t => t.category));

    return {
      changedFiles,
      testTargets,
      estimatedRunTime,
      categories
    };
  }

  private async getChangedFiles(): Promise<string[]> {
    try {
      // Try to get changes against base branch
      let result = await $`git diff --name-only origin/${this.baseBranch}...HEAD`.quiet();
      
      if (!result.text.trim()) {
        // If no upstream, compare with local base branch
        result = await $`git diff --name-only ${this.baseBranch}...HEAD`.quiet();
      }
      
      if (!result.text.trim()) {
        // If still no changes, get unstaged + staged changes
        const unstaged = await $`git diff --name-only`.quiet();
        const staged = await $`git diff --cached --name-only`.quiet();
        
        const combined = [...unstaged.text.split('\n'), ...staged.text.split('\n')]
          .filter(f => f.length > 0);
        
        return [...new Set(combined)];
      }
      
      return result.text.split('\n').filter(f => f.length > 0);
    } catch (error) {
      console.warn("⚠️  Could not determine Git changes, running all tests");
      return [];
    }
  }

  private async mapFilesToTests(changedFiles: string[]): Promise<TestTarget[]> {
    const testTargets: TestTarget[] = [];
    
    for (const file of changedFiles) {
      // Skip non-source files
      if (!this.isSourceFile(file)) continue;
      
      const target: TestTarget = {
        file,
        testFiles: [],
        category: this.categorizeFile(file),
        priority: this.calculatePriority(file)
      };

      // Find corresponding test files
      target.testFiles = await this.findTestFiles(file);
      
      if (target.testFiles.length > 0) {
        testTargets.push(target);
      }
    }

    // Sort by priority (higher priority first)
    return testTargets.sort((a, b) => b.priority - a.priority);
  }

  private isSourceFile(file: string): boolean {
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    const excludePatterns = [
      'node_modules/',
      'dist/',
      'build/',
      '.next/',
      'coverage/',
      'docs/',
      '.git/'
    ];

    return extensions.some(ext => file.endsWith(ext)) &&
           !excludePatterns.some(pattern => file.includes(pattern));
  }

  private categorizeFile(file: string): 'unit' | 'integration' | 'e2e' | 'performance' | 'security' {
    if (file.includes('/api/') || file.includes('/controllers/')) return 'integration';
    if (file.includes('/e2e/') || file.includes('browser')) return 'e2e';
    if (file.includes('performance') || file.includes('benchmark')) return 'performance';
    if (file.includes('security') || file.includes('auth')) return 'security';
    return 'unit';
  }

  private calculatePriority(file: string): number {
    let priority = 1;
    
    // Core files get higher priority
    if (file.includes('/src/')) priority += 3;
    if (file.includes('/api/')) priority += 2;
    if (file.includes('/utils/')) priority += 2;
    if (file.includes('/types/')) priority += 1;
    if (file.includes('config')) priority += 2;
    
    // Test files themselves get lower priority
    if (file.includes('/tests/')) priority -= 1;
    
    return priority;
  }

  private async findTestFiles(sourceFile: string): Promise<string[]> {
    const testFiles: string[] = [];
    
    // Strategy 1: Co-located test file
    const colocatedTest = sourceFile.replace(/\.(ts|tsx|js|jsx)$/, '.test.$1');
    if (existsSync(colocatedTest)) {
      testFiles.push(colocatedTest);
    }
    
    // Strategy 2: Corresponding test in tests/ directory
    const testInTestsDir = this.mapToTestsDirectory(sourceFile);
    if (testInTestsDir && existsSync(testInTestsDir)) {
      testFiles.push(testInTestsDir);
    }
    
    // Strategy 3: Pattern-based discovery
    const patternTests = await this.findTestsByPattern(sourceFile);
    testFiles.push(...patternTests);
    
    return [...new Set(testFiles)];
  }

  private mapToTestsDirectory(sourceFile: string): string | null {
    if (sourceFile.startsWith('src/')) {
      const relativePath = sourceFile.substring(4); // Remove 'src/'
      const testFile = join('tests', dirname(relativePath), basename(relativePath).replace(/\.(ts|tsx|js|jsx)$/, '.test.$1'));
      return testFile;
    }
    return null;
  }

  private async findTestsByPattern(sourceFile: string): Promise<string[]> {
    const baseName = basename(sourceFile, '.ts').replace(/\.(tsx|js|jsx)$/, '');
    const testFiles: string[] = [];
    
    try {
      // Search for tests mentioning this file
      const searchResult = await $`find tests -name "*.test.*" -type f | head -50`.quiet();
      const testFilePaths = searchResult.text.split('\n').filter(f => f.length > 0);
      
      for (const testPath of testFilePaths) {
        // Simple heuristic: check if test file name contains source file base name
        if (basename(testPath).includes(baseName)) {
          testFiles.push(testPath);
        }
      }
    } catch (error) {
      // Ignore search errors
    }
    
    return testFiles;
  }

  private estimateRunTime(testTargets: TestTarget[]): number {
    // Rough estimates in milliseconds
    const timeEstimates = {
      unit: 50,
      integration: 200,
      e2e: 2000,
      performance: 1000,
      security: 300
    };

    return testTargets.reduce((total, target) => {
      const baseTime = timeEstimates[target.category];
      const fileCount = target.testFiles.length;
      return total + (baseTime * fileCount);
    }, 0);
  }

  async runTargetedTests(analysis: GitChangeAnalysis): Promise<void> {
    if (analysis.testTargets.length === 0) {
      console.log("📭 No test targets found, running quick smoke tests");
      await this.runSmokeTests();
      return;
    }

    console.log("\n🚀 Running targeted tests...");
    console.log(`⏱️  Estimated run time: ${(analysis.estimatedRunTime / 1000).toFixed(1)}s`);
    console.log(`📂 Categories: ${Array.from(analysis.categories).join(', ')}`);

    let passedTests = 0;
    let failedTests = 0;
    const startTime = Date.now();

    // Group test files by category for efficient execution
    const testsByCategory = this.groupTestsByCategory(analysis.testTargets);

    for (const [category, testFiles] of Object.entries(testsByCategory)) {
      if (testFiles.length === 0) continue;

      console.log(`\n📦 Running ${category} tests (${testFiles.length} files)...`);

      try {
        const bunCommand = this.useBundle ? 'bunx' : '/opt/homebrew/bin/bun';
        const testArgs = this.useBundle 
          ? ['bun', 'test', ...testFiles, '--bail']
          : ['test', ...testFiles, '--bail'];

        const proc = Bun.spawn([bunCommand, ...testArgs], {
          stdout: "pipe",
          stderr: "pipe"
        });

        const [stdout, stderr, exitCode] = await Promise.all([
          proc.stdout.text(),
          proc.stderr.text(),
          proc.exited
        ]);

        if (exitCode === 0) {
          const passed = this.parseTestCount(stdout);
          passedTests += passed;
          console.log(`  ✅ ${category}: ${passed} tests passed`);
        } else {
          const failed = this.parseFailureCount(stderr || stdout);
          failedTests += failed;
          console.log(`  ❌ ${category}: ${failed} tests failed`);
          
          // Show first few error lines
          const errorLines = stderr.split('\n').slice(0, 3);
          errorLines.forEach(line => console.log(`     ${line}`));
        }

      } catch (error) {
        failedTests++;
        console.log(`  ❌ ${category}: Error running tests - ${error.message}`);
      }
    }

    // Summary
    const totalTime = (Date.now() - startTime) / 1000;
    console.log("\n" + "━".repeat(60));
    console.log("📊 Git-Aware Test Results");
    console.log("━".repeat(60));
    console.log(`  Total Tests: ${passedTests + failedTests}`);
    console.log(`  Passed: ${passedTests} ✅`);
    console.log(`  Failed: ${failedTests} ${failedTests > 0 ? '❌' : ''}`);
    console.log(`  Time: ${totalTime.toFixed(2)}s (est: ${(analysis.estimatedRunTime / 1000).toFixed(1)}s)`);
    console.log(`  Efficiency: ${((analysis.estimatedRunTime / 1000) / totalTime * 100).toFixed(0)}% accurate`);

    if (failedTests === 0) {
      console.log("\n🎉 All targeted tests passed! Ready to commit.");
    } else {
      console.log("\n⚠️  Some tests failed. Please fix before committing.");
      process.exit(1);
    }
  }

  private groupTestsByCategory(testTargets: TestTarget[]): Record<string, string[]> {
    const groups: Record<string, string[]> = {
      unit: [],
      integration: [],
      e2e: [],
      performance: [],
      security: []
    };

    for (const target of testTargets) {
      groups[target.category].push(...target.testFiles);
    }

    // Remove duplicates
    Object.keys(groups).forEach(category => {
      groups[category] = [...new Set(groups[category])];
    });

    return groups;
  }

  private parseTestCount(output: string): number {
    const match = output.match(/(\d+)\s+pass/);
    return match ? parseInt(match[1]) : 0;
  }

  private parseFailureCount(output: string): number {
    const match = output.match(/(\d+)\s+fail/);
    return match ? parseInt(match[1]) : 1; // Default to 1 if we can't parse
  }

  private async runSmokeTests(): Promise<void> {
    console.log("🚬 Running smoke tests...");
    
    const smokeTests = [
      'tests/unit/utils',
      'tests/integration/health'
    ].filter(path => existsSync(path));

    if (smokeTests.length === 0) {
      console.log("⚠️  No smoke tests available");
      return;
    }

    try {
      const bunCommand = this.useBundle ? 'bunx' : '/opt/homebrew/bin/bun';
      const testArgs = this.useBundle 
        ? ['bun', 'test', ...smokeTests, '--bail']
        : ['test', ...smokeTests, '--bail'];

      const proc = Bun.spawn([bunCommand, ...testArgs], {
        stdout: "pipe",
        stderr: "pipe"
      });

      const exitCode = await proc.exited;
      
      if (exitCode === 0) {
        console.log("✅ Smoke tests passed");
      } else {
        console.log("❌ Smoke tests failed");
        process.exit(1);
      }
    } catch (error) {
      console.log("❌ Error running smoke tests:", error.message);
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const baseBranch = args.find(arg => arg.startsWith('--base='))?.replace('--base=', '') || 'main';
  const useBunx = args.includes('--bunx') || process.env.USE_BUNX === 'true';

  console.log("🎯 Git-Aware Test Runner");
  console.log(`📋 Base branch: ${baseBranch}`);
  console.log(`🔧 Using: ${useBunx ? 'bunx' : 'bun'}`);
  console.log("━".repeat(50));

  const runner = new GitAwareTestRunner(baseBranch, useBunx);
  
  try {
    const analysis = await runner.analyzeChanges();
    await runner.runTargetedTests(analysis);
  } catch (error) {
    console.error("❌ Git-aware test runner failed:", error.message);
    process.exit(1);
  }
}

main();