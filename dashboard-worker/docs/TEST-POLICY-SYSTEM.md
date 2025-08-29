# Fire22 Dashboard Worker - Test Policy System

## Overview

The Test Policy System enforces code quality gates before allowing any test
execution. This ensures that tests only run on code that passes fundamental
quality checks, preventing wasted time and resources on fundamentally broken
code.

## How It Works

### Policy Enforcement Flow

```
🚀 Test Command Initiated
         ↓
📋 Load .testpolicy Configuration
         ↓
🔍 Run Pre-Checks (in order):
   ├── Code Linting (ESLint)
   ├── TypeScript Type Checking
   ├── Syntax Validation (Bun build check)
   ├── Security Scan (bun audit)
   └── Dependency Audit
         ↓
✅ All Checks Pass → Tests Execute
❌ Any Check Fails → Immediate Termination
```

### Policy Configuration (`.testpolicy`)

The system is controlled by the `.testpolicy` file in the project root:

```bash
# Core Policy Settings
POLICY_ENABLED=true          # Enable/disable the entire system
STRICT_MODE=true             # Enforce strict checking
FAIL_FAST=true              # Stop on first failure
EXIT_ON_FIRST_FAILURE=true  # Terminate immediately on failure

# Required Pre-Checks
REQUIRE_CODE_LINT=true           # ESLint validation
REQUIRE_TYPE_CHECK=true          # TypeScript checking
REQUIRE_SYNTAX_VALIDATION=true   # Bun syntax validation
REQUIRE_SECURITY_SCAN=true       # Security vulnerability scan
REQUIRE_DEPENDENCY_AUDIT=true    # Dependency security audit

# Emergency Bypass (USE WITH CAUTION)
ALLOW_BYPASS_WITH_FLAG=false     # Allow bypass with --force-unsafe-test
BYPASS_REQUIRES_CONFIRMATION=true
```

## Commands

### Standard Test Commands (With Policy Enforcement)

```bash
bun test                    # Full test suite with pre-checks
bun run test:unit          # Unit tests with pre-checks
bun run test:integration   # Integration tests with pre-checks
bun run test:e2e          # E2E tests with pre-checks
bun run test:coverage     # Coverage tests with pre-checks
```

### Emergency Bypass (Use Only When Necessary)

```bash
# Individual test bypass
bun run test:bypass test
bun run test:bypass test:unit
bun run test:bypass test:integration

# Direct bypass script
bun run scripts/test-emergency-bypass.ts test
```

## Pre-Check Details

### 1. Code Linting (`bun run lint`)

- Runs ESLint on all TypeScript/JavaScript files
- Checks code style, potential bugs, and best practices
- **Failure**: Syntax errors, style violations, or linting rules

### 2. TypeScript Type Checking (`bun run typecheck`)

- Runs `tsc --noEmit` to validate TypeScript types
- Ensures type safety without generating output
- **Failure**: Type errors, missing types, or configuration issues

### 3. Syntax Validation

- Uses Bun's built-in parser to validate syntax
- Runs `bun build --target=bun --no-bundle` to check compilation
- **Failure**: Syntax errors, import issues, or parse failures

### 4. Security Scan (`bun run security:audit`)

- Runs security audit on dependencies
- Uses `bun audit --audit-level=high` to check vulnerabilities
- **Failure**: High-severity security vulnerabilities found

### 5. Dependency Audit

- Additional security check for package dependencies
- Validates package integrity and known vulnerabilities
- **Failure**: Compromised or vulnerable dependencies

## Policy Benefits

### ✅ Advantages

- **Time Savings**: Prevents running tests on broken code
- **Resource Efficiency**: Avoids wasted CI/CD resources
- **Quality Assurance**: Enforces minimum code quality standards
- **Security**: Prevents tests running with vulnerable dependencies
- **Developer Productivity**: Faster feedback on fundamental issues

### ⚠️ Considerations

- **Initial Setup**: Requires existing code to pass all checks
- **Strict Enforcement**: May initially block legitimate test runs
- **Emergency Situations**: Bypass procedures needed for urgent fixes

