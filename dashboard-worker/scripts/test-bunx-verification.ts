#!/usr/bin/env bun

/**
 * bunx Compatibility Verification Script
 * Tests both bun and bunx execution modes
 */

import { $ } from 'bun';

interface TestResult {
  mode: string;
  command: string;
  success: boolean;
  duration: number;
  output: string;
}

async function runTest(mode: 'bun' | 'bunx', command: string): Promise<TestResult> {
  const startTime = Date.now();

  try {
    let result: any;

    if (mode === 'bun') {
      result = await $`bun test tests/unit/utils --bail`.quiet();
    } else {
      result = await $`bunx bun test tests/unit/utils --bail`.quiet();
    }

    const duration = Date.now() - startTime;

    return {
      mode,
      command,
      success: true,
      duration,
      output: result.text,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;

    return {
      mode,
      command,
      success: false,
      duration,
      output: error.message,
    };
  }
}

async function main() {
  console.log('🧪 bunx Compatibility Verification');
  console.log('━'.repeat(50));

  const tests = [
    { mode: 'bun' as const, command: 'bun test tests/unit/utils --bail' },
    { mode: 'bunx' as const, command: 'bunx bun test tests/unit/utils --bail' },
  ];

  const results: TestResult[] = [];

  for (const test of tests) {
    console.log(`\n📦 Testing ${test.mode.toUpperCase()} mode...`);
    const result = await runTest(test.mode, test.command);
    results.push(result);

    if (result.success) {
      console.log(`  ✅ ${test.mode} test passed (${result.duration}ms)`);
    } else {
      console.log(`  ❌ ${test.mode} test failed (${result.duration}ms)`);
    }
  }

  // Summary
  console.log('\n' + '━'.repeat(50));
  console.log('📊 Compatibility Summary');
  console.log('━'.repeat(50));

  console.log('\n📋 Results:');
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    const mode = result.mode.padEnd(4);
    const duration = `${result.duration}ms`.padStart(8);
    console.log(`  ${icon} ${mode} ${duration}`);
  });

  const bunSuccess = results.find(r => r.mode === 'bun')?.success;
  const bunxSuccess = results.find(r => r.mode === 'bunx')?.success;

  console.log('\n📈 Compatibility:');
  console.log(`  bun:  ${bunSuccess ? '✅ Compatible' : '❌ Failed'}`);
  console.log(`  bunx: ${bunxSuccess ? '✅ Compatible' : '❌ Failed'}`);

  if (bunSuccess && bunxSuccess) {
    console.log('\n🎉 Both bun and bunx are fully compatible!');
    console.log('✨ Test suite supports both execution modes');
    return 0;
  } else {
    console.log('\n⚠️  Compatibility issues detected');
    return 1;
  }
}

main().then(process.exit);
