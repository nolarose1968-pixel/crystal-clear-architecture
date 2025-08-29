# 🚀 Fire22 Dashboard Worker - Testing Command Reference

## 📋 Quick Reference Card

| Category                         | Command                                                | Description                                        |
| -------------------------------- | ------------------------------------------------------ | -------------------------------------------------- |
| 🎯 **Accelerated Local Testing** | `bun run test:changed`                                 | Run only changed files (50-80% faster!)            |
|                                  | `bun run test:changed:bunx`                            | Git-aware execution with bunx                      |
|                                  | `bun run test:watch`                                   | Hot-reload testing with file watching              |
| 📊 **Performance Benchmarking**  | `bun run test:benchmark`                               | Quick performance health check                     |
|                                  | `bun run test:benchmark:full`                          | Deep dive into performance analysis                |
|                                  | `bun run test:benchmark:bunx`                          | Performance benchmarking via bunx                  |
| 📈 **Code Quality & Coverage**   | `bun run test:coverage:enhanced`                       | Full coverage analysis with enforced quality gates |
|                                  | `bun run test:coverage:enhanced:bunx`                  | bunx-powered coverage analysis                     |
|                                  | `bun run test:coverage`                                | Standard coverage reporting                        |
| 🚀 **CI/CD Optimization**        | `bun run ci:test:quick`                                | Ultra-fast PR validation in CI                     |
|                                  | `bun run ci:test`                                      | Standard CI pipeline for comprehensive testing     |
|                                  | `bun run ci:test:full`                                 | Exhaustive testing for critical releases           |
|                                  | `bun run ci:test:bunx`                                 | Complete CI pipeline via bunx                      |
| 🔧 **Standard Testing**          | `bun test`                                             | Basic test runner                                  |
|                                  | `bun run test:unit`                                    | Unit tests only                                    |
|                                  | `bun run test:integration`                             | Integration tests only                             |
|                                  | `bun run test:e2e`                                     | End-to-end tests only                              |
| 🛠️ **bunx Compatibility**        | `bun run test:bunx`                                    | Quick tests via bunx                               |
|                                  | `bun run test:bunx:comprehensive`                      | Full test suite via bunx                           |
|                                  | `bun run test:verify-bunx`                             | Verify bunx compatibility                          |
| 📊 **Reporting & Analysis**      | `open reports/coverage/coverage-summary.html`          | View coverage dashboard                            |
|                                  | `cat reports/benchmarks/test-performance-history.json` | Review performance history                         |

## 🎯 Usage Scenarios

### 💻 **Local Development Workflow**

```bash
# Quick feedback loop (recommended)
bun run test:changed                    # Test only your changes
bun run test:watch                      # Continuous testing

# Before committing
bun run test:coverage:enhanced          # Verify coverage standards
bun run test:benchmark                  # Check performance impact
```

### 🔄 **Pull Request Workflow**

```bash
# Fast PR validation
bun run ci:test:quick                   # Changed files + performance check

# Comprehensive PR review
bun run ci:test                        # Full coverage + benchmarks
```

### 🚀 **Release Workflow**

```bash
# Pre-release validation
bun run ci:test:full                   # Complete test matrix
bun run test:bunx:comprehensive        # Verify bunx compatibility
```

## 📊 **Output Examples**

### 🎯 Git-Aware Testing

```bash
$ bun run test:changed
🎯 Git-Aware Test Runner
📝 Found 3 changed files → 🎯 2 test targets
⏱️ Estimated: 1.2s → Categories: unit, integration
✅ All targeted tests passed! Ready to commit.
```

### 📊 Performance Benchmarking

```bash
$ bun run test:benchmark
📊 Test Performance Benchmark Report
Duration: 0.34s | Performance Score: 100/100
Trend: stable ✅ | Memory: 2MB
🎉 Performance within acceptable parameters!
```

### 📈 Enhanced Coverage

```bash
$ bun run test:coverage:enhanced
📊 Enhanced Coverage Report Summary
Lines: 85.2% 🟢 | Functions: 92.1% 🟢 | Branches: 78.5% 🟡
🚪 Quality Gates: ✅ PASSED
🎉 Coverage quality gates passed!
```

## 🔧 **Environment Variables**

```bash
USE_BUNX=true                          # Force bunx execution
CI=true                               # Enable CI optimizations
FORCE_COLOR=0                         # Disable colors for parsing
```

## 📁 **Generated Reports**

```
reports/
├── benchmarks/
│   ├── test-performance-history.json     # Historical performance data
│   └── benchmark-YYYY-MM-DD-commit.json  # Detailed benchmark report
└── coverage/
    ├── coverage-YYYY-MM-DD.json          # Coverage analysis data
    └── coverage-summary.html             # Interactive coverage dashboard
```

## 🎯 **Performance Targets**

| Metric                     | Target       | Alert Threshold |
| -------------------------- | ------------ | --------------- |
| **Local Test Speed**       | < 5 seconds  | > 10 seconds    |
| **CI Pipeline**            | < 2 minutes  | > 5 minutes     |
| **Coverage Global**        | ≥ 80%        | < 75%           |
| **Coverage Individual**    | ≥ 70%        | < 60%           |
| **Performance Regression** | < 10% slower | > 20% slower    |

## 🏆 **Best Practices**

### ✅ **Do's**

- Use `test:changed` for rapid local development
- Run `test:benchmark` before major commits
- Check `test:coverage:enhanced` before PRs
- Use `ci:test:quick` for PR validation
- Archive reports for trend analysis

### ❌ **Don'ts**

- Don't skip coverage checks on critical files
- Don't ignore performance regression alerts
- Don't commit without running changed file tests
- Don't use full test suite for every local change
- Don't ignore quality gate failures

## 🚨 **Troubleshooting**

### Git-Aware Issues

```bash
git status                             # Check for uncommitted changes
git diff --name-only main...HEAD      # Manual change detection
bun run test:comprehensive             # Force full test run
```

### Performance Issues

```bash
cat reports/benchmarks/test-performance-history.json  # Check history
bun run scripts/test-benchmark.ts smoke              # Minimal benchmark
```

### Coverage Problems

```bash
bun test --coverage --verbose                        # Debug collection
open reports/coverage/coverage-summary.html         # Visual inspection
```

---

### 🎉 **Testing Excellence Achieved**

✅ **Intelligent Testing**: Git-aware execution with 50-80% faster local loops  
✅ **Performance Monitoring**: Automated regression detection with trend
analysis  
✅ **Quality Gates**: Enforced coverage thresholds with actionable
recommendations  
✅ **bunx Compatibility**: Full dual-runtime support across all commands  
✅ **CI/CD Ready**: Optimized pipelines for different validation scenarios  
✅ **Comprehensive Reporting**: JSON, HTML, and console outputs with historical
tracking

_Transform your testing workflow from basic execution to intelligent,
performance-aware quality assurance!_ 🚀