## Troubleshooting

### Policy Enforcement Failed

1. **Check the error details** - The policy enforcer shows specific failure
   reasons
2. **Fix the underlying issues** - Address linting, type, or security issues
3. **Run checks individually**:
   ```bash
   bun run lint
   bun run typecheck
   bun run security:audit
   ```

### Emergency Test Execution

If you absolutely must run tests bypassing the policy:

```bash
# Use the emergency bypass script
bun run test:bypass test

# Or modify .testpolicy temporarily:
POLICY_ENABLED=false
```

**⚠️ Warning**: Always re-enable the policy after emergency use.

### Policy Configuration Issues

1. **Missing .testpolicy file**: The system will terminate immediately
2. **Invalid configuration**: Check syntax in .testpolicy file
3. **Missing dependencies**: Ensure ESLint, TypeScript, and other tools are
   installed

## Best Practices

### For Developers

- **Fix issues early**: Address linting/type issues as you code
- **Regular checks**: Run `bun run lint` and `bun run typecheck` frequently
- **Clean commits**: Ensure code passes all checks before committing
- **Emergency use**: Use bypass only for genuine emergencies

### For CI/CD

- **Pipeline Integration**: The policy system works seamlessly with CI
- **Failure Handling**: CI will exit with proper error codes on failures
- **Logging**: All policy enforcement is logged for audit purposes

### For Team Leads

- **Policy Tuning**: Adjust .testpolicy settings based on team needs
- **Training**: Ensure team understands the policy system
- **Monitoring**: Review bypass logs regularly for policy effectiveness

## Configuration Examples

### Lenient Development Environment

```bash
POLICY_ENABLED=true
STRICT_MODE=false
FAIL_FAST=false
REQUIRE_CODE_LINT=true
REQUIRE_TYPE_CHECK=true
REQUIRE_SYNTAX_VALIDATION=false
REQUIRE_SECURITY_SCAN=false
REQUIRE_DEPENDENCY_AUDIT=false
```

### Strict Production Environment

```bash
POLICY_ENABLED=true
STRICT_MODE=true
FAIL_FAST=true
REQUIRE_CODE_LINT=true
REQUIRE_TYPE_CHECK=true
REQUIRE_SYNTAX_VALIDATION=true
REQUIRE_SECURITY_SCAN=true
REQUIRE_DEPENDENCY_AUDIT=true
ALLOW_BYPASS_WITH_FLAG=false
```

### Emergency/Debug Mode

```bash
POLICY_ENABLED=false
# All other settings ignored when disabled
```

## Logging and Auditing

### Policy Enforcement Logs

- All policy enforcement actions are logged
- Timestamps and check results recorded
- Bypass attempts tracked in `.bypass-log`

### Log Locations

- **Console Output**: Real-time policy enforcement status
- **Bypass Log**: `.bypass-log` file for emergency bypass tracking
- **CI Logs**: Integrated with CI/CD pipeline logging

## Security Considerations

- **Bypass Protection**: Bypass requires explicit flags and confirmation
- **Audit Trail**: All bypass attempts are logged with timestamps
- **Vulnerability Prevention**: Security scans prevent tests on vulnerable code
- **Policy Integrity**: .testpolicy file should be version controlled

## Migration Guide

### Existing Projects

1. **Add the policy file**:

   ```bash
   cp .testpolicy.example .testpolicy
   ```

2. **Fix existing issues**:

   ```bash
   bun run lint:fix
   bun run typecheck
   ```

3. **Test the policy**:

   ```bash
   bun test  # Should now run pre-checks
   ```

4. **Tune the policy** based on your project needs

### Team Adoption

1. **Communicate changes** to the development team
2. **Provide training** on the new test policy system
3. **Set up IDE integration** for linting and type checking
4. **Monitor bypass usage** to identify common issues

---

## Summary

The Test Policy System ensures high code quality by enforcing fundamental checks
before test execution. While it adds a gate to the testing process, it
ultimately saves time and resources by preventing tests from running on
fundamentally broken code.

For emergency situations, bypass mechanisms are available but should be used
sparingly and with proper justification.
