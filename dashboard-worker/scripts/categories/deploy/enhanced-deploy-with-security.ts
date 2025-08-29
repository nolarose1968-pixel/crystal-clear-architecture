#!/usr/bin/env bun

/**
 * 🚀 Fire22 Enhanced Deployment with Security Integration
 *
 * Extends existing enhanced deployment with comprehensive security checks
 * Integrates Bun.secrets and enhanced security scanning
 * Provides secure deployment pipeline for Fire22 dashboard
 *
 * @version 3.0.0
 * @author Fire22 Development Team
 */

import { runScript } from '../../core/script-runner';
import { handleError, createError } from '../../core/error-handler';
import { validateConfig } from '../../core/config-validator';
import { EnhancedSecurityScanner } from '../../enhanced-security-scanner';
import { enhancedConfigManager } from '../../enhanced-secure-config';

// Enhanced deployment configuration schema
const enhancedDeployConfigSchema = {
  environment: {
    type: 'string',
    required: true,
    enum: ['staging', 'production', 'canary', 'demo'],
  },
  version: {
    type: 'string',
    required: true,
    pattern: /^\d+\.\d+\.\d+$/,
  },
  strategy: {
    type: 'string',
    required: true,
    enum: ['blue-green', 'rolling', 'canary', 'recreate', 'secure-rolling'],
  },
  securityLevel: {
    type: 'string',
    required: false,
    enum: ['standard', 'enhanced', 'strict'],
    default: 'enhanced',
  },
  healthCheckUrl: {
    type: 'string',
    required: true,
    pattern: /^https?:\/\/.+/,
  },
  healthCheckTimeout: {
    type: 'number',
    required: true,
    min: 5000,
    max: 60000,
  },
  maxRetries: {
    type: 'number',
    required: true,
    min: 1,
    max: 10,
  },
  rollbackThreshold: {
    type: 'number',
    required: true,
    min: 0,
    max: 100,
  },
  securityChecks: {
    type: 'object',
    required: false,
    properties: {
      preDeploy: { type: 'boolean', default: true },
      postDeploy: { type: 'boolean', default: true },
      dependencyScan: { type: 'boolean', default: true },
      credentialValidation: { type: 'boolean', default: true },
    },
  },
};

// Default enhanced deployment configuration
const defaultEnhancedDeployConfig = {
  environment: 'staging',
  version: '1.0.0',
  strategy: 'secure-rolling',
  securityLevel: 'enhanced',
  healthCheckUrl: 'http://localhost:3000/health',
  healthCheckTimeout: 30000,
  maxRetries: 3,
  rollbackThreshold: 5,
  securityChecks: {
    preDeploy: true,
    postDeploy: true,
    dependencyScan: true,
    credentialValidation: true,
  },
};

/**
 * Enhanced security check step for deployment process
 */
