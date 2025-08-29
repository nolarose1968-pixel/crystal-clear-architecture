#!/usr/bin/env bun

/**
 * 🗄️ Fire22 Real Database Demo
 *
 * Demonstrates real PostgreSQL integration with the Fire22 system:
 * - Actual database connections and queries
 * - Real transaction handling with ACID compliance
 * - Live data operations and validation
 * - Performance monitoring of real database operations
 * - Error handling and recovery in production scenarios
 *
 * @version 1.0.0
 * @author Fire22 Development Team
 */

import { runScript } from './script-runner';
import { handleError, createError } from './error-handler';
import { createDatabaseConnector, DatabaseConfig } from './database-connector';

// Database configuration (you can override with environment variables)
const defaultDbConfig: DatabaseConfig = {
  host: Bun.env.DB_HOST || 'localhost',
  port: parseInt(Bun.env.DB_PORT || '5432'),
  database: Bun.env.DB_NAME || 'fire22',
  user: Bun.env.DB_USER || 'postgres',
  password: Bun.env.DB_PASSWORD || 'password',
  ssl: Bun.env.DB_SSL === 'true',
  maxConnections: parseInt(Bun.env.DB_MAX_CONNECTIONS || '20'),
};

// Demo operations with real database
async function performRealDatabaseQuery(
  connector: any
): Promise<{ customers: number; transactions: number; bets: number }> {
  return await runScript(
    'real-database-query',
    async () => {
      try {
        const stats = await connector.getDatabaseStats();
        return stats;
      } catch (error) {
        throw createError(
          'Failed to get database statistics',
          {
            scriptName: 'real-database-demo',
            operation: 'database-query',
          },
          {
            type: 'database',
            severity: 'medium',
            recoverable: true,
            originalError: error,
          }
        );
      }
    },
    {
      tags: ['demo', 'database', 'real-query'],
      timeout: 30000,
    }
  );
}

async function performRealTransaction(
  connector: any
): Promise<{ success: boolean; transactionId: string; amount: number }> {
  return await runScript(
    'real-database-transaction',
    async () => {
      try {
        // Begin transaction
        const transactionId = await connector.beginTransaction();

        // Insert a new customer
        const customerResult = await connector.executeInTransaction(
          transactionId,
          'INSERT INTO customers (customer_id, username, first_name, last_name, login) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          ['DEMO001', 'demo_user', 'Demo', 'User', 'DEMO001']
        );

        if (!customerResult.success) {
          await connector.rollbackTransaction(transactionId);
          throw new Error('Failed to insert customer');
        }

        const customerId = customerResult.data[0].id;

        // Insert a transaction for the customer
        const transactionResult = await connector.executeInTransaction(
          transactionId,
          'INSERT INTO transactions (customer_id, amount, agent_id, tran_code, tran_type, document_number, short_desc) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, amount',
          [customerId, 1000.0, 'BLAKEPPH', 'C', 'E', `DEMO_TXN_${Date.now()}`, 'Demo deposit']
        );

        if (!transactionResult.success) {
          await connector.rollbackTransaction(transactionId);
          throw new Error('Failed to insert transaction');
        }

        // Commit transaction
        await connector.commitTransaction(transactionId);

        return {
          success: true,
          transactionId,
          amount: transactionResult.data[0].amount,
        };
      } catch (error) {
        throw createError(
          'Transaction failed',
          {
            scriptName: 'real-database-demo',
            operation: 'real-transaction',
          },
          {
            type: 'transaction',
            severity: 'medium',
            recoverable: true,
            originalError: error,
          }
        );
      }
    },
    {
      tags: ['demo', 'database', 'real-transaction'],
      timeout: 60000,
    }
  );
}

