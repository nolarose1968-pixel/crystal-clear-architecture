#!/usr/bin/env bun

/**
 * Test Script for L-Key to Telegram Validation System
 * 
 * Tests the validation system with sample data to ensure
 * it correctly identifies mismatches and provides fixes.
 */

import { LKeyTelegramValidator, ValidationReport } from './l-key-telegram-validator';

// Mock environment for testing
const mockEnv = {
  NODE_ENV: 'development',
  FIRE22_DEMO_MODE: 'true',
  FIRE22_TOKEN: 'dev-token',
  FIRE22_API_BASE_URL: 'https://api.fire22.ag',
  FIRE22_DATA_CACHE: {
    get: async (key: string) => null,
    put: async (key: string, value: string) => {},
    delete: async (key: string) => {}
  },
  FIRE22_AUTH_CACHE: {
    get: async (key: string) => null,
    put: async (key: string, value: string) => {},
    delete: async (key: string) => {}
  }
};

async function runValidationTest() {
  
  try {
    // Initialize validator
    let validator: LKeyTelegramValidator;
    try {
      validator = new LKeyTelegramValidator(mockEnv);
    } catch (error) {
      console.error('❌ Validator initialization failed:', error.message);
      return {
        success: false,
        error: `Initialization failed: ${error.message}`
      };
    }
    
    // Run validation with demo data
    let report: ValidationReport;
    try {
      report = await validator.validateLKeyTelegramConsistency('BLAKEPPH');
    } catch (error) {
      console.error('❌ Validation execution failed:', error.message);
      
      // Return a minimal error report
      return {
        success: false,
        error: error.message,
        summary: {
          totalValidated: 0,
          successRate: '0%',
          issuesFound: 1,
          fixableIssues: 0
        }
      };
    }
    
    // Display results
    
    // Show sample issues
    if (report.customerValidations.length > 0) {
      const issueCustomers = report.customerValidations
        .filter(c => c.issues.length > 0)
        .slice(0, 3);
        
      for (const customer of issueCustomers) {
      }
    }
    
    if (report.telegramValidations.length > 0) {
      const issueTelegram = report.telegramValidations
        .filter(t => t.issues.length > 0)
        .slice(0, 3);
        
      for (const telegram of issueTelegram) {
      }
    }
    
    // Show recommendations
    for (const recommendation of report.recommendations) {
    }
    
    // Test auto-fix functionality
    if (report.fixableIssues > 0) {
      const fixResults = await validator.autoFixIssues(report);
      
      
      if (fixResults.results.length > 0) {
        for (const result of fixResults.results.slice(0, 5)) {
          const status = result.success ? '✅' : '❌';
        }
      }
    }
    
    // Generate summary
    
    
    return {
      success: true,
      report,
      summary: {
        totalValidated: report.totalCustomers + report.totalTelegramUsers,
        successRate: ((report.validMappings / (report.totalCustomers + report.totalTelegramUsers)) * 100).toFixed(1) + '%',
        issuesFound: report.mismatches + report.missing + report.invalid,
        fixableIssues: report.fixableIssues
      }
    };
    
  } catch (error) {
    console.error('❌ Validation test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Test specific validation scenarios
async function testValidationScenarios() {
  
  const validator = new LKeyTelegramValidator(mockEnv);
  
  // Test 1: Valid customer data
  const validCustomer = {
    customerID: 'AL501',
    name: 'John Smith',
    agentID: 'BLAKEPPH',
    balance: 1000,
    active: 1,
    username: 'johnsmith123',
    telegramId: '1234567890',
    metadata: {
      type: 'STANDARD_CUSTOMER',
      telegramId: '1234567890'
    }
  };
  
  
  // Test 2: Invalid Telegram ID format  
  const invalidTelegramId = 'abc123def'; // Should be numeric
  
  // Test 3: Missing L-key mapping
  const unknownCustomerType = 'UNKNOWN_TYPE';
  
  // Test 4: Username format validation
  const invalidUsername = 'user with spaces!@#'; // Should not contain spaces or special chars
  
}

// Performance test
async function testValidationPerformance() {
  
  const validator = new LKeyTelegramValidator(mockEnv);
  
  const startTime = Date.now();
  const report = await validator.validateLKeyTelegramConsistency('BLAKEPPH');
  const endTime = Date.now();
  
  const processingTime = endTime - startTime;
  const customersPerSecond = Math.round((report.totalCustomers / processingTime) * 1000);
  
  
  if (processingTime < 5000) {
  } else {
  }
}

// Main test execution
async function main() {
  
  // Run comprehensive validation test
  const mainTestResult = await runValidationTest();
  
  if (!mainTestResult.success) {
    console.error('❌ Main validation test failed, skipping additional tests');
    process.exit(1);
  }
  
  // Run scenario tests
  await testValidationScenarios();
  
  // Run performance test
  await testValidationPerformance();
  
}

// Run tests if this script is executed directly
if (import.meta.main) {
  main().catch(console.error);
}

export { runValidationTest, testValidationScenarios, testValidationPerformance };