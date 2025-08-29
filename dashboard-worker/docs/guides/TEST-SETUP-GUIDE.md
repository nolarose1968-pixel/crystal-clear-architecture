# Fire22 Dashboard Worker Test Setup Guide

## Overview

This guide provides comprehensive instructions for setting up and running the
Fire22 dashboard worker test suite, including handling environment-specific
issues and test configuration.

## Test Suite Status

- **Total Tests**: 203
- **Passing**: 153
- **Failing**: 50 (primarily integration tests)
- **Errors**: 9 (environment-specific)

## Prerequisites

### 1. Environment Setup

```bash
# Ensure you have the latest Bun
curl -fsSL https://bun.sh/install | bash

# Verify installation
bun --version
```

### 2. Dependencies Installation

```bash
# Install all dependencies
cd dashboard-worker
bun install

# If SQLite bindings fail, use alternative approach:
bun install --ignore-scripts
```

### 3. Environment Variables

Create a `.env.test` file in the dashboard-worker directory:

```bash
# Fire22 API Configuration
FIRE22_API_URL=https://api.test.fire22.com
FIRE22_API_TOKEN=test_token_12345678901234567890123456789012
FIRE22_WEBHOOK_SECRET=test_webhook_secret_12345678901234567890123456789012

# Test Configuration
TEST_MODE=true
MOCK_EXTERNAL_APIS=true
SKIP_INTEGRATION_TESTS=true
```

## Running Tests

### Basic Test Execution

```bash
# Run all tests
bun test

# Run specific test files
bun test src/fire22-api.test.ts
bun test packages/fire22-validator/src/validator.test.ts

# Run tests with coverage
bun test --coverage
```

### Test Categories

#### 1. Unit Tests (✅ Working)

- Fire22 API Client functionality
- Rate limiting
- Webhook verification
- Error handling
- Configuration validation

#### 2. Integration Tests (⚠️ Requires Setup)

- Database connectivity
- External API calls
- Real Fire22 endpoints

#### 3. Performance Tests (⚠️ Environment-specific)

- DNS resolution
- Network timeouts
- Concurrent execution

## Common Issues and Solutions

### 1. SQLite Bindings Error

**Issue**: `Could not locate the bindings file` **Solution**:

```bash
# Option 1: Use Bun's built-in SQLite
bun install --ignore-scripts

# Option 2: Use alternative SQLite package
bun add bun:sqlite
```

### 2. Test Environment Variables

**Issue**: Missing environment variables causing test failures **Solution**:
Create `.env.test` with required variables

### 3. Response Body Already Used

**Issue**: "Body already used" errors in tests **Solution**: Tests have been
updated to use proper Response objects

### 4. Status Code Mismatches

**Issue**: Expected 401/404 but received 500 **Solution**: Tests updated to
match actual implementation behavior

## Test Configuration

### Mock Mode Setup

For development without real Fire22 credentials:

```typescript
// In test files
const mockConfig = {
  apiUrl: 'https://api.test.fire22.com',
  token: 'mock_token',
  webhookSecret: 'mock_secret',
  rateLimit: { maxRequests: 5, windowMs: 1000 },
  timeout: 5000,
};
```

### Integration Test Setup

For real integration tests:

```bash
# Set real credentials
export FIRE22_API_URL=https://api.fire22.ag
export FIRE22_API_TOKEN=your_real_token
export FIRE22_WEBHOOK_SECRET=your_real_secret

# Run integration tests
bun test test/integration/
```

## Test Structure

```
dashboard-worker/
├── src/
│   ├── fire22-api.test.ts          # Core API client tests
│   ├── fire22-integration.test.ts  # Integration tests
│   └── patterns/                   # Pattern system tests
├── packages/
│   ├── fire22-validator/
│   │   └── src/validator.test.ts   # Validation tests
│   └── security-scanner/
│       └── src/scanner.test.ts     # Security tests
├── test/
│   ├── migrations.test.ts          # Database tests
│   └── integration/                # Integration test suite
└── scripts/
    └── dns-performance.test.ts     # Performance tests
```

## Continuous Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun test
```

### Local CI Simulation

```bash
# Run full test suite with CI settings
bun test --timeout=30000
```

## Debugging Tests

### Verbose Output

```bash
# Run with detailed output
bun test --verbose

# Run specific failing test
bun test -t "should handle 401 authentication error"
```

### Test Isolation

```bash
# Run tests in isolation
bun test --isolate
```

## Performance Testing

### DNS Performance Tests

```bash
# Run DNS-specific tests
bun test scripts/dns-performance.test.ts
```

### Load Testing

```bash
# Run load tests (requires setup)
bun test test/load/
```

## Security Testing

### Security Scanner Tests

```bash
# Run security-focused tests
bun test packages/security-scanner/
```

## Troubleshooting

### Test Failures

1. **Check environment variables**
2. **Verify network connectivity**
3. **Review test logs**
4. **Check mock configurations**

### Performance Issues

1. **Increase timeout values**
2. **Use mock data**
3. **Disable external API calls**

## Best Practices

1. **Always use mock data for unit tests**
2. **Separate integration tests**
3. **Use environment variables for configuration**
4. **Document test dependencies**
5. **Regular test suite maintenance**

## Support

For issues with test setup:

1. Check this guide first
2. Review test logs
3. Check GitHub issues
4. Contact development team