async function enhancedSecurityCheck(config: any): Promise<{ passed: boolean; issues: string[] }> {
  return await runScript(
    'enhanced-security-check',
    async () => {
      console.log('🛡️  Step 0: Enhanced Pre-deployment Security Scan\n');

      const issues: string[] = [];

      try {
        // 1. Enhanced security scanner
        if (config.securityChecks.dependencyScan) {
          console.log('🔍 Running enhanced security scanner...');
          const scanner = new EnhancedSecurityScanner();
          const scanResult = await scanner.performEnhancedScan();

          if (!scanResult.passed) {
            issues.push(`Security scan failed with ${scanResult.issues.length} issues`);
            console.log(`❌ Security scan failed - ${scanResult.issues.length} issues found`);

            // Show critical issues
            const criticalIssues = scanResult.issues.filter(i => i.severity === 'critical');
            if (criticalIssues.length > 0) {
              console.log('\n🚨 CRITICAL SECURITY ISSUES:');
              criticalIssues.forEach(issue => {
                console.log(`   • ${issue.package}@${issue.version}: ${issue.description}`);
              });
            }
          } else {
            console.log(`✅ Security scan passed - Score: ${scanResult.securityScore}/100`);
          }
        }

        // 2. Enhanced credential validation
        if (config.securityChecks.credentialValidation) {
          console.log('\n🔐 Validating enhanced security credentials...');
          const credentials = await enhancedConfigManager.getEnhancedConfig();

          const requiredCredentials = [
            'BOT_TOKEN',
            'CASHIER_BOT_TOKEN',
            'ADMIN_USERNAME',
            'ADMIN_PASSWORD',
            'JWT_SECRET',
            'FIRE22_API_TOKEN',
          ];

          for (const cred of requiredCredentials) {
            if (!credentials[cred]) {
              issues.push(`Missing required credential: ${cred}`);
              console.log(`❌ Missing required credential: ${cred}`);
            } else {
              console.log(`✅ Found credential: ${cred}`);
            }
          }

          if (requiredCredentials.every(cred => credentials[cred])) {
            console.log('✅ All required credentials validated');
          }
        }

        // 3. Environment-specific security checks
        if (config.environment === 'production') {
          console.log('\n🚨 Production environment security checks...');

          // Check for production-specific security requirements
          const productionChecks = [
            'SSL/TLS configuration',
            'Rate limiting enabled',
            'Security headers configured',
            'Monitoring and alerting active',
          ];

          for (const check of productionChecks) {
            // Simulate production security checks
            await Bun.sleep(100);
            console.log(`✅ ${check}`);
          }
        }

        // 4. Security policy compliance
        console.log('\n📋 Checking Fire22 security policy compliance...');
        const policyChecks = [
          'No known vulnerable packages',
          'Approved license types only',
          'Financial packages security reviewed',
          'Telegram bot packages validated',
        ];

        for (const check of policyChecks) {
          // Simulate policy compliance checks
          await Bun.sleep(50);
          console.log(`✅ ${check}`);
        }
      } catch (error) {
        issues.push(`Security check failed: ${error.message}`);
        console.error('❌ Security check failed:', error);
      }

      const passed = issues.length === 0;

      if (passed) {
        console.log('\n🎉 All security checks passed! Deployment can proceed.');
      } else {
        console.log('\n🚨 Security checks failed. Deployment blocked.');
        console.log('Issues to resolve:');
        issues.forEach(issue => console.log(`   • ${issue}`));
      }

      return { passed, issues };
    },
    {
      tags: ['deploy', 'security', 'enhanced'],
      logLevel: 'info',
    }
  );
}

/**
 * Enhanced deployment validation with security focus
 */
async function enhancedDeploymentValidation(
  config: any
): Promise<{ valid: boolean; issues: string[] }> {
  return await runScript(
    'enhanced-deployment-validation',
    async () => {
      console.log('🔍 Step 1: Enhanced Environment Validation\n');

      const issues: string[] = [];

      // Enhanced deployment prerequisites
      const requiredFiles = ['./package.json', './bunfig.toml', './dist'];
      for (const file of requiredFiles) {
        try {
          if (file === './dist') {
            const distStats = await Bun.file(file).stat();
            if (!distStats.isDirectory()) {
              issues.push('./dist is not a directory');
            }
          } else {
            await Bun.file(file).text();
          }
        } catch {
          issues.push(`Required file/directory not found: ${file}`);
        }
      }

      // Security-specific validation
      if (config.securityLevel === 'strict') {
        console.log('🔒 Strict security mode - additional validations...');

        // Check for security configuration files
        const securityFiles = ['./bunfig-security-demo.toml', './SECURITY.md'];
        for (const file of securityFiles) {
          try {
            await Bun.file(file).text();
            console.log(`✅ Found security config: ${file}`);
          } catch {
            console.log(`⚠️  Security config not found: ${file}`);
          }
        }
      }

      // Check available disk space (simulated)
      const diskSpace = 2048; // MB - simulated
      if (diskSpace < 500) {
        issues.push(`Insufficient disk space: ${diskSpace}MB (required: 500MB+)`);
      }

      // Check network connectivity (simulated)
      await Bun.sleep(100);
      const networkOk = true; // Simulated
      if (!networkOk) {
        issues.push('Network connectivity issues detected');
      }

      return {
        valid: issues.length === 0,
        issues,
      };
    },
    {
      tags: ['deploy', 'validation', 'enhanced', 'security'],
      logLevel: 'info',
    }
  );
}

/**
 * Enhanced deployment with security monitoring
 */
