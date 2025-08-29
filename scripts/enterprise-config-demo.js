#!/usr/bin/env bun

/**
 * Fire22 Enterprise Configuration Demo
 * Demonstrating environment variable-based enterprise configuration
 */

console.log("🏢 Fire22 Enterprise Configuration Demo");
console.log("=====================================");

// Simulate different environment configurations
const ENVIRONMENTS = {
    development: {
        FIRE22_SECURITY_API_KEY: "dev-api-key-12345",
        FIRE22_SECURITY_API_URL: "https://dev-security.fire22.com/api/v1",
        FIRE22_ORGANIZATION: "fire22-dev",
        FIRE22_ENVIRONMENT: "development",
        FIRE22_COMPLIANCE_LEVEL: "standard",
        FIRE22_MAX_CONCURRENT_SCANS: "5",
        FIRE22_AUDIT_LOG_ENABLED: "false"
    },
    staging: {
        FIRE22_SECURITY_API_KEY: "staging-api-key-67890",
        FIRE22_SECURITY_API_URL: "https://staging-security.fire22.com/api/v1",
        FIRE22_ORGANIZATION: "fire22-staging",
        FIRE22_ENVIRONMENT: "staging",
        FIRE22_COMPLIANCE_LEVEL: "enterprise",
        FIRE22_MAX_CONCURRENT_SCANS: "15",
        FIRE22_AUDIT_LOG_ENABLED: "true",
        FIRE22_SLACK_WEBHOOK: "https://hooks.slack.com/services/...",
        FIRE22_STRICT_MODE: "true"
    },
    production: {
        FIRE22_SECURITY_TOKEN: "prod-token-abcdef123456",
        FIRE22_SECURITY_API_URL: "https://security.fire22.com/api/v1",
        FIRE22_ORGANIZATION: "fire22",
        FIRE22_ENVIRONMENT: "production",
        FIRE22_COMPLIANCE_LEVEL: "enterprise",
        FIRE22_MAX_CONCURRENT_SCANS: "25",
        FIRE22_AUDIT_LOG_ENABLED: "true",
        FIRE22_SLACK_WEBHOOK: "https://hooks.slack.com/services/...",
        FIRE22_EMAIL_ALERTS: "security@fire22.com",
        FIRE22_AI_ANALYSIS: "true",
        FIRE22_ADVANCED_THREATS: "true",
        FIRE22_REAL_TIME_UPDATES: "true"
    },
    enterprise: {
        FIRE22_SECURITY_CLIENT_ID: "enterprise-client-id",
        FIRE22_SECURITY_CLIENT_SECRET: "enterprise-client-secret",
        FIRE22_SECURITY_API_URL: "https://enterprise-security.fire22.com/api/v1",
        FIRE22_ORGANIZATION: "fire22-enterprise",
        FIRE22_ENVIRONMENT: "production",
        FIRE22_COMPLIANCE_LEVEL: "maximum",
        FIRE22_MAX_CONCURRENT_SCANS: "50",
        FIRE22_AUDIT_LOG_ENABLED: "true",
        FIRE22_SLACK_WEBHOOK: "https://hooks.slack.com/services/...",
        FIRE22_EMAIL_ALERTS: "security@fire22.com,compliance@fire22.com",
        FIRE22_AI_ANALYSIS: "true",
        FIRE22_ADVANCED_THREATS: "true",
        FIRE22_REAL_TIME_UPDATES: "true",
        FIRE22_CUSTOM_RULES: "true",
        FIRE22_ENTERPRISE_LICENSES_ONLY: "true",
        FIRE22_STRICT_MODE: "true",
        FIRE22_AUDIT_MODE: "true"
    }
};