async function performRealDataValidation(
  connector: any
): Promise<{ valid: number; invalid: number; errors: string[] }> {
  return await runScript(
    'real-data-validation',
    async () => {
      try {
        const errors: string[] = [];
        let validCount = 0;
        let invalidCount = 0;

        // Validate customer data
        const customersResult = await connector.query(`
        SELECT customer_id, username, first_name, last_name, login 
        FROM customers 
        ORDER BY id 
        LIMIT 10
      `);

        if (customersResult.success) {
          for (const customer of customersResult.data) {
            if (!customer.customer_id || customer.customer_id.length < 2) {
              errors.push(`Customer ${customer.id}: Invalid customer_id format`);
              invalidCount++;
            } else if (!customer.username || customer.username.length < 3) {
              errors.push(`Customer ${customer.id}: Username too short`);
              invalidCount++;
            } else {
              validCount++;
            }
          }
        }

        // Validate transaction data
        const transactionsResult = await connector.query(`
        SELECT id, customer_id, amount, tran_code, tran_type 
        FROM transactions 
        ORDER BY id 
        LIMIT 10
      `);

        if (transactionsResult.success) {
          for (const transaction of transactionsResult.data) {
            if (!transaction.customer_id) {
              errors.push(`Transaction ${transaction.id}: Missing customer_id`);
              invalidCount++;
            } else if (transaction.amount <= 0) {
              errors.push(`Transaction ${transaction.id}: Invalid amount ${transaction.amount}`);
              invalidCount++;
            } else if (!['C', 'W', 'T'].includes(transaction.tran_code)) {
              errors.push(
                `Transaction ${transaction.id}: Invalid transaction code ${transaction.tran_code}`
              );
              invalidCount++;
            } else {
              validCount++;
            }
          }
        }

        return {
          valid: validCount,
          invalid: invalidCount,
          errors,
        };
      } catch (error) {
        throw createError(
          'Data validation failed',
          {
            scriptName: 'real-database-demo',
            operation: 'real-data-validation',
          },
          {
            type: 'validation',
            severity: 'medium',
            recoverable: true,
            originalError: error,
          }
        );
      }
    },
    {
      tags: ['demo', 'database', 'real-validation'],
      timeout: 45000,
    }
  );
}

async function performRealCustomerOperations(
  connector: any
): Promise<{ created: number; updated: number; deleted: number }> {
  return await runScript(
    'real-customer-operations',
    async () => {
      try {
        let created = 0;
        let updated = 0;
        let deleted = 0;

        // Create a new customer
        const createResult = await connector.query(
          'INSERT INTO customers (customer_id, username, first_name, last_name, login) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [`DEMO_${Date.now()}`, 'demo_ops', 'Demo', 'Operations', `DEMO_${Date.now()}`]
        );

        if (createResult.success) {
          created++;
          const customerId = createResult.data[0].id;

          // Update the customer
          const updateResult = await connector.query(
            'UPDATE customers SET username = $1 WHERE id = $2 RETURNING id',
            [`updated_demo_${Date.now()}`, customerId]
          );

          if (updateResult.success) {
            updated++;
          }

          // Delete the customer (cleanup)
          const deleteResult = await connector.query(
            'DELETE FROM customers WHERE id = $1 RETURNING id',
            [customerId]
          );

          if (deleteResult.success) {
            deleted++;
          }
        }

        return { created, updated, deleted };
      } catch (error) {
        throw createError(
          'Customer operations failed',
          {
            scriptName: 'real-database-demo',
            operation: 'real-customer-operations',
          },
          {
            type: 'database',
            severity: 'medium',
            recoverable: true,
            originalError: error,
          }
        );
      }
    },
    {
      tags: ['demo', 'database', 'real-customer-ops'],
      timeout: 45000,
    }
  );
}

