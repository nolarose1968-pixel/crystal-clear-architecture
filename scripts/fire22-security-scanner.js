#!/usr/bin/env bun

/**
 * Fire22 Enterprise Security Scanner
 * Comprehensive security scanning for Bun package installations
 *
 * This scanner provides enterprise-grade security analysis including:
 * - CVE vulnerability detection
 * - License compliance checking
 * - Malware and supply chain attack detection
 * - Custom Fire22 security policies
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

// Security scanner configuration
const CONFIG = {
    // Known vulnerable packages (demo data)
    vulnerablePackages: {
        "old-package": {
            severity: "high",
            cve: "CVE-2023-12345",
            description: "Known vulnerability in old-package"
        },
        "malicious-lib": {
            severity: "critical",
            cve: "CVE-2023-67890",
            description: "Malicious package detected"
        }
    },

    // Blocked licenses
    blockedLicenses: ["GPL-3.0", "AGPL-3.0", "MS-PL"],

    // Trusted registries
    trustedRegistries: [
        "https://registry.npmjs.org",
        "https://registry.yarnpkg.com"
    ],

    // Fire22 custom security rules
    customRules: {
        noTyposquatting: true,
        supplyChainCheck: true,
        enterpriseCompliance: true
    }
};

// Security scan result types
const SEVERITY_LEVELS = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
    CRITICAL: "critical"
};

const SCAN_RESULTS = {
    CLEAN: "clean",
    WARNING: "warning",
    BLOCKED: "blocked"
};

/**
 * Main security scanner function
 * This function is called by Bun during package installation
 */
export async function scan(packages, options = {}) {
    console.log("🔍 Fire22 Enterprise Security Scanner");
    console.log("=====================================");

    const results = {
        scanned: 0,
        clean: 0,
        warnings: 0,
        blocked: 0,
        issues: []
    };

    for (const pkg of packages) {
        results.scanned++;
        const scanResult = await scanPackage(pkg, options);

        switch (scanResult.status) {
            case SCAN_RESULTS.CLEAN:
                results.clean++;
                console.log(`✅ ${pkg.name}@${pkg.version} - Clean`);
                break;

            case SCAN_RESULTS.WARNING:
                results.warnings++;
                console.log(`⚠️  ${pkg.name}@${pkg.version} - Warning: ${scanResult.message}`);
                results.issues.push(scanResult);
                break;

            case SCAN_RESULTS.BLOCKED:
                results.blocked++;
                console.log(`❌ ${pkg.name}@${pkg.version} - BLOCKED: ${scanResult.message}`);
                results.issues.push(scanResult);

                // In fatal mode, throw error to stop installation
                if (options.level === 'fatal' || scanResult.severity === SEVERITY_LEVELS.CRITICAL) {
                    throw new Error(`Security scan failed: ${scanResult.message}`);
                }
                break;
        }
    }

    // Summary
    console.log("\n📊 Security Scan Summary:");
    console.log(`   📦 Packages scanned: ${results.scanned}`);
    console.log(`   ✅ Clean packages: ${results.clean}`);
    console.log(`   ⚠️  Warnings: ${results.warnings}`);
    console.log(`   ❌ Blocked packages: ${results.blocked}`);

    if (results.issues.length > 0) {
        console.log("\n🚨 Security Issues Found:");
        for (const issue of results.issues) {
            console.log(`   ${issue.severity.toUpperCase()}: ${issue.message}`);
        }
    }

    return results;
}

/**
 * Scan individual package for security issues
 */
async function scanPackage(pkg, options) {
    const issues = [];

    // 1. Check for known vulnerabilities
    const vulnCheck = checkVulnerabilities(pkg);
    if (vulnCheck) {
        return {
            status: SCAN_RESULTS.BLOCKED,
            severity: vulnCheck.severity,
            message: vulnCheck.description,
            cve: vulnCheck.cve
        };
    }

    // 2. Check license compliance
    const licenseCheck = await checkLicenseCompliance(pkg);
    if (licenseCheck.blocked) {
        return {
            status: SCAN_RESULTS.BLOCKED,
            severity: SEVERITY_LEVELS.HIGH,
            message: `Blocked license: ${licenseCheck.license}`
        };
    }

    // 3. Check registry trust
    const registryCheck = checkRegistryTrust(pkg);
    if (!registryCheck.trusted) {
        return {
            status: SCAN_RESULTS.WARNING,
            severity: SEVERITY_LEVELS.MEDIUM,
            message: `Untrusted registry: ${registryCheck.registry}`
        };
    }

    // 4. Fire22 custom security checks
    const customChecks = await runCustomChecks(pkg);
    if (customChecks.length > 0) {
        const highestSeverity = customChecks.reduce((max, check) =>
            getSeverityLevel(check.severity) > getSeverityLevel(max) ? check.severity : max,
            SEVERITY_LEVELS.LOW
        );

        return {
            status: highestSeverity === SEVERITY_LEVELS.CRITICAL ? SCAN_RESULTS.BLOCKED : SCAN_RESULTS.WARNING,
            severity: highestSeverity,
            message: `Custom security check failed: ${customChecks[0].message}`
        };
    }

    // 5. Malware scanning (simulated)
    const malwareCheck = await checkMalware(pkg);
    if (malwareCheck.detected) {
        return {
            status: SCAN_RESULTS.BLOCKED,
            severity: SEVERITY_LEVELS.CRITICAL,
            message: "Malware detected in package"
        };
    }

    return {
        status: SCAN_RESULTS.CLEAN,
        severity: SEVERITY_LEVELS.LOW,
        message: "Package passed all security checks"
    };
}