function demonstrateEnvironmentConfig(envName) {
    console.log(`\n🌍 Environment: ${envName.toUpperCase()}`);
    console.log("=".repeat(50));

    const env = ENVIRONMENTS[envName];
    if (!env) {
        console.log("❌ Environment not found");
        return;
    }

    // Set environment variables for this demo
    Object.entries(env).forEach(([key, value]) => {
        process.env[key] = value;
    });

    console.log("🔧 Environment Variables:");
    Object.entries(env).forEach(([key, value]) => {
        const maskedValue = key.includes('SECRET') || key.includes('TOKEN') || key.includes('KEY')
            ? value.substring(0, 8) + "..."
            : value;
        console.log(`   ${key}=${maskedValue}`);
    });

    console.log("\n📋 Configuration Analysis:");

    // API Configuration
    if (env.FIRE22_SECURITY_API_URL) {
        console.log(`   🔗 API Endpoint: ${env.FIRE22_SECURITY_API_URL}`);
        console.log(`   🔑 Authentication: ${env.FIRE22_SECURITY_API_KEY ? "API Key" :
            env.FIRE22_SECURITY_TOKEN ? "Token" :
            env.FIRE22_SECURITY_USERNAME ? "Username/Password" :
            env.FIRE22_SECURITY_CLIENT_ID ? "OAuth2" : "Not configured"}`);
    }

    // Organization Settings
    console.log(`   🏢 Organization: ${env.FIRE22_ORGANIZATION || "fire22"}`);
    console.log(`   🌍 Environment: ${env.FIRE22_ENVIRONMENT || "production"}`);
    console.log(`   🔒 Compliance Level: ${env.FIRE22_COMPLIANCE_LEVEL || "enterprise"}`);

    // Performance Settings
    console.log(`   ⚡ Max Concurrent Scans: ${env.FIRE22_MAX_CONCURRENT_SCANS || "10"}`);
    console.log(`   📊 Audit Logging: ${env.FIRE22_AUDIT_LOG_ENABLED !== "false" ? "Enabled" : "Disabled"}`);

    // Enterprise Features
    console.log(`   🤖 AI Analysis: ${env.FIRE22_AI_ANALYSIS === "true" ? "Enabled" : "Disabled"}`);
    console.log(`   🛡️ Advanced Threats: ${env.FIRE22_ADVANCED_THREATS !== "false" ? "Enabled" : "Disabled"}`);
    console.log(`   🔄 Real-time Updates: ${env.FIRE22_REAL_TIME_UPDATES !== "false" ? "Enabled" : "Disabled"}`);
    console.log(`   ⚙️ Custom Rules: ${env.FIRE22_CUSTOM_RULES === "true" ? "Enabled" : "Disabled"}`);

    // Special Features
    console.log(`   📧 Email Alerts: ${env.FIRE22_EMAIL_ALERTS || "Not configured"}`);
    console.log(`   💬 Slack Integration: ${env.FIRE22_SLACK_WEBHOOK ? "Configured" : "Not configured"}`);
    console.log(`   🔐 Enterprise Licenses Only: ${env.FIRE22_ENTERPRISE_LICENSES_ONLY === "true" ? "Yes" : "No"}`);
    console.log(`   🚨 Strict Mode: ${env.FIRE22_STRICT_MODE === "true" ? "Enabled" : "Disabled"}`);
    console.log(`   📈 Audit Mode: ${env.FIRE22_AUDIT_MODE === "true" ? "Enabled" : "Disabled"}`);

    console.log("\n💡 Use Case:");
    switch (envName) {
        case 'development':
            console.log("   🔧 Development environment with relaxed security for faster iteration");
            console.log("   📊 Basic logging and monitoring");
            console.log("   ⚡ Optimized for developer productivity");
            break;
        case 'staging':
            console.log("   🧪 Staging environment with enterprise security validation");
            console.log("   📊 Full audit logging and Slack notifications");
            console.log("   🚨 Strict mode for quality assurance");
            break;
        case 'production':
            console.log("   🚀 Production environment with maximum security");
            console.log("   🤖 AI-powered threat analysis");
            console.log("   🔄 Real-time threat updates");
            console.log("   📧 Comprehensive alerting system");
            break;
        case 'enterprise':
            console.log("   🏢 Enterprise environment with maximum compliance");
            console.log("   🔐 Enterprise-only licenses required");
            console.log("   📊 Comprehensive audit trails");
            console.log("   🔧 Custom security rules enabled");
            console.log("   📧 Multi-channel alerting (Email + Slack)");
            break;
    }
}