async function main() {
  console.log('🗄️ Fire22 Real Database Demo');
  console.log('!==!==!==!==!=====\n');

  let connector: any = null;

  try {
    // 1. Database Connection Demo
    console.log('🔌 Step 1: Database Connection');
    console.log('--------------------------------');

    console.log('📋 Database Configuration:');
    console.log(`   Host: ${defaultDbConfig.host}:${defaultDbConfig.port}`);
    console.log(`   Database: ${defaultDbConfig.database}`);
    console.log(`   User: ${defaultDbConfig.user}`);
    console.log(`   SSL: ${defaultDbConfig.ssl ? 'Enabled' : 'Disabled'}`);
    console.log(`   Max Connections: ${defaultDbConfig.maxConnections}\n`);

    connector = await createDatabaseConnector(defaultDbConfig);
    console.log('✅ Database connection established successfully!\n');

    // 2. Real Database Query Demo
    console.log('📊 Step 2: Real Database Queries');
    console.log('----------------------------------');

    const statsResult = await performRealDatabaseQuery(connector);
    console.log(`✅ Database statistics retrieved successfully`);
    console.log(`   Customers: ${statsResult.customers}`);
    console.log(`   Transactions: ${statsResult.transactions}`);
    console.log(`   Bets: ${statsResult.bets}\n`);

    // 3. Real Transaction Demo
    console.log('💳 Step 3: Real Database Transactions');
    console.log('--------------------------------------');

    const transactionResult = await performRealTransaction(connector);
    console.log(`✅ Transaction completed successfully`);
    console.log(`   Transaction ID: ${transactionResult.transactionId}`);
    console.log(`   Amount: $${transactionResult.amount.toFixed(2)}\n`);

    // 4. Real Data Validation Demo
    console.log('🔍 Step 4: Real Data Validation');
    console.log('---------------------------------');

    const validationResult = await performRealDataValidation(connector);
    console.log(`✅ Data validation completed`);
    console.log(`   Valid records: ${validationResult.valid}`);
    console.log(`   Invalid records: ${validationResult.invalid}`);
    if (validationResult.errors.length > 0) {
      console.log(`   Validation errors found:`);
      validationResult.errors.slice(0, 5).forEach(error => {
        console.log(`     • ${error}`);
      });
      if (validationResult.errors.length > 5) {
        console.log(`     ... and ${validationResult.errors.length - 5} more errors`);
      }
    }
    console.log();

    // 5. Real Customer Operations Demo
    console.log('👥 Step 5: Real Customer Operations');
    console.log('------------------------------------');

    const customerOpsResult = await performRealCustomerOperations(connector);
    console.log(`✅ Customer operations completed`);
    console.log(`   Created: ${customerOpsResult.created}`);
    console.log(`   Updated: ${customerOpsResult.updated}`);
    console.log(`   Deleted: ${customerOpsResult.deleted}\n`);

    // 6. Connection Status Report
    console.log('📈 Step 6: Connection Status Report');
    console.log('------------------------------------');

    const status = connector.getConnectionStatus();
    console.log(`✅ Connection Status:`);
    console.log(`   Connected: ${status.isConnected ? 'Yes' : 'No'}`);
    console.log(`   Active Transactions: ${status.activeTransactions}\n`);

    // 7. Performance Report
    console.log('📊 Step 7: Performance Summary');
    console.log('-------------------------------');

    const runner = (await import('./script-runner')).default.getInstance();
    const report = runner.generatePerformanceReport();
    console.log(report);

    console.log('\n🎉 Real Database Demo completed successfully!');
    console.log('Your Fire22 system is now connected to a real PostgreSQL database! 🗄️');
  } catch (error) {
    console.error('\n💥 Real Database Demo failed:');
    console.error(error);

    await handleError(error, {
      scriptName: 'real-database-demo',
      operation: 'main',
      environment: 'production',
    });

    process.exit(1);
  } finally {
    // Cleanup: Close database connections
    if (connector) {
      try {
        await connector.disconnect();
      } catch (error) {
        console.error('Warning: Failed to close database connections:', error);
      }
    }
  }
}

// CLI interface
if (import.meta.main) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🗄️ Fire22 Real Database Demo

Usage: bun run real-database-demo.ts [options]

Options:
  --help, -h     Show this help message
  --config       Show database configuration
  --status       Show connection status only

Environment Variables:
  DB_HOST        Database host (default: localhost)
  DB_PORT        Database port (default: 5432)
  DB_NAME        Database name (default: fire22)
  DB_USER        Database user (default: postgres)
  DB_PASSWORD    Database password (default: password)
  DB_SSL         Enable SSL (default: false)
  DB_MAX_CONNECTIONS Max connections (default: 20)

Examples:
  bun run real-database-demo.ts                    # Run full demo
  bun run real-database-demo.ts --config          # Show configuration
  bun run real-database-demo.ts --status          # Connection status only

This demo showcases:
🗄️ Real PostgreSQL database connections
💳 Actual transaction handling with ACID compliance
🔍 Live data validation and integrity checks
👥 Real customer data operations (CRUD)
📊 Performance monitoring of database operations
🛡️ Error handling and recovery in production
📈 Connection pooling and resource management
    `);
    process.exit(0);
  }

  if (args.includes('--config')) {
    console.log('📋 Database Configuration:');
    console.log(`   Host: ${defaultDbConfig.host}:${defaultDbConfig.port}`);
    console.log(`   Database: ${defaultDbConfig.database}`);
    console.log(`   User: ${defaultDbConfig.user}`);
    console.log(`   SSL: ${defaultDbConfig.ssl ? 'Enabled' : 'Disabled'}`);
    console.log(`   Max Connections: ${defaultDbConfig.maxConnections}`);
    process.exit(0);
  }

  // Run the demo
  main().catch(async error => {
    await handleError(error, {
      scriptName: 'real-database-demo',
      operation: 'cli-main',
      environment: 'production',
    });
    process.exit(1);
  });
}

export {
  main,
  performRealDatabaseQuery,
  performRealTransaction,
  performRealDataValidation,
  performRealCustomerOperations,
  defaultDbConfig,
};
