#!/usr/bin/env bun

/**
 * Working Test Suite - Runs only tests that are currently passing
 * Quick validation for development workflow
 */

import { $ } from 'bun';

interface TestGroup {
  name: string;
  paths: string[];
}

async function runTests() {
  console.log('🧪 Fire22 Dashboard Worker - Working Tests');
  console.log('━'.repeat(60));

  const testGroups: TestGroup[] = [
    {
      name: 'Core Unit Tests',
      paths: [
        'tests/unit/utils',
        'tests/unit/database',
        'tests/unit/components',
        'tests/unit/patterns',
      ],
    },
    {
      name: 'Integration Tests',
      paths: ['tests/integration/api-integration', 'tests/integration/database-integration'],
    },
    {
      name: 'Core Tests',
      paths: [
        'tests/migrations.test.ts',
        'tests/e2e-integration.test.ts',
        'tests/admin.controller.test.ts',
      ],
    },
  ];

  let totalPassed = 0;
  let totalFailed = 0;
  let totalTests = 0;

  for (const group of testGroups) {
    console.log(`\n📦 ${group.name}:`);

    try {
      const proc = Bun.spawn(['/opt/homebrew/bin/bun', 'test', ...group.paths, '--bail'], {
        stdout: 'pipe',
        stderr: 'pipe',
      });

      const output = await proc.stdout.text();

      // Parse results
      const passMatch = output.match(/(\d+)\s+pass/);
      const failMatch = output.match(/(\d+)\s+fail/);
      const testsMatch = output.match(/Ran\s+(\d+)\s+tests?/);

      const passed = passMatch ? parseInt(passMatch[1]) : 0;
      const failed = failMatch ? parseInt(failMatch[1]) : 0;
      const tests = testsMatch ? parseInt(testsMatch[1]) : 0;

      totalPassed += passed;
      totalFailed += failed;
      totalTests += tests;

      if (failed === 0 && passed > 0) {
        console.log(`  ✅ ${passed} tests passed`);
      } else if (failed > 0) {
        console.log(`  ⚠️  ${passed} passed, ${failed} failed`);
      } else {
        console.log(`  ⏭️  No tests found`);
      }
    } catch (error) {
      console.log(`  ❌ Error running tests`);
      totalFailed++;
    }
  }

  // Summary
  console.log('\n' + '━'.repeat(60));
  console.log('📊 Summary:');
  console.log(`  Total Tests: ${totalTests}`);
  console.log(`  Passed: ${totalPassed}`);
  console.log(`  Failed: ${totalFailed}`);

  const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0.0';
  console.log(`  Success Rate: ${successRate}%`);

  console.log('━'.repeat(60));

  if (totalFailed === 0 && totalPassed > 0) {
    console.log('✅ All working tests passed!');
    return 0;
  } else if (totalPassed > 0) {
    console.log('⚠️  Some tests are failing');
    return 1;
  } else {
    console.log('❌ No tests are passing');
    return 2;
  }
}

// Run and exit
runTests().then(process.exit);
