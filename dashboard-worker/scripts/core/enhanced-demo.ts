#!/usr/bin/env bun

/**
 * 🎯 Fire22 Enhanced Scripts Demo
 * 
 * Demonstrates all the enhanced features working together:
 * - Performance monitoring with ScriptRunner
 * - Enhanced error handling
 * - Configuration validation
 * - Comprehensive logging
 * 
 * @version 1.0.0
 * @author Fire22 Development Team
 */

import { runScript } from './script-runner';
import { handleError, createError } from './error-handler';
import { validateConfig, getCommonRules } from './config-validator';

// Demo configuration schema
const demoConfigSchema = {
  name: {
    type: 'string',
    required: true,
    min: 2,
    max: 50
  },
  port: {
    type: 'number',
    required: true,
    min: 1024,
    max: 65535
  },
  features: {
    type: 'array',
    required: true,
    min: 1
  },
  enabled: {
    type: 'boolean',
    required: true
  }
};

// Demo configuration
const demoConfig = {
  name: 'Fire22 Enhanced Demo',
  port: 3000,
  features: ['performance', 'error-handling', 'validation'],
  enabled: true
};

// Demo operations
async function performFastOperation(): Promise<string> {
  await Bun.sleep(100); // Simulate work
  return 'Fast operation completed';
}

async function performSlowOperation(): Promise<string> {
  await Bun.sleep(2000); // Simulate longer work
  return 'Slow operation completed';
}

async function performFailingOperation(): Promise<string> {
  await Bun.sleep(500); // Simulate work
  throw new Error('This operation is designed to fail for demo purposes');
}

async function performComplexOperation(): Promise<{ result: string; metadata: any }> {
  await Bun.sleep(300); // Simulate work
  return {
    result: 'Complex operation completed',
    metadata: {
      steps: 5,
      complexity: 'high',
      timestamp: new Date().toISOString()
    }
  };
}

async function performBatchOperation(): Promise<string[]> {
  const results: string[] = [];
  for (let i = 0; i < 3; i++) {
    await Bun.sleep(100);
    results.push(`Batch item ${i + 1} completed`);
  }
  return results;
}

async function performConditionalOperation(shouldSucceed: boolean): Promise<string> {
  await Bun.sleep(200);
  if (shouldSucceed) {
    return 'Conditional operation succeeded';
  } else {
    throw new Error('Conditional operation failed as expected');
  }
}

async function performDatabaseOperation(): Promise<{ customers: number; transactions: number; bets: number }> {
  await Bun.sleep(150); // Simulate database query time
  
  // Simulate database results
  return {
    customers: 2,
    transactions: 3,
    bets: 3
  };
}

async function performTransactionSimulation(): Promise<{ success: boolean; transactionId: string; amount: number }> {
  await Bun.sleep(250); // Simulate transaction processing
  
  // Simulate successful transaction
  return {
    success: true,
    transactionId: `TXN_${Date.now()}`,
    amount: 500.00
  };
}

async function performDataValidation(): Promise<{ valid: number; invalid: number; errors: string[] }> {
  await Bun.sleep(100); // Simulate validation time
  
  // Simulate data validation results
  return {
    valid: 8,
    invalid: 2,
    errors: [
      'Customer AL500: Invalid email format',
      'Transaction TXN002: Amount exceeds limit'
    ]
  };
}

async function main() {
  console.log('🚀 Fire22 Enhanced Scripts Demo');
  console.log('================================\n');

  try {
    // 1. Configuration Validation Demo
    console.log('✅ Step 1: Configuration Validation');
    console.log('-----------------------------------');
    
    const validation = validateConfig(demoConfig, demoConfigSchema);
    if (validation.isValid) {
      console.log('✅ Configuration is valid!');
      console.log(`   Name: ${demoConfig.name}`);
      console.log(`   Port: ${demoConfig.port}`);
      console.log(`   Features: ${demoConfig.features.join(', ')}`);
      console.log(`   Enabled: ${demoConfig.enabled}\n`);
    } else {
      console.log('❌ Configuration validation failed:');
      validation.errors.forEach(error => {
        console.log(`   • ${error.field}: ${error.message}`);
      });
      process.exit(1);
    }

    // 2. Performance Monitoring Demo
    console.log('📊 Step 2: Performance Monitoring');
    console.log('----------------------------------');
    
    const fastResult = await runScript('fast-operation', performFastOperation, {
      tags: ['demo', 'fast'],
      logLevel: 'info'
    });
    
    console.log(`✅ Fast operation result: ${fastResult.data}`);
    console.log(`   Duration: ${fastResult.performance.duration.toFixed(2)}ms`);
    console.log(`   Memory delta: ${(fastResult.performance.memoryDelta.heapUsed / 1024).toFixed(2)}KB\n`);

    const slowResult = await runScript('slow-operation', performSlowOperation, {
      tags: ['demo', 'slow'],
      logLevel: 'info'
    });
    
    console.log(`✅ Slow operation result: ${slowResult.data}`);
    console.log(`   Duration: ${slowResult.performance.duration.toFixed(2)}ms`);
    console.log(`   Memory delta: ${(slowResult.performance.memoryDelta.heapUsed / 1024).toFixed(2)}KB\n`);

    // 3. Error Handling Demo
    console.log('🛡️ Step 3: Error Handling Demo');
    console.log('--------------------------------');
    
    try {
      await runScript('failing-operation', performFailingOperation, {
        tags: ['demo', 'error'],
        logLevel: 'info'
      });
    } catch (error) {
      console.log('❌ Operation failed as expected');
      
      // Handle the error with enhanced error handler
      await handleError(error, {
        scriptName: 'enhanced-demo',
        operation: 'failing-operation',
        environment: 'demo'
      });
    }

    // 4. Custom Error Creation Demo
    console.log('\n🎭 Step 4: Custom Error Creation');
    console.log('----------------------------------');
    
    try {
      throw createError('This is a custom demo error', {
        scriptName: 'enhanced-demo',
        operation: 'custom-error-demo'
      }, {
        type: 'runtime',
        severity: 'medium',
        recoverable: true,
        suggestedActions: [
          'This is just a demo - no action needed',
          'Check the error context for debugging info'
        ]
      });
    } catch (error) {
      console.log('✅ Custom error created and handled');
      await handleError(error, {
        scriptName: 'enhanced-demo',
        operation: 'custom-error-demo'
      });
    }

    // 5. Validation Rules Demo
    console.log('\n🔍 Step 5: Validation Rules Demo');
    console.log('----------------------------------');
    
    const rules = getCommonRules();
    const emailValidation = validateConfig({ email: 'test@example.com' }, {
      email: {
        type: 'string',
        required: true,
        custom: rules.validEmail.validator
      }
    });
    
    if (emailValidation.isValid) {
      console.log('✅ Email validation passed');
    } else {
      console.log('❌ Email validation failed');
    }

    // 6. Advanced Operations Demo
    console.log('\n🚀 Step 6: Advanced Operations Demo');
    console.log('------------------------------------');
    
    // Complex operation with metadata
    const complexResult = await runScript('complex-operation', performComplexOperation, {
      tags: ['demo', 'complex', 'metadata'],
      logLevel: 'info',
      timeout: 5000
    });
    
    if (complexResult.data) {
      console.log(`✅ Complex operation result: ${complexResult.data.result}`);
      console.log(`   Metadata: ${JSON.stringify(complexResult.data.metadata)}`);
    }
    console.log(`   Duration: ${complexResult.performance.duration.toFixed(2)}ms\n`);

    // Batch operations
    const batchResult = await runScript('batch-operation', performBatchOperation, {
      tags: ['demo', 'batch', 'parallel'],
      logLevel: 'info'
    });
    
    if (batchResult.data) {
      console.log(`✅ Batch operation completed: ${batchResult.data.length} items`);
      batchResult.data.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item}`);
      });
    }
    console.log(`   Total duration: ${batchResult.performance.duration.toFixed(2)}ms\n`);

    // Conditional operations
    const successResult = await runScript('conditional-success', () => performConditionalOperation(true), {
      tags: ['demo', 'conditional', 'success'],
      logLevel: 'info'
    });
    
    console.log(`✅ Conditional success: ${successResult.data}`);
    console.log(`   Duration: ${successResult.performance.duration.toFixed(2)}ms\n`);

    try {
      await runScript('conditional-failure', () => performConditionalOperation(false), {
        tags: ['demo', 'conditional', 'failure'],
        logLevel: 'info'
      });
    } catch (error) {
      console.log('❌ Conditional failure handled as expected');
      await handleError(error, {
        scriptName: 'enhanced-demo',
        operation: 'conditional-failure',
        environment: 'demo'
      });
    }

    // 7. Advanced Validation Demo
    console.log('\n🔍 Step 7: Advanced Validation Demo');
    console.log('------------------------------------');
    
    // Complex configuration validation
    const complexConfig = {
      userName: 'John Doe',
      userEmail: 'john@example.com',
      userAge: 30,
      userPreferences: ['dark-mode', 'notifications'],
      systemVersion: '2.1.0'
    };

    const complexSchema = {
      userName: {
        type: 'string',
        required: true,
        min: 2,
        max: 50
      },
      userEmail: {
        type: 'string',
        required: true,
        custom: (value: string) => value.includes('@') && value.includes('.')
      },
      userAge: {
        type: 'number',
        required: true,
        min: 18,
        max: 120
      },
      userPreferences: {
        type: 'array',
        required: true,
        min: 1
      },
      systemVersion: {
        type: 'string',
        required: true,
        pattern: /^\d+\.\d+\.\d+$/
      }
    };

    const complexValidation = validateConfig(complexConfig, complexSchema);
    if (complexValidation.isValid) {
      console.log('✅ Complex configuration validation passed');
      console.log(`   User: ${complexConfig.userName} (${complexConfig.userEmail})`);
      console.log(`   System: v${complexConfig.systemVersion}`);
    } else {
      console.log('❌ Complex configuration validation failed:');
      complexValidation.errors.forEach(error => {
        console.log(`   • ${error.field}: ${error.message}`);
      });
    }

    // 8. Database Operations Demo
    console.log('\n🗄️ Step 8: Database Operations Demo');
    console.log('------------------------------------');
    
    // Database query simulation
    const dbResult = await runScript('database-query', performDatabaseOperation, {
      tags: ['demo', 'database', 'query'],
      logLevel: 'info',
      timeout: 10000
    });
    
    if (dbResult.data) {
      console.log(`✅ Database query completed successfully`);
      console.log(`   Customers: ${dbResult.data.customers}`);
      console.log(`   Transactions: ${dbResult.data.transactions}`);
      console.log(`   Bets: ${dbResult.data.bets}`);
      console.log(`   Duration: ${dbResult.performance.duration.toFixed(2)}ms\n`);
    }

    // Transaction simulation
    const transactionResult = await runScript('transaction-sim', performTransactionSimulation, {
      tags: ['demo', 'database', 'transaction'],
      logLevel: 'info'
    });
    
    if (transactionResult.data) {
      console.log(`✅ Transaction processed successfully`);
      console.log(`   Transaction ID: ${transactionResult.data.transactionId}`);
      console.log(`   Amount: $${transactionResult.data.amount.toFixed(2)}`);
      console.log(`   Duration: ${transactionResult.performance.duration.toFixed(2)}ms\n`);
    }

    // Data validation simulation
    const validationResult = await runScript('data-validation', performDataValidation, {
      tags: ['demo', 'database', 'validation'],
      logLevel: 'info'
    });
    
    if (validationResult.data) {
      console.log(`✅ Data validation completed`);
      console.log(`   Valid records: ${validationResult.data.valid}`);
      console.log(`   Invalid records: ${validationResult.data.invalid}`);
      if (validationResult.data.errors.length > 0) {
        console.log(`   Errors found:`);
        validationResult.data.errors.forEach(error => {
          console.log(`     • ${error}`);
        });
      }
      console.log(`   Duration: ${validationResult.performance.duration.toFixed(2)}ms\n`);
    }

    // 9. Performance Report
    console.log('\n📈 Step 9: Performance Summary');
    console.log('-------------------------------');
    
    const runner = (await import('./script-runner')).default.getInstance();
    const report = runner.generatePerformanceReport();
    console.log(report);

    console.log('\n🎉 Demo completed successfully!');
    console.log('Your enhanced scripts are working perfectly! 🚀');

  } catch (error) {
    console.error('\n💥 Demo failed with unexpected error:');
    console.error(error);
    
    await handleError(error, {
      scriptName: 'enhanced-demo',
      operation: 'main',
      environment: 'demo'
    });
    
    process.exit(1);
  }
}

// CLI interface
if (import.meta.main) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🚀 Fire22 Enhanced Scripts Demo

Usage: bun run enhanced-demo.ts [options]

Options:
  --help, -h     Show this help message
  --fast         Run only fast operations
  --slow         Run only slow operations
  --validate     Run only validation demo
  --errors       Run only error handling demo

Examples:
  bun run enhanced-demo.ts                    # Run full demo
  bun run enhanced-demo.ts --fast            # Run fast operations only
  bun run enhanced-demo.ts --validate        # Run validation demo only

This demo showcases:
✅ Performance monitoring with ScriptRunner
🛡️ Enhanced error handling and recovery
✅ Configuration validation with schemas
📊 Comprehensive logging and metrics
🎭 Custom error creation and handling
🔍 Built-in validation rules
🚀 Advanced operations (complex, batch, conditional)
🔍 Complex configuration validation
🗄️ Database operations and transactions
📊 Data validation and integrity checks
📈 Performance reporting and analytics
    `);
    process.exit(0);
  }

  // Run the demo
  main().catch(async (error) => {
    await handleError(error, {
      scriptName: 'enhanced-demo',
      operation: 'cli-main',
      environment: 'demo'
    });
    process.exit(1);
  });
}

export { 
  main, 
  demoConfig, 
  demoConfigSchema, 
  performFastOperation, 
  performSlowOperation, 
  performFailingOperation,
  performComplexOperation,
  performBatchOperation,
  performConditionalOperation,
  performDatabaseOperation,
  performTransactionSimulation,
  performDataValidation
};

