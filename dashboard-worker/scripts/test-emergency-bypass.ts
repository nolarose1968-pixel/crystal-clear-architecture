#!/usr/bin/env bun

/**
 * Emergency Test Bypass Script
 *
 * This script allows running tests in emergency situations by bypassing
 * the policy enforcer. Use only when absolutely necessary.
 *
 * Usage:
 *   bun run scripts/test-emergency-bypass.ts [test-command]
 *
 * Examples:
 *   bun run scripts/test-emergency-bypass.ts test
 *   bun run scripts/test-emergency-bypass.ts test:integration
 */

const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function showWarning(): void {
  console.log(`${RED}${BOLD}⚠️  EMERGENCY TEST BYPASS ACTIVATED ⚠️${RESET}`);
  console.log(`${RED}═════════════════════════════════════════${RESET}`);
  console.log(`${YELLOW}This bypasses all pre-check policies!${RESET}`);
  console.log(`${YELLOW}Use only in genuine emergency situations.${RESET}`);
  console.log(`${RED}═════════════════════════════════════════${RESET}\n`);
}

function logBypass(command: string): void {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] EMERGENCY BYPASS: ${command} executed by user: ${process.env.USER || 'unknown'}\n`;

  try {
    const fs = require('fs');
    fs.appendFileSync('.bypass-log', logEntry);
  } catch (error) {
    console.warn('Failed to log bypass attempt:', error);
  }
}

async function runBypass(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(`${RED}Error: No test command specified${RESET}`);
    console.log('Usage: bun run scripts/test-emergency-bypass.ts [test-command]');
    console.log('Examples:');
    console.log('  bun run scripts/test-emergency-bypass.ts test');
    console.log('  bun run scripts/test-emergency-bypass.ts test:integration');
    process.exit(1);
  }

  const testCommand = args[0];
  showWarning();

  // Log the bypass attempt
  logBypass(testCommand);

  console.log(`${YELLOW}Running: ${testCommand}${RESET}\n`);

  try {
    // Map test commands to their direct equivalents
    const commandMap: Record<string, string[]> = {
      test: ['bun', 'test', '--config', 'bun.test.config.ts'],
      'test:unit': ['bun', 'test', 'tests/unit/'],
      'test:integration': ['bun', 'test', 'tests/integration/'],
      'test:e2e': ['bun', 'test', 'tests/e2e/'],
      'test:performance': ['bun', 'test', 'tests/performance/'],
      'test:security': ['bun', 'test', 'tests/security/'],
      'test:watch': ['bun', 'test', '--watch'],
      'test:coverage': ['bun', 'test', '--coverage'],
    };

    const command = commandMap[testCommand];

    if (!command) {
      console.error(`${RED}Error: Unknown test command: ${testCommand}${RESET}`);
      process.exit(1);
    }

    const proc = Bun.spawn(command, {
      stdout: 'inherit',
      stderr: 'inherit',
      stdin: 'inherit',
      cwd: process.cwd(),
    });

    const exitCode = await proc.exited;
    process.exit(exitCode);
  } catch (error) {
    console.error(`${RED}Failed to run bypass command:${RESET}`, error);
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.main) {
  await runBypass();
}