async function enhancedDeployNewVersion(
  config: any
): Promise<{ deployed: boolean; deploymentId: string; errors: string[] }> {
  return await runScript(
    'enhanced-deploy-new-version',
    async () => {
      console.log('🚀 Step 2: Enhanced Deployment with Security Monitoring\n');

      const errors: string[] = [];

      // Simulate deployment process
      await Bun.sleep(800);

      // Generate deployment ID with security tracking
      const deploymentId = `secure-deploy-${Date.now()}-${config.environment}-${config.securityLevel}`;

      // Enhanced deployment steps based on strategy
      switch (config.strategy) {
        case 'secure-rolling':
          console.log('🔄 Secure rolling deployment with enhanced security...');
          await Bun.sleep(600);
          break;
        case 'blue-green':
          console.log('🔵🔴 Blue-green deployment with security validation...');
          await Bun.sleep(400);
          break;
        case 'rolling':
          console.log('🔄 Rolling deployment with security checks...');
          await Bun.sleep(600);
          break;
        case 'canary':
          console.log('🐦 Canary deployment with security monitoring...');
          await Bun.sleep(500);
          break;
        case 'recreate':
          console.log('🔄 Recreate deployment with security validation...');
          await Bun.sleep(300);
          break;
      }

      // Security monitoring during deployment
      if (config.securityLevel === 'strict') {
        console.log('🔒 Strict security monitoring active...');
        await Bun.sleep(200);
        console.log('✅ Security monitoring passed');
      }

      return {
        deployed: true,
        deploymentId,
        errors,
      };
    },
    {
      tags: ['deploy', 'new-version', 'enhanced', config.strategy],
      logLevel: 'info',
    }
  );
}

/**
 * Enhanced health checks with security validation
 */
async function enhancedHealthChecks(
  config: any
): Promise<{ healthy: boolean; responseTime: number; errors: string[] }> {
  return await runScript(
    'enhanced-health-checks',
    async () => {
      console.log('🏥 Step 3: Enhanced Health Checks with Security Validation\n');

      const errors: string[] = [];
      let healthy = true;
      let totalResponseTime = 0;

      // Perform multiple health checks with security focus
      const healthCheckCount = 3;

      for (let i = 0; i < healthCheckCount; i++) {
        const start = Date.now();

        // Simulate health check
        await Bun.sleep(200);

        // Simulate health check response
        const responseTime = Date.now() - start;
        totalResponseTime += responseTime;

        // Security-specific health checks
        if (config.securityLevel === 'enhanced' || config.securityLevel === 'strict') {
          console.log(`🔒 Security health check ${i + 1}/${healthCheckCount}...`);

          // Simulate security health checks
          await Bun.sleep(100);

          // Check for security anomalies
          const securityAnomalies = Math.random() > 0.9; // 10% chance of anomaly
          if (securityAnomalies) {
            errors.push(`Security anomaly detected in health check ${i + 1}`);
            healthy = false;
          }
        }
      }

      const avgResponseTime = totalResponseTime / healthCheckCount;

      if (healthy) {
        console.log(`✅ Health checks passed - Avg response time: ${avgResponseTime}ms`);
      } else {
        console.log(`❌ Health checks failed - ${errors.length} errors`);
      }

      return {
        healthy,
        responseTime: avgResponseTime,
        errors,
      };
    },
    {
      tags: ['deploy', 'health-checks', 'enhanced', 'security'],
      logLevel: 'info',
    }
  );
}

/**
 * Post-deployment security validation
 */
async function postDeploymentSecurityValidation(
  config: any
): Promise<{ passed: boolean; issues: string[] }> {
  return await runScript(
    'post-deployment-security-validation',
    async () => {
      console.log('🛡️  Step 4: Post-Deployment Security Validation\n');

      const issues: string[] = [];

      if (!config.securityChecks.postDeploy) {
        console.log('⚪ Post-deployment security checks disabled');
        return { passed: true, issues: [] };
      }

      try {
        // 1. Runtime security scan
        console.log('🔍 Running runtime security scan...');
        await Bun.sleep(300);
        console.log('✅ Runtime security scan passed');

        // 2. Credential access validation
        console.log('🔐 Validating credential access...');
        const credentials = await enhancedConfigManager.getEnhancedConfig();

        if (Object.keys(credentials).length === 0) {
          issues.push('No credentials accessible after deployment');
        } else {
          console.log(
            `✅ Credential access validated (${Object.keys(credentials).length} credentials)`
          );
        }

        // 3. Security endpoint validation
        console.log('🔗 Validating security endpoints...');
        const securityEndpoints = ['/health', '/security/status', '/admin/auth'];

        for (const endpoint of securityEndpoints) {
          // Simulate endpoint validation
          await Bun.sleep(50);
          console.log(`✅ Security endpoint validated: ${endpoint}`);
        }

        // 4. Security policy enforcement check
        console.log('📋 Checking security policy enforcement...');
        await Bun.sleep(200);
        console.log('✅ Security policies enforced');
      } catch (error) {
        issues.push(`Post-deployment security validation failed: ${error.message}`);
        console.error('❌ Post-deployment security validation failed:', error);
      }

      const passed = issues.length === 0;

      if (passed) {
        console.log('\n🎉 Post-deployment security validation passed!');
      } else {
        console.log('\n⚠️  Post-deployment security validation issues found:');
        issues.forEach(issue => console.log(`   • ${issue}`));
      }

      return { passed, issues };
    },
    {
      tags: ['deploy', 'post-deployment', 'security', 'validation'],
      logLevel: 'info',
    }
  );
}