function showConfigurationExamples() {
    console.log("\n📚 Enterprise Configuration Examples");
    console.log("===================================");

    console.log("\n🔐 Authentication Methods:");
    console.log("==========================");
    console.log("# API Key (Recommended for most cases)");
    console.log("export FIRE22_SECURITY_API_KEY='your-api-key-here'");
    console.log("");
    console.log("# Bearer Token");
    console.log("export FIRE22_SECURITY_TOKEN='your-bearer-token'");
    console.log("");
    console.log("# Username/Password");
    console.log("export FIRE22_SECURITY_USERNAME='your-username'");
    console.log("export FIRE22_SECURITY_PASSWORD='your-password'");
    console.log("");
    console.log("# OAuth2 Client Credentials");
    console.log("export FIRE22_SECURITY_CLIENT_ID='your-client-id'");
    console.log("export FIRE22_SECURITY_CLIENT_SECRET='your-client-secret'");

    console.log("\n🌐 API Configuration:");
    console.log("====================");
    console.log("# Custom API endpoint");
    console.log("export FIRE22_SECURITY_API_URL='https://security.yourcompany.com/api/v1'");
    console.log("");
    console.log("# Custom timeout and retries");
    console.log("export FIRE22_SECURITY_TIMEOUT='45000'");
    console.log("export FIRE22_SECURITY_RETRIES='5'");

    console.log("\n🏢 Organization Settings:");
    console.log("=========================");
    console.log("# Organization and environment identification");
    console.log("export FIRE22_ORGANIZATION='your-company-name'");
    console.log("export FIRE22_ENVIRONMENT='production'");
    console.log("export FIRE22_COMPLIANCE_LEVEL='enterprise'");

    console.log("\n⚡ Performance Tuning:");
    console.log("=====================");
    console.log("# Performance and scaling settings");
    console.log("export FIRE22_MAX_CONCURRENT_SCANS='25'");
    console.log("export FIRE22_SCAN_TIMEOUT='120000'");
    console.log("export FIRE22_BATCH_SIZE='100'");

    console.log("\n📊 Monitoring & Alerting:");
    console.log("=========================");
    console.log("# Audit logging and alerting");
    console.log("export FIRE22_AUDIT_LOG_ENABLED='true'");
    console.log("export FIRE22_SLACK_WEBHOOK='https://hooks.slack.com/services/...'");
    console.log("export FIRE22_EMAIL_ALERTS='security@yourcompany.com'");

    console.log("\n🔧 Advanced Features:");
    console.log("=====================");
    console.log("# Enable advanced security features");
    console.log("export FIRE22_AI_ANALYSIS='true'");
    console.log("export FIRE22_ADVANCED_THREATS='true'");
    console.log("export FIRE22_REAL_TIME_UPDATES='true'");
    console.log("export FIRE22_CUSTOM_RULES='true'");

    console.log("\n📋 Policy Configuration:");
    console.log("========================");
    console.log("# License and registry policies");
    console.log("export FIRE22_BLOCKED_LICENSES='GPL-3.0,AGPL-3.0,MS-PL,WTFPL'");
    console.log("export FIRE22_TRUSTED_REGISTRIES='https://registry.npmjs.org,https://registry.yourcompany.com'");
    console.log("export FIRE22_ENTERPRISE_LICENSES_ONLY='true'");

    console.log("\n🔒 Security Modes:");
    console.log("==================");
    console.log("# Security enforcement levels");
    console.log("export FIRE22_STRICT_MODE='true'");
    console.log("export FIRE22_AUDIT_MODE='true'");
    console.log("export FIRE22_DISABLE_TYPOSQUATTING='false'");
    console.log("export FIRE22_DISABLE_SUPPLY_CHAIN='false'");
}

function showDeploymentScenarios() {
    console.log("\n🚀 Deployment Scenarios");
    console.log("=======================");

    console.log("\n📁 ~/.bashrc (Personal Development)");
    console.log("===================================");
    console.log("# Development environment");
    console.log("export FIRE22_SECURITY_API_KEY='dev-key-123'");
    console.log("export FIRE22_ENVIRONMENT='development'");
    console.log("export FIRE22_MAX_CONCURRENT_SCANS='5'");

    console.log("\n🏗️ .env.staging (Staging Environment)");
    console.log("===================================");
    console.log("# Staging environment with monitoring");
    console.log("FIRE22_SECURITY_API_KEY=staging-key-456");
    console.log("FIRE22_ENVIRONMENT=staging");
    console.log("FIRE22_SLACK_WEBHOOK=https://hooks.slack.com/services/...");
    console.log("FIRE22_AUDIT_LOG_ENABLED=true");

    console.log("\n🏭 .env.production (Production Environment)");
    console.log("========================================");
    console.log("# Production with maximum security");
    console.log("FIRE22_SECURITY_TOKEN=prod-token-789");
    console.log("FIRE22_ENVIRONMENT=production");
    console.log("FIRE22_AI_ANALYSIS=true");
    console.log("FIRE22_ADVANCED_THREATS=true");
    console.log("FIRE22_STRICT_MODE=true");

    console.log("\n🏢 /etc/fire22/security.env (Enterprise Server)");
    console.log("==============================================");
    console.log("# Enterprise server configuration");
    console.log("FIRE22_SECURITY_CLIENT_ID=enterprise-client");
    console.log("FIRE22_SECURITY_CLIENT_SECRET=enterprise-secret");
    console.log("FIRE22_ORGANIZATION=your-enterprise");
    console.log("FIRE22_COMPLIANCE_LEVEL=maximum");
    console.log("FIRE22_MAX_CONCURRENT_SCANS=50");
    console.log("FIRE22_EMAIL_ALERTS=security@yourcompany.com,compliance@yourcompany.com");

    console.log("\n🐳 Docker Environment Variables");
    console.log("===============================");
    console.log("# Docker container configuration");
    console.log("docker run -e FIRE22_SECURITY_API_KEY=container-key \\");
    console.log("           -e FIRE22_ENVIRONMENT=container \\");
    console.log("           -e FIRE22_MAX_CONCURRENT_SCANS=10 \\");
    console.log("           your-app:latest");

    console.log("\n☸️ Kubernetes Secrets");
    console.log("=====================");
    console.log("# Kubernetes secret configuration");
    console.log("apiVersion: v1");
    console.log("kind: Secret");
    console.log("metadata:");
    console.log("  name: fire22-security-config");
    console.log("type: Opaque");
    console.log("data:");
    console.log("  FIRE22_SECURITY_API_KEY: <base64-encoded-key>");
    console.log("  FIRE22_SECURITY_TOKEN: <base64-encoded-token>");
}

// Run the demonstration
if (import.meta.main) {
    // Demonstrate different environments
    Object.keys(ENVIRONMENTS).forEach(env => {
        demonstrateEnvironmentConfig(env);
    });

    // Show configuration examples
    showConfigurationExamples();

    // Show deployment scenarios
    showDeploymentScenarios();

    console.log("\n🎉 Enterprise Configuration Demo Complete!");
    console.log("=========================================");
    console.log("✅ Demonstrated environment-based configuration");
    console.log("✅ Showed authentication methods and API configuration");
    console.log("✅ Illustrated performance tuning options");
    console.log("✅ Presented monitoring and alerting setup");
    console.log("✅ Covered deployment scenarios for different environments");
    console.log("");
    console.log("🔧 Your Fire22 security scanner now supports enterprise configuration!");
    console.log("   Configure it using environment variables for your specific needs.");
}
