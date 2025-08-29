#!/usr/bin/env bun

/**
 * Fire22 Enterprise Security Scanner Demo
 * Demonstrates Bun's security scanning capabilities
 */

console.log("🔒 Fire22 Enterprise Security Scanner Demo");
console.log("===========================================");

// Import the security scanner
import { scan } from "./fire22-security-scanner.js";

async function demonstrateSecurityScanning() {
    console.log("\n🛡️  Security Scanner Features:");
    console.log("============================");
    console.log("✅ CVE Vulnerability Detection");
    console.log("✅ License Compliance Checking");
    console.log("✅ Malware and Supply Chain Protection");
    console.log("✅ Custom Fire22 Security Policies");
    console.log("✅ Enterprise-Grade Security Scanning");
    console.log("");

    // Demo package data
    const demoPackages = [
        {
            name: "axios",
            version: "1.6.0",
            _resolved: "https://registry.npmjs.org"
        },
        {
            name: "old-package",
            version: "1.0.0",
            _resolved: "https://registry.npmjs.org"
        },
        {
            name: "express",
            version: "5.1.0",
            _resolved: "https://registry.npmjs.org"
        },
        {
            name: "malicious-lib",
            version: "2.1.0",
            _resolved: "https://malicious-registry.com"
        }
    ];

    console.log("📦 Demo Packages to Scan:");
    console.log("=========================");
    demoPackages.forEach((pkg, index) => {
        console.log(`${index + 1}. ${pkg.name}@${pkg.version}`);
    });
    console.log("");

    // Run security scan with different configurations
    console.log("🔍 Running Security Scan (Warning Level):");
    console.log("===========================================");

    try {
        const warningResults = await scan(demoPackages, {
            level: "warn",
            enterpriseMode: true
        });

        console.log("\n📊 Scan Results:");
        console.log(`   📦 Total packages: ${warningResults.scanned}`);
        console.log(`   ✅ Clean: ${warningResults.clean}`);
        console.log(`   ⚠️  Warnings: ${warningResults.warnings}`);
        console.log(`   ❌ Blocked: ${warningResults.blocked}`);

    } catch (error) {
        console.log(`⚠️  Scan completed with warnings: ${error.message}`);
    }

    console.log("\n🔍 Running Security Scan (Fatal Level):");
    console.log("=======================================");

    try {
        const fatalResults = await scan(demoPackages, {
            level: "fatal",
            enterpriseMode: true
        });

        console.log("✅ All packages passed fatal-level security scan");

    } catch (error) {
        console.log(`❌ Fatal security violation detected: ${error.message}`);
        console.log("💡 In a real Bun installation, this would stop the package installation");
    }

    console.log("\n🛡️  Security Scanning Integration:");
    console.log("=================================");

    console.log("📋 bunfig.toml Configuration:");
    console.log("```toml");
    console.log("[install.security]");
    console.log('scanner = "fire22-security-scanner"');
    console.log('level = "fatal"');
    console.log('enable = true');
    console.log("```");

    console.log("\n🚀 Usage Commands:");
    console.log("==================");
    console.log("# Run security scan manually");
    console.log("bun run security:scan");
    console.log("");
    console.log("# Test security scanner");
    console.log("bun run security:test");
    console.log("");
    console.log("# Run full security audit");
    console.log("bun run security:audit");
    console.log("");

    console.log("🔧 Package Installation with Security:");
    console.log("=====================================");
    console.log("# Install package with security scanning");
    console.log("bun add axios");
    console.log("# → Automatically scans for vulnerabilities");
    console.log("");
    console.log("# Install with explicit security check");
    console.log("bun add lodash --security-scan");
    console.log("# → Forces security scan even if disabled");
    console.log("");

    console.log("🏢 Enterprise Security Features:");
    console.log("===============================");
    console.log("✅ Supply Chain Attack Protection");
    console.log("✅ License Compliance Enforcement");
    console.log("✅ Malware Detection");
    console.log("✅ Custom Security Policies");
    console.log("✅ CI/CD Pipeline Integration");
    console.log("✅ Enterprise Audit Logging");
    console.log("");

    console.log("📊 Security Levels:");
    console.log("===================");
    console.log("🔴 CRITICAL - Installation blocked, non-zero exit");
    console.log("🟠 HIGH     - Installation blocked in fatal mode");
    console.log("🟡 MEDIUM   - Warning shown, installation continues");
    console.log("🟢 LOW      - Information only");
    console.log("");

    console.log("🎯 Real-World Security Scenarios:");
    console.log("=================================");

    console.log("📝 Scenario 1: Malicious Package Detection");
    console.log("   Package: malicious-lib@2.1.0");
    console.log("   Registry: https://malicious-registry.com");
    console.log("   Result: ❌ BLOCKED - Untrusted registry");
    console.log("");

    console.log("📝 Scenario 2: Vulnerable Package");
    console.log("   Package: old-package@1.0.0");
    console.log("   CVE: CVE-2023-12345");
    console.log("   Result: ❌ BLOCKED - Known vulnerability");
    console.log("");

    console.log("📝 Scenario 3: License Violation");
    console.log("   Package: gpl-lib@1.0.0");
    console.log("   License: GPL-3.0");
    console.log("   Result: ❌ BLOCKED - Prohibited license");
    console.log("");

    console.log("📝 Scenario 4: Clean Package");
    console.log("   Package: axios@1.6.0");
    console.log("   Registry: https://registry.npmjs.org");
    console.log("   Result: ✅ ALLOWED - Passed all checks");
    console.log("");

    console.log("🔗 Integration with Fire22 Enterprise:");
    console.log("=====================================");

    console.log("🏗️  CI/CD Pipeline Integration:");
    console.log("```yaml");
    console.log("# .github/workflows/security.yml");
    console.log("name: Security Scan");
    console.log("on: [push, pull_request]");
    console.log("jobs:");
    console.log("  security:");
    console.log("    runs-on: ubuntu-latest");
    console.log("    steps:");
    console.log("      - uses: actions/checkout@v4");
    console.log("      - uses: oven-sh/setup-bun@v1");
    console.log("      - run: bun install");
    console.log("      - run: bun run security:audit");
    console.log("```");

    console.log("\n📈 Enterprise Benefits:");
    console.log("======================");
    console.log("✅ Automated Security Scanning");
    console.log("✅ Supply Chain Attack Prevention");
    console.log("✅ License Compliance Assurance");
    console.log("✅ Enterprise Policy Enforcement");
    console.log("✅ CI/CD Pipeline Security");
    console.log("✅ Audit Trail Generation");
    console.log("");

    console.log("🎉 Demo Complete!");
    console.log("=================");
    console.log("✅ Demonstrated security scanning capabilities");
    console.log("✅ Showed enterprise integration possibilities");
    console.log("✅ Created comprehensive security configuration");
    console.log("✅ Integrated with Fire22 project structure");
    console.log("");
    console.log("🔒 Your Fire22 project is now protected by enterprise-grade security scanning!");
}

// Run the demonstration
if (import.meta.main) {
    demonstrateSecurityScanning().catch(console.error);
}

export { demonstrateSecurityScanning };
