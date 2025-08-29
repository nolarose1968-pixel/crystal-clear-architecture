#!/usr/bin/env bun

/**
 * Fire22 Test Policy Enforcer
 *
 * This script enforces test execution policies by running pre-checks
 * before allowing any test suite to execute. If any check fails,
 * test execution is immediately terminated.
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface TestPolicy {
  POLICY_VERSION: string;
  POLICY_ENABLED: boolean;
  STRICT_MODE: boolean;
  REQUIRE_CODE_LINT: boolean;
  REQUIRE_TYPE_CHECK: boolean;
  REQUIRE_SYNTAX_VALIDATION: boolean;
  REQUIRE_SECURITY_SCAN: boolean;
  REQUIRE_DEPENDENCY_AUDIT: boolean;
  FAIL_FAST: boolean;
  EXIT_ON_FIRST_FAILURE: boolean;
  SHOW_FAILURE_DETAILS: boolean;
  ALLOW_BYPASS_WITH_FLAG: boolean;
  BYPASS_FLAG: string;
  BYPASS_REQUIRES_CONFIRMATION: boolean;
  LOG_POLICY_ENFORCEMENT: boolean;
  LOG_CHECK_RESULTS: boolean;
  LOG_BYPASS_ATTEMPTS: boolean;
}

class TestPolicyEnforcer {
  private policy: TestPolicy;
  private projectRoot: string;
  private failureDetails: string[] = [];

  constructor() {
    this.projectRoot = process.cwd();
    this.policy = this.loadPolicy();
  }

  private loadPolicy(): TestPolicy {
    const policyPath = join(this.projectRoot, '.testpolicy');

    if (!existsSync(policyPath)) {
      console.error('❌ ERROR: .testpolicy file not found. Test execution blocked.');
      process.exit(1);
    }

    const policyContent = readFileSync(policyPath, 'utf8');
    const policy: Partial<TestPolicy> = {};

    // Parse policy file
    policyContent.split('\n').forEach(line => {
      line = line.trim();
      if (line.startsWith('#') || !line.includes('=')) return;

      const [key, value] = line.split('=');
      const cleanKey = key.trim() as keyof TestPolicy;
      const cleanValue = value.trim();

      if (cleanValue === 'true' || cleanValue === 'false') {
        (policy as any)[cleanKey] = cleanValue === 'true';
      } else {
        (policy as any)[cleanKey] = cleanValue;
      }
    });

    return policy as TestPolicy;
  }

  private log(message: string, type: 'info' | 'error' | 'warning' = 'info') {
    if (!this.policy.LOG_POLICY_ENFORCEMENT) return;

    const prefix = {
      info: '📋',
      error: '❌',
      warning: '⚠️',
    }[type];

    console.log(`${prefix} [TEST-POLICY] ${message}`);
  }

  private async runCommand(command: string, description: string): Promise<boolean> {
    this.log(`Running ${description}...`);

    try {
      const proc = Bun.spawn(['bun', 'run', command], {
        stdout: 'pipe',
        stderr: 'pipe',
        cwd: this.projectRoot,
      });

      const exitCode = await proc.exited;

      if (exitCode === 0) {
        this.log(`✅ ${description} passed`, 'info');
        return true;
      } else {
        const stderr = await new Response(proc.stderr).text();
        const errorMsg = `${description} failed (exit code: ${exitCode})`;
        this.failureDetails.push(`${errorMsg}\n${stderr.slice(0, 500)}`);
        this.log(errorMsg, 'error');
        return false;
      }
    } catch (error) {
      const errorMsg = `${description} failed with exception: ${error}`;
      this.failureDetails.push(errorMsg);
      this.log(errorMsg, 'error');
      return false;
    }
  }

  private async checkCodeLinting(): Promise<boolean> {
    if (!this.policy.REQUIRE_CODE_LINT) return true;
    return this.runCommand('lint', 'Code linting check');
  }

  private async checkTypeScript(): Promise<boolean> {
    if (!this.policy.REQUIRE_TYPE_CHECK) return true;
    return this.runCommand('typecheck', 'TypeScript type checking');
  }

  private async checkSyntaxValidation(): Promise<boolean> {
    if (!this.policy.REQUIRE_SYNTAX_VALIDATION) return true;

    this.log('Running syntax validation...');

    try {
      // Use Bun's built-in syntax checking
      const proc = Bun.spawn(['bun', 'build', '--target=bun', '--no-bundle', 'src/index.ts'], {
        stdout: 'pipe',
        stderr: 'pipe',
        cwd: this.projectRoot,
      });

      const exitCode = await proc.exited;

      if (exitCode === 0) {
        this.log('✅ Syntax validation passed', 'info');
        return true;
      } else {
        const stderr = await new Response(proc.stderr).text();
        const errorMsg = 'Syntax validation failed';
        this.failureDetails.push(`${errorMsg}\n${stderr.slice(0, 500)}`);
        this.log(errorMsg, 'error');
        return false;
      }
    } catch (error) {
      const errorMsg = `Syntax validation failed with exception: ${error}`;
      this.failureDetails.push(errorMsg);
      this.log(errorMsg, 'error');
      return false;
    }
  }

  private async checkSecurity(): Promise<boolean> {
    if (!this.policy.REQUIRE_SECURITY_SCAN) return true;
    return this.runCommand('security:audit', 'Security scan');
  }

  private async checkDependencyAudit(): Promise<boolean> {
    if (!this.policy.REQUIRE_DEPENDENCY_AUDIT) return true;

    this.log('Running dependency audit...');

    try {
      const proc = Bun.spawn(['bun', 'audit', '--audit-level=high'], {
        stdout: 'pipe',
        stderr: 'pipe',
        cwd: this.projectRoot,
      });

      const exitCode = await proc.exited;

      if (exitCode === 0) {
        this.log('✅ Dependency audit passed', 'info');
        return true;
      } else {
        const stderr = await new Response(proc.stderr).text();
        const errorMsg = 'Dependency audit failed - security vulnerabilities found';
        this.failureDetails.push(`${errorMsg}\n${stderr.slice(0, 500)}`);
        this.log(errorMsg, 'error');
        return false;
      }
    } catch (error) {
      const errorMsg = `Dependency audit failed with exception: ${error}`;
      this.failureDetails.push(errorMsg);
      this.log(errorMsg, 'error');
      return false;
    }
  }

  private checkBypassConditions(): boolean {
    if (!this.policy.ALLOW_BYPASS_WITH_FLAG) return false;

    const args = process.argv;
    const hasBypassFlag = args.includes(this.policy.BYPASS_FLAG);

    if (hasBypassFlag) {
      this.log(`⚠️ BYPASS FLAG DETECTED: ${this.policy.BYPASS_FLAG}`, 'warning');

      if (this.policy.BYPASS_REQUIRES_CONFIRMATION) {
        this.log('Bypass requires manual confirmation. Proceeding with bypass...', 'warning');
      }

      if (this.policy.LOG_BYPASS_ATTEMPTS) {
        this.log(`🚨 SECURITY: Test policy bypassed at ${new Date().toISOString()}`, 'warning');
      }

      return true;
    }

    return false;
  }

  private displayFailureDetails(): void {
    if (!this.policy.SHOW_FAILURE_DETAILS || this.failureDetails.length === 0) return;

    console.error('\n🚨 PRE-CHECK FAILURE DETAILS:');
    console.error('═'.repeat(60));

    this.failureDetails.forEach((detail, index) => {
      console.error(`\n${index + 1}. ${detail}`);
    });

    console.error('\n═'.repeat(60));
    console.error('🛑 All failures must be resolved before tests can run.');
  }

  public async enforce(): Promise<void> {
    if (!this.policy.POLICY_ENABLED) {
      this.log('Test policy is disabled. Allowing test execution.');
      return;
    }

    this.log(`Enforcing test policy v${this.policy.POLICY_VERSION}`);

    // Check for bypass conditions first
    if (this.checkBypassConditions()) {
      this.log('Policy bypassed. Allowing test execution.', 'warning');
      return;
    }

    this.log('Running pre-checks before allowing test execution...');

    const checks = [
      { name: 'Code Linting', check: () => this.checkCodeLinting() },
      { name: 'Type Checking', check: () => this.checkTypeScript() },
      { name: 'Syntax Validation', check: () => this.checkSyntaxValidation() },
      { name: 'Security Scan', check: () => this.checkSecurity() },
      { name: 'Dependency Audit', check: () => this.checkDependencyAudit() },
    ];

    let allPassed = true;

    for (const { name, check } of checks) {
      const passed = await check();

      if (!passed) {
        allPassed = false;

        if (this.policy.FAIL_FAST && this.policy.EXIT_ON_FIRST_FAILURE) {
          this.log(`❌ ${name} failed. Terminating immediately due to FAIL_FAST policy.`, 'error');
          this.displayFailureDetails();
          process.exit(1);
        }
      }
    }

    if (!allPassed) {
      this.log('❌ One or more pre-checks failed. Test execution blocked.', 'error');
      this.displayFailureDetails();
      process.exit(1);
    }

    this.log('✅ All pre-checks passed. Test execution authorized.');
  }
}

// Execute if run directly
if (import.meta.main) {
  const enforcer = new TestPolicyEnforcer();
  await enforcer.enforce();
}

export { TestPolicyEnforcer };