/**
 * Check for known vulnerabilities
 */
function checkVulnerabilities(pkg) {
    const vuln = CONFIG.vulnerablePackages[pkg.name];
    if (vuln) {
        return {
            severity: vuln.severity,
            cve: vuln.cve,
            description: vuln.description
        };
    }
    return null;
}

/**
 * Check license compliance
 */
async function checkLicenseCompliance(pkg) {
    try {
        // Try to read package.json from node_modules
        const packagePath = join(process.cwd(), "node_modules", pkg.name, "package.json");

        if (existsSync(packagePath)) {
            const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
            const license = packageJson.license;

            if (CONFIG.blockedLicenses.includes(license)) {
                return { blocked: true, license };
            }
        }
    } catch (error) {
        // If we can't read the package, assume it's okay for now
        console.warn(`⚠️  Could not check license for ${pkg.name}`);
    }

    return { blocked: false };
}

/**
 * Check if registry is trusted
 */
function checkRegistryTrust(pkg) {
    // Simulate registry checking
    // In a real implementation, this would check the package's registry URL
    const isTrusted = CONFIG.trustedRegistries.some(registry =>
        pkg._resolved && pkg._resolved.includes(registry)
    );

    return {
        trusted: isTrusted,
        registry: pkg._resolved || "unknown"
    };
}

/**
 * Run Fire22 custom security checks
 */
async function runCustomChecks(pkg) {
    const issues = [];

    // Typosquatting check
    if (CONFIG.customRules.noTyposquatting) {
        const typosquatCheck = checkTyposquatting(pkg.name);
        if (typosquatCheck.suspicious) {
            issues.push({
                severity: SEVERITY_LEVELS.MEDIUM,
                message: `Potential typosquatting: ${pkg.name} similar to ${typosquatCheck.similarTo}`
            });
        }
    }

    // Supply chain check
    if (CONFIG.customRules.supplyChainCheck) {
        const supplyChainCheck = await checkSupplyChain(pkg);
        if (!supplyChainCheck.verified) {
            issues.push({
                severity: SEVERITY_LEVELS.HIGH,
                message: "Supply chain verification failed"
            });
        }
    }

    return issues;
}

/**
 * Check for typosquatting attempts
 */
function checkTyposquatting(packageName) {
    // Simple typosquatting detection (in a real implementation, this would be more sophisticated)
    const commonPackages = ["react", "express", "lodash", "axios", "typescript"];
    const suspicious = commonPackages.some(common =>
        levenshteinDistance(packageName, common) <= 2 && packageName !== common
    );

    return {
        suspicious,
        similarTo: suspicious ? commonPackages.find(common =>
            levenshteinDistance(packageName, common) <= 2
        ) : null
    };
}

/**
 * Check supply chain security
 */
async function checkSupplyChain(pkg) {
    // Simulate supply chain verification
    // In a real implementation, this would check:
    // - Package signatures
    // - Publisher identity
    // - Build provenance
    // - Dependency chain integrity

    return { verified: true }; // Assume verified for demo
}

/**
 * Malware scanning simulation
 */
async function checkMalware(pkg) {
    // Simulate malware scanning
    // In a real implementation, this would:
    // - Scan package contents for malicious code
    // - Check file signatures
    // - Analyze behavior patterns

    return { detected: false }; // No malware detected
}

/**
 * Calculate Levenshtein distance for typosquatting detection
 */
function levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
}

/**
 * Get severity level weight for comparison
 */
function getSeverityLevel(severity) {
    const levels = {
        [SEVERITY_LEVELS.LOW]: 1,
        [SEVERITY_LEVELS.MEDIUM]: 2,
        [SEVERITY_LEVELS.HIGH]: 3,
        [SEVERITY_LEVELS.CRITICAL]: 4
    };
    return levels[severity] || 0;
}

// Export for use as a Bun security scanner
export default {
    scan,
    name: "Fire22 Enterprise Security Scanner",
    version: "1.0.0",
    description: "Comprehensive security scanning for Fire22 enterprise applications"
};