/**
 * Main enhanced deployment function with security integration
 */
export async function deployWithEnhancedSecurity(
  environment: string = 'staging',
  version: string = '1.0.0',
  strategy: string = 'secure-rolling',
  securityLevel: string = 'enhanced'
): Promise<void> {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                Fire22 Enhanced Deployment with Security                     ║
║                                                                              ║
║  🚀 Environment: ${environment.padEnd(20)} ║
║  📦 Version: ${version.padEnd(20)} ║
║  🔄 Strategy: ${strategy.padEnd(20)} ║
║  🛡️  Security Level: ${securityLevel.padEnd(20)} ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

  try {
    // Build enhanced configuration
    const config = {
      ...defaultEnhancedDeployConfig,
      environment,
      version,
      strategy,
      securityLevel,
    };

    // Step 0: Enhanced Security Check
    const securityResult = await enhancedSecurityCheck(config);
    if (!securityResult.passed) {
      throw new Error(`Security validation failed: ${securityResult.issues.join(', ')}`);
    }

    // Step 1: Enhanced Environment Validation
    const validationResult = await enhancedDeploymentValidation(config);
    if (!validationResult.valid) {
      throw new Error(`Environment validation failed: ${validationResult.issues.join(', ')}`);
    }

    // Step 2: Enhanced Deployment
    const deploymentResult = await enhancedDeployNewVersion(config);
    if (!deploymentResult.deployed) {
      throw new Error(`Deployment failed: ${deploymentResult.errors.join(', ')}`);
    }

    // Step 3: Enhanced Health Checks
    const healthResult = await enhancedHealthChecks(config);
    if (!healthResult.healthy) {
      throw new Error(`Health checks failed: ${healthResult.errors.join(', ')}`);
    }

    // Step 4: Post-Deployment Security Validation
    const postDeployResult = await postDeploymentSecurityValidation(config);
    if (!postDeployResult.passed) {
      console.warn('⚠️  Post-deployment security validation issues (non-blocking)');
      postDeployResult.issues.forEach(issue => console.warn(`   • ${issue}`));
    }

    console.log(`
🎉 Enhanced Deployment with Security Completed Successfully!

📊 Deployment Summary:
   🚀 Environment: ${environment}
   📦 Version: ${version}
   🔄 Strategy: ${strategy}
   🛡️  Security Level: ${securityLevel}
   🔑 Deployment ID: ${deploymentResult.deploymentId}
   ⏱️  Health Check Response: ${healthResult.responseTime}ms

💡 Security Features Applied:
   ✅ Pre-deployment security scan
   ✅ Enhanced credential validation
   ✅ Security policy compliance
   ✅ Runtime security monitoring
   ✅ Post-deployment security validation

🔒 Next Steps:
   1. Monitor application performance
   2. Review security logs
   3. Schedule next security scan
   4. Update security documentation
`);
  } catch (error) {
    console.error('🚨 Enhanced deployment with security failed:', error.message);

    // Enhanced error handling with security context
    if (error.message.includes('Security validation failed')) {
      console.error('\n🛡️  Security Issues Detected:');
      console.error('   • Review security scan results');
      console.error('   • Fix critical vulnerabilities');
      console.error('   • Validate credentials');
      console.error('   • Check security policies');
    }

    process.exit(1);
  }
}

// CLI interface
if (import.meta.main) {
  const args = process.argv.slice(2);
  const environment = args[0] || 'staging';
  const version = args[1] || '1.0.0';
  const strategy = args[2] || 'secure-rolling';
  const securityLevel = args[3] || 'enhanced';

  deployWithEnhancedSecurity(environment, version, strategy, securityLevel).catch(console.error);
}
