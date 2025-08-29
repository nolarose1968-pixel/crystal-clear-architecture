#!/usr/bin/env bun

/**
 * 🧪 Test GitHub Pages & Wiki Setup
 * Validates that all components are properly configured
 */

import { existsSync } from 'fs';
import { join } from 'path';
import { $ } from 'bun';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

class PagesSetupTester {
  private results: TestResult[] = [];

  async runTests(): Promise<void> {
    console.log('🧪 Testing GitHub Pages & Wiki Setup');
    console.log('!==!==!==!==!==!=====\n');

    // Test workflows
    await this.testWorkflows();

    // Test scripts
    await this.testScripts();

    // Test configurations
    await this.testConfigurations();

    // Test build commands
    await this.testBuildCommands();

    // Display results
    this.displayResults();
  }

  private async testWorkflows(): Promise<void> {
    console.log('📋 Testing GitHub Workflows...');

    // Check if GitHub Pages workflow exists
    this.addResult(
      'GitHub Pages Workflow',
      existsSync('.github/workflows/github-pages.yml'),
      'Workflow file exists'
    );

    // Check if deploy workflow exists
    this.addResult(
      'Deploy Workflow',
      existsSync('.github/workflows/deploy.yml'),
      'Deploy workflow exists'
    );

    console.log('');
  }

  private async testScripts(): Promise<void> {
    console.log('📜 Testing Scripts...');

    const scripts = [
      'scripts/build-pages.ts',
      'scripts/generate-department-pages.ts',
      'scripts/mirror-wiki.ts',
      'scripts/sync-wiki.ts',
      'scripts/build-wiki-pages.ts',
      'scripts/validate-deployment.ts',
      'scripts/generate-deployment-report.ts',
    ];

    for (const script of scripts) {
      this.addResult(
        `Script: ${script}`,
        existsSync(script),
        existsSync(script) ? 'Script exists' : 'Script not found'
      );
    }

    console.log('');
  }

  private async testConfigurations(): Promise<void> {
    console.log('⚙️ Testing Configurations...');

    // Check Cloudflare Pages config
    this.addResult(
      'Cloudflare Pages Config',
      existsSync('config/cloudflare-pages-config.toml'),
      'Configuration file exists'
    );

    // Check package.json scripts
    try {
      const packageJson = await Bun.file('package.json').json();
      const requiredScripts = [
        'pages:build',
        'wiki:mirror',
        'wiki:sync',
        'departments:generate',
        'validate:deployment',
        'deployment:report',
      ];

      for (const script of requiredScripts) {
        this.addResult(
          `Package Script: ${script}`,
          !!packageJson.scripts[script],
          packageJson.scripts[script] ? 'Script defined' : 'Script missing'
        );
      }
    } catch (error) {
      this.addResult('Package.json', false, `Error reading package.json: ${error}`);
    }

    console.log('');
  }

  private async testBuildCommands(): Promise<void> {
    console.log('🏗️ Testing Build Commands...');

    // Test if commands can be executed (actual run)
    const commands = [
      { name: 'Build Pages', cmd: 'bun run pages:build' },
      { name: 'Generate Departments', cmd: 'bun run departments:generate' },
      { name: 'Mirror Wiki', cmd: 'bun run wiki:mirror' },
    ];

    for (const { name, cmd } of commands) {
      try {
        const result = await $`${cmd} 2>/dev/null`.quiet();
        this.addResult(name, true, 'Command executable');
      } catch (error) {
        this.addResult(name, false, 'Command failed or not found');
      }
    }

    console.log('');
  }

  private addResult(name: string, passed: boolean, message: string): void {
    this.results.push({ name, passed, message });
    const icon = passed ? '✅' : '❌';
    console.log(`  ${icon} ${name}: ${message}`);
  }

  private displayResults(): void {
    console.log('='.repeat(50));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(50));

    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;

    console.log(`\n✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${failed}/${total}`);

    if (failed > 0) {
      console.log('\n⚠️ Failed Tests:');
      this.results.filter(r => !r.passed).forEach(r => console.log(`  - ${r.name}: ${r.message}`));
    }

    const percentage = Math.round((passed / total) * 100);
    console.log(`\n📈 Success Rate: ${percentage}%`);

    if (percentage === 100) {
      console.log('\n🎉 All tests passed! GitHub Pages & Wiki setup is complete.');
    } else if (percentage >= 80) {
      console.log('\n✅ Setup is mostly complete. Review failed tests above.');
    } else {
      console.log('\n⚠️ Setup needs attention. Please fix the failed tests.');
    }

    // Provide next steps
    console.log('\n📝 Next Steps:');
    console.log('1. Run: bun run pages:build');
    console.log('2. Run: bun run wiki:mirror');
    console.log('3. Run: bun run validate:deployment');
    console.log('4. Commit changes and push to trigger GitHub Actions');
    console.log(
      '5. Check deployment at: https://brendadeeznuts1111.github.io/fire22-dashboard-worker'
    );
  }
}

// Run tests
const tester = new PagesSetupTester();
tester.runTests().catch(console.error);
