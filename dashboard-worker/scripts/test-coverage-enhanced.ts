#!/usr/bin/env bun

/**
 * 📊 Enhanced Test Coverage Reporter
 * Advanced coverage analysis with quality gates and detailed reporting
 */

import { $ } from 'bun';
import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface CoverageThresholds {
  global: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
  individual: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
}

interface CoverageResult {
  file: string;
  statements: { covered: number; total: number; percentage: number };
  branches: { covered: number; total: number; percentage: number };
  functions: { covered: number; total: number; percentage: number };
  lines: { covered: number; total: number; percentage: number };
  uncoveredLines: number[];
}

interface CoverageAnalysis {
  globalCoverage: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
  fileResults: CoverageResult[];
  qualityGatesPassed: boolean;
  failedFiles: string[];
  recommendations: string[];
  timestamp: string;
}

class EnhancedCoverageReporter {
  private reportDir = './reports/coverage';
  private useBunx: boolean;
  private thresholds: CoverageThresholds;

  constructor(useBunx = false) {
    this.useBunx = process.env.USE_BUNX === 'true' || useBunx;
    this.thresholds = this.loadThresholds();
    this.ensureReportDirectory();
  }

  private loadThresholds(): CoverageThresholds {
    // Default thresholds - can be overridden via config
    return {
      global: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
      individual: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70,
      },
    };
  }

  private ensureReportDirectory(): void {
    if (!existsSync(this.reportDir)) {
      mkdirSync(this.reportDir, { recursive: true });
    }
  }

  async generateCoverageReport(testPaths: string[] = ['tests/']): Promise<CoverageAnalysis> {
    console.log('📊 Generating enhanced coverage report...');
    console.log(`🔧 Runtime: ${this.useBunx ? 'bunx' : 'bun'}`);
    console.log(`🎯 Test paths: ${testPaths.join(', ')}`);

    // Run tests with coverage
    const coverageData = await this.runTestsWithCoverage(testPaths);

    // Analyze coverage results
    const analysis = await this.analyzeCoverage(coverageData);

    // Generate reports
    await this.generateReports(analysis);

    // Print summary
    this.printSummary(analysis);

    return analysis;
  }

  private async runTestsWithCoverage(testPaths: string[]): Promise<string> {
    try {
      const bunCommand = this.useBunx ? 'bunx' : '/opt/homebrew/bin/bun';
      const testArgs = this.useBunx
        ? [
            'bun',
            'test',
            ...testPaths,
            '--coverage',
            '--coverage-reporter',
            'text',
            '--coverage-reporter',
            'json',
          ]
        : [
            'test',
            ...testPaths,
            '--coverage',
            '--coverage-reporter',
            'text',
            '--coverage-reporter',
            'json',
          ];

      const proc = Bun.spawn([bunCommand, ...testArgs], {
        stdout: 'pipe',
        stderr: 'pipe',
        env: {
          ...process.env,
          FORCE_COLOR: '0',
        },
      });

      const [stdout, stderr, exitCode] = await Promise.all([
        proc.stdout.text(),
        proc.stderr.text(),
        proc.exited,
      ]);

      if (exitCode !== 0) {
        console.warn('⚠️  Some tests failed, but continuing with coverage analysis');
      }

      return stdout + stderr;
    } catch (error) {
      throw new Error(`Failed to run tests with coverage: ${error.message}`);
    }
  }

  private async analyzeCoverage(coverageOutput: string): Promise<CoverageAnalysis> {
    const fileResults: CoverageResult[] = [];
    const globalStats = {
      statements: { covered: 0, total: 0 },
      branches: { covered: 0, total: 0 },
      functions: { covered: 0, total: 0 },
      lines: { covered: 0, total: 0 },
    };

    // Parse coverage output
    const lines = coverageOutput.split('\n');
    let inCoverageTable = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect coverage table start
      if (line.includes('File') && line.includes('% Funcs') && line.includes('% Lines')) {
        inCoverageTable = true;
        continue;
      }

      // Detect coverage table end
      if (inCoverageTable && line.includes('-----')) {
        if (lines[i + 1]?.includes('All files')) {
          // Parse global coverage from "All files" line
          const globalLine = lines[i + 1];
          const globalMatch = this.parseCoverageLine(globalLine);
          if (globalMatch) {
            globalStats.functions = globalMatch.functions;
            globalStats.lines = globalMatch.lines;
            globalStats.statements = globalMatch.statements || globalMatch.lines;
            globalStats.branches = globalMatch.branches || globalMatch.functions;
          }
          break;
        }
        continue;
      }

      // Parse individual file coverage
      if (inCoverageTable && line.length > 0 && !line.includes('File') && !line.includes('-----')) {
        const fileResult = this.parseFileCoverageLine(line);
        if (fileResult) {
          fileResults.push(fileResult);
        }
      }
    }

    // Calculate global percentages
    const globalCoverage = {
      statements:
        globalStats.statements.total > 0
          ? (globalStats.statements.covered / globalStats.statements.total) * 100
          : 0,
      branches:
        globalStats.branches.total > 0
          ? (globalStats.branches.covered / globalStats.branches.total) * 100
          : 0,
      functions:
        globalStats.functions.total > 0
          ? (globalStats.functions.covered / globalStats.functions.total) * 100
          : 0,
      lines:
        globalStats.lines.total > 0
          ? (globalStats.lines.covered / globalStats.lines.total) * 100
          : 0,
    };

    // Determine quality gates
    const qualityGatesPassed = this.checkQualityGates(globalCoverage, fileResults);
    const failedFiles = this.getFailedFiles(fileResults);
    const recommendations = this.generateRecommendations(globalCoverage, fileResults);

    return {
      globalCoverage,
      fileResults,
      qualityGatesPassed,
      failedFiles,
      recommendations,
      timestamp: new Date().toISOString(),
    };
  }

  private parseCoverageLine(line: string): any {
    // Parse Bun coverage output line format
    const parts = line.split('|').map(p => p.trim());
    if (parts.length < 4) return null;

    return {
      functions: this.parsePercentage(parts[1]),
      lines: this.parsePercentage(parts[2]),
      statements: this.parsePercentage(parts[2]), // Bun typically combines these
      branches: this.parsePercentage(parts[1]), // Approximate
    };
  }

  private parseFileCoverageLine(line: string): CoverageResult | null {
    const parts = line.split('|').map(p => p.trim());
    if (parts.length < 4) return null;

    const fileName = parts[0];
    const functionsPerc = this.parsePercentage(parts[1]);
    const linesPerc = this.parsePercentage(parts[2]);
    const uncoveredLines = this.parseUncoveredLines(parts[3]);

    return {
      file: fileName,
      statements: { covered: 0, total: 100, percentage: linesPerc },
      branches: { covered: 0, total: 100, percentage: functionsPerc },
      functions: { covered: 0, total: 100, percentage: functionsPerc },
      lines: { covered: 0, total: 100, percentage: linesPerc },
      uncoveredLines,
    };
  }

  private parsePercentage(text: string): number {
    const match = text.match(/([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  private parseUncoveredLines(text: string): number[] {
    if (!text || text === '') return [];

    const lines: number[] = [];
    const parts = text.split(',');

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        // Range like "25-30"
        const [start, end] = trimmed.split('-').map(n => parseInt(n));
        for (let i = start; i <= end; i++) {
          lines.push(i);
        }
      } else if (/^\d+$/.test(trimmed)) {
        // Single line number
        lines.push(parseInt(trimmed));
      }
    }

    return lines;
  }

  private checkQualityGates(globalCoverage: any, fileResults: CoverageResult[]): boolean {
    // Check global thresholds
    const globalPassed =
      globalCoverage.statements >= this.thresholds.global.statements &&
      globalCoverage.branches >= this.thresholds.global.branches &&
      globalCoverage.functions >= this.thresholds.global.functions &&
      globalCoverage.lines >= this.thresholds.global.lines;

    // Check individual file thresholds
    const individualPassed = fileResults.every(
      file =>
        file.statements.percentage >= this.thresholds.individual.statements &&
        file.branches.percentage >= this.thresholds.individual.branches &&
        file.functions.percentage >= this.thresholds.individual.functions &&
        file.lines.percentage >= this.thresholds.individual.lines
    );

    return globalPassed && individualPassed;
  }

  private getFailedFiles(fileResults: CoverageResult[]): string[] {
    return fileResults
      .filter(
        file =>
          file.statements.percentage < this.thresholds.individual.statements ||
          file.branches.percentage < this.thresholds.individual.branches ||
          file.functions.percentage < this.thresholds.individual.functions ||
          file.lines.percentage < this.thresholds.individual.lines
      )
      .map(file => file.file);
  }

  private generateRecommendations(globalCoverage: any, fileResults: CoverageResult[]): string[] {
    const recommendations: string[] = [];

    // Global recommendations
    if (globalCoverage.lines < 80) {
      recommendations.push('Increase overall line coverage by adding more comprehensive tests');
    }
    if (globalCoverage.branches < 75) {
      recommendations.push('Improve branch coverage by testing edge cases and error conditions');
    }
    if (globalCoverage.functions < 80) {
      recommendations.push('Add tests for uncovered functions');
    }

    // File-specific recommendations
    const lowCoverageFiles = fileResults.filter(f => f.lines.percentage < 70).slice(0, 5); // Top 5 files needing attention

    if (lowCoverageFiles.length > 0) {
      recommendations.push(
        `Priority files needing tests: ${lowCoverageFiles.map(f => f.file).join(', ')}`
      );
    }

    // Files with many uncovered lines
    const filesWithManyUncoveredLines = fileResults
      .filter(f => f.uncoveredLines.length > 20)
      .slice(0, 3);

    if (filesWithManyUncoveredLines.length > 0) {
      recommendations.push(
        `Files with many uncovered lines need refactoring or comprehensive tests: ${filesWithManyUncoveredLines.map(f => f.file).join(', ')}`
      );
    }

    return recommendations;
  }

  private async generateReports(analysis: CoverageAnalysis): Promise<void> {
    // Generate JSON report
    const jsonReport = join(this.reportDir, `coverage-${analysis.timestamp.split('T')[0]}.json`);
    writeFileSync(jsonReport, JSON.stringify(analysis, null, 2));

    // Generate HTML summary (simple)
    const htmlReport = join(this.reportDir, 'coverage-summary.html');
    const htmlContent = this.generateHtmlReport(analysis);
    writeFileSync(htmlReport, htmlContent);

    console.log(`📄 Reports generated:`);
    console.log(`  JSON: ${jsonReport}`);
    console.log(`  HTML: ${htmlReport}`);
  }

  private generateHtmlReport(analysis: CoverageAnalysis): string {
    const { globalCoverage, fileResults, qualityGatesPassed } = analysis;

    return `<!DOCTYPE html>
<html>
<head>
    <title>Test Coverage Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .metrics { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background: white; border: 1px solid #ddd; padding: 15px; border-radius: 5px; flex: 1; }
        .metric.good { border-color: #4CAF50; }
        .metric.warning { border-color: #FF9800; }
        .metric.poor { border-color: #f44336; }
        .files { margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        .status.pass { color: #4CAF50; font-weight: bold; }
        .status.fail { color: #f44336; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Test Coverage Report</h1>
        <p>Generated: ${analysis.timestamp}</p>
        <p class="status ${qualityGatesPassed ? 'pass' : 'fail'}">
            Quality Gates: ${qualityGatesPassed ? 'PASSED' : 'FAILED'}
        </p>
    </div>

    <div class="metrics">
        <div class="metric ${this.getCoverageClass(globalCoverage.lines)}">
            <h3>Lines</h3>
            <div style="font-size: 2em;">${globalCoverage.lines.toFixed(1)}%</div>
        </div>
        <div class="metric ${this.getCoverageClass(globalCoverage.functions)}">
            <h3>Functions</h3>
            <div style="font-size: 2em;">${globalCoverage.functions.toFixed(1)}%</div>
        </div>
        <div class="metric ${this.getCoverageClass(globalCoverage.branches)}">
            <h3>Branches</h3>
            <div style="font-size: 2em;">${globalCoverage.branches.toFixed(1)}%</div>
        </div>
        <div class="metric ${this.getCoverageClass(globalCoverage.statements)}">
            <h3>Statements</h3>
            <div style="font-size: 2em;">${globalCoverage.statements.toFixed(1)}%</div>
        </div>
    </div>

    <div class="files">
        <h2>File Coverage Details</h2>
        <table>
            <thead>
                <tr>
                    <th>File</th>
                    <th>Lines</th>
                    <th>Functions</th>
                    <th>Uncovered Lines</th>
                </tr>
            </thead>
            <tbody>
                ${fileResults
                  .map(
                    file => `
                    <tr>
                        <td>${file.file}</td>
                        <td>${file.lines.percentage.toFixed(1)}%</td>
                        <td>${file.functions.percentage.toFixed(1)}%</td>
                        <td>${file.uncoveredLines.length > 0 ? file.uncoveredLines.slice(0, 10).join(', ') + (file.uncoveredLines.length > 10 ? '...' : '') : 'None'}</td>
                    </tr>
                `
                  )
                  .join('')}
            </tbody>
        </table>
    </div>

    ${
      analysis.recommendations.length > 0
        ? `
    <div class="recommendations">
        <h2>Recommendations</h2>
        <ul>
            ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
    `
        : ''
    }
</body>
</html>`;
  }

  private getCoverageClass(percentage: number): string {
    if (percentage >= 80) return 'good';
    if (percentage >= 60) return 'warning';
    return 'poor';
  }

  private printSummary(analysis: CoverageAnalysis): void {
    const { globalCoverage, qualityGatesPassed, failedFiles, recommendations } = analysis;

    console.log('\n' + '━'.repeat(60));
    console.log('📊 Enhanced Coverage Report Summary');
    console.log('━'.repeat(60));

    // Global metrics
    console.log('\n📈 Global Coverage:');
    console.log(
      `  Lines:      ${globalCoverage.lines.toFixed(1)}% ${this.getCoverageEmoji(globalCoverage.lines)}`
    );
    console.log(
      `  Functions:  ${globalCoverage.functions.toFixed(1)}% ${this.getCoverageEmoji(globalCoverage.functions)}`
    );
    console.log(
      `  Branches:   ${globalCoverage.branches.toFixed(1)}% ${this.getCoverageEmoji(globalCoverage.branches)}`
    );
    console.log(
      `  Statements: ${globalCoverage.statements.toFixed(1)}% ${this.getCoverageEmoji(globalCoverage.statements)}`
    );

    // Quality gates
    console.log(`\n🚪 Quality Gates: ${qualityGatesPassed ? '✅ PASSED' : '❌ FAILED'}`);

    if (failedFiles.length > 0) {
      console.log(`\n⚠️  Files below threshold (${failedFiles.length}):`);
      failedFiles.slice(0, 5).forEach(file => console.log(`  • ${file}`));
      if (failedFiles.length > 5) {
        console.log(`  • ... and ${failedFiles.length - 5} more`);
      }
    }

    // Recommendations
    if (recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      recommendations.forEach(rec => console.log(`  • ${rec}`));
    }

    if (qualityGatesPassed) {
      console.log('\n🎉 Coverage quality gates passed!');
    } else {
      console.log('\n⚠️  Coverage quality gates failed. Please improve coverage before merging.');
    }
  }

  private getCoverageEmoji(percentage: number): string {
    if (percentage >= 90) return '🟢';
    if (percentage >= 80) return '🟡';
    if (percentage >= 70) return '🟠';
    return '🔴';
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const useBunx = args.includes('--bunx') || process.env.USE_BUNX === 'true';
  const testPaths = args.filter(arg => !arg.startsWith('--'));

  console.log('📊 Enhanced Test Coverage Reporter');
  console.log('━'.repeat(40));

  const reporter = new EnhancedCoverageReporter(useBunx);

  try {
    const analysis = await reporter.generateCoverageReport(
      testPaths.length > 0 ? testPaths : undefined
    );

    // Exit with error if quality gates failed
    if (!analysis.qualityGatesPassed) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Coverage report failed:', error.message);
    process.exit(1);
  }
}

main();
