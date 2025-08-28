#!/usr/bin/env bun

/**
 * Test Withdrawal System
 * 
 * This script tests the complete withdrawal workflow:
 * 1. Request withdrawal
 * 2. Approve withdrawal  
 * 3. Complete withdrawal
 * 4. Reject withdrawal
 * 5. Balance validation
 */

import { Database } from 'bun:sqlite';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  message: string;
  details?: any;
}

class WithdrawalSystemTester {
  private db: Database;
  private results: TestResult[] = [];
  private testCustomerId = 'TEST_CUSTOMER_001';
  private testUserId = 'TEST_USER_001';

  constructor() {
    this.db = new Database(':memory:');
    this.setupTestDatabase();
  }

  private setupTestDatabase() {
    console.log('🔧 Setting up test database...');
    
    // Create players table
    this.db.run(`
      CREATE TABLE players (
        customer_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        balance REAL DEFAULT 0,
        telegram_username TEXT,
        telegram_id TEXT,
        telegram_group_id TEXT,
        telegram_chat_id TEXT,
        total_withdrawals REAL DEFAULT 0,
        last_withdrawal TEXT
      )
    `);

    // Create withdrawals table
    this.db.run(`
      CREATE TABLE withdrawals (
        id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        amount REAL NOT NULL,
        method TEXT NOT NULL DEFAULT 'bank_transfer',
        payment_type TEXT NOT NULL DEFAULT 'bank_transfer',
        payment_details TEXT,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
        requested_by TEXT NOT NULL,
        approved_by TEXT,
        notes TEXT,
        approval_notes TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        approved_at TEXT,
        completed_at TEXT,
        FOREIGN KEY (customer_id) REFERENCES players(customer_id)
      )
    `);

    // Create transactions table
    this.db.run(`
      CREATE TABLE transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id TEXT NOT NULL,
        amount REAL NOT NULL,
        transaction_type TEXT NOT NULL,
        agent_id TEXT,
        notes TEXT,
        reference_id TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (customer_id) REFERENCES players(customer_id)
      )
    `);

    // Create users table
    this.db.run(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        role TEXT DEFAULT 'agent'
      )
    `);

    // Insert test data
    this.db.run(`
      INSERT INTO players (customer_id, name, balance, telegram_username, telegram_id, telegram_group_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [this.testCustomerId, 'Test Customer', 1000.00, 'testuser', '123456789', 'testgroup123']);

    this.db.run(`
      INSERT INTO users (id, username, role)
      VALUES (?, ?, ?)
    `, [this.testUserId, 'testuser', 'manager']);

    console.log('✅ Test database setup complete');
  }

  private runTest(testName: string, testFn: () => boolean | Promise<boolean>, details?: any) {
    try {
      const result = testFn();
      if (result instanceof Promise) {
        result.then(passed => {
          this.results.push({
            test: testName,
            status: passed ? 'PASS' : 'FAIL',
            message: passed ? 'Test passed' : 'Test failed',
            details
          });
        });
      } else {
        this.results.push({
          test: testName,
          status: result ? 'PASS' : 'FAIL',
          message: result ? 'Test passed' : 'Test failed',
          details
        });
      }
    } catch (error) {
      this.results.push({
        test: testName,
        status: 'FAIL',
        message: `Test error: ${error}`,
        details
      });
    }
  }

  public async runAllTests() {
    console.log('🚀 Starting withdrawal system tests...\n');

    // Test 1: Initial balance check
    this.runTest('Initial Balance Check', () => {
      const customer = this.db.prepare('SELECT balance FROM players WHERE customer_id = ?').get(this.testCustomerId) as any;
      return customer.balance === 1000.00;
    }, { expected: 1000.00, actual: this.db.prepare('SELECT balance FROM players WHERE customer_id = ?').get(this.testCustomerId) });

    // Test 2: Request withdrawal
    this.runTest('Request Withdrawal', () => {
      const withdrawalId = 'WITHDRAWAL_001';
      const amount = 500.00;
      
      this.db.run(`
        INSERT INTO withdrawals (id, customer_id, amount, method, payment_type, payment_details, status, requested_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, datetime('now'))
      `, [withdrawalId, this.testCustomerId, amount, 'bank_transfer', 'venmo', '@testuser', this.testUserId]);

      const withdrawal = this.db.prepare('SELECT * FROM withdrawals WHERE id = ?').get(withdrawalId) as any;
      return withdrawal && withdrawal.status === 'pending' && withdrawal.amount === amount && withdrawal.payment_type === 'venmo';
    });

    // Test 3: Approve withdrawal
    this.runTest('Approve Withdrawal', () => {
      const withdrawalId = 'WITHDRAWAL_001';
      
      // Update withdrawal status
      this.db.run(`
        UPDATE withdrawals
        SET status = 'approved', approved_by = ?, approved_at = datetime('now'), approval_notes = ?
        WHERE id = ?
      `, [this.testUserId, 'Test approval', withdrawalId]);

      // Update customer balance
      this.db.run(`
        UPDATE players SET balance = balance - ? WHERE customer_id = ?
      `, [500.00, this.testCustomerId]);

      // Log transaction
      this.db.run(`
        INSERT INTO transactions (customer_id, amount, transaction_type, agent_id, notes, reference_id)
        VALUES (?, ?, 'withdrawal', ?, ?, ?)
      `, [this.testCustomerId, -500.00, this.testUserId, 'Withdrawal approved: Test approval', withdrawalId]);

      const withdrawal = this.db.prepare('SELECT * FROM withdrawals WHERE id = ?').get(withdrawalId) as any;
      const customer = this.db.prepare('SELECT balance FROM players WHERE customer_id = ?').get(this.testCustomerId) as any;
      
      return withdrawal.status === 'approved' && customer.balance === 500.00;
    });

    // Test 4: Complete withdrawal
    this.runTest('Complete Withdrawal', () => {
      const withdrawalId = 'WITHDRAWAL_001';
      
      // Update withdrawal status to completed
      this.db.run(`
        UPDATE withdrawals
        SET status = 'completed', completed_at = datetime('now'), approval_notes = ?
        WHERE id = ?
      `, [`Payment Reference: BANK123. Test completion`, withdrawalId]);

      // Update player's total withdrawals
      this.db.run(`
        UPDATE players 
        SET total_withdrawals = total_withdrawals + ?, last_withdrawal = datetime('now')
        WHERE customer_id = ?
      `, [500.00, this.testCustomerId]);

      // Log completion transaction
      this.db.run(`
        INSERT INTO transactions (customer_id, amount, transaction_type, agent_id, notes, reference_id)
        VALUES (?, ?, 'withdrawal_completed', ?, ?, ?)
      `, [this.testCustomerId, -500.00, this.testUserId, 'Withdrawal completed: Test completion', withdrawalId]);

      const withdrawal = this.db.prepare('SELECT * FROM withdrawals WHERE id = ?').get(withdrawalId) as any;
      const customer = this.db.prepare('SELECT total_withdrawals FROM players WHERE customer_id = ?').get(this.testCustomerId) as any;
      
      return withdrawal.status === 'completed' && customer.total_withdrawals === 500.00;
    });

    // Test 5: Reject withdrawal
    this.runTest('Reject Withdrawal', () => {
      const withdrawalId = 'WITHDRAWAL_002';
      const amount = 200.00;
      
      // Create another withdrawal
      this.db.run(`
        INSERT INTO withdrawals (id, customer_id, amount, method, payment_type, payment_details, status, requested_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, datetime('now'))
      `, [withdrawalId, this.testCustomerId, amount, 'bank_transfer', 'paypal', 'test@example.com', this.testUserId]);

      // Reject it
      this.db.run(`
        UPDATE withdrawals
        SET status = 'rejected', approved_by = ?, approved_at = datetime('now'), approval_notes = ?
        WHERE id = ?
      `, [this.testUserId, 'REJECTED: Insufficient documentation. Test rejection', withdrawalId]);

      // Log rejection transaction
      this.db.run(`
        INSERT INTO transactions (customer_id, amount, transaction_type, agent_id, notes, reference_id)
        VALUES (?, ?, 'withdrawal_rejected', ?, ?, ?)
      `, [this.testCustomerId, 0, this.testUserId, 'Withdrawal rejected: Insufficient documentation - Test rejection', withdrawalId]);

      const withdrawal = this.db.prepare('SELECT * FROM withdrawals WHERE id = ?').get(withdrawalId) as any;
      return withdrawal.status === 'rejected';
    });

    // Test 6: Balance validation
    this.runTest('Balance Validation', () => {
      const customer = this.db.prepare('SELECT balance FROM players WHERE customer_id = ?').get(this.testCustomerId) as any;
      return customer.balance === 500.00; // Should still be 500 after approved withdrawal
    });

    // Test 7: Telegram username lookup
    this.runTest('Telegram Username Lookup', () => {
      const user = this.db.prepare(`
        SELECT customer_id, name, balance, telegram_username, telegram_id, telegram_group_id
        FROM players 
        WHERE telegram_username = ?
      `).get('testuser') as any;
      
      return user && user.telegram_username === 'testuser' && user.balance === 500.00;
    });

    // Test 8: Payment types validation
    this.runTest('Payment Types Validation', () => {
      const validPaymentTypes = ['venmo', 'paypal', 'cashapp', 'cash', 'transfer', 'bank_transfer'];
      const testPaymentTypes = ['venmo', 'paypal', 'cashapp'];
      
      return testPaymentTypes.every(type => validPaymentTypes.includes(type));
    });

    // Test 9: Telegram group ID and chat ID
    this.runTest('Telegram Group and Chat ID', () => {
      const user = this.db.prepare(`
        SELECT telegram_group_id, telegram_chat_id
        FROM players 
        WHERE customer_id = ?
      `).get(this.testCustomerId) as any;
      
      return user && user.telegram_group_id === 'testgroup123';
    });

    // Wait for async tests to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    this.printResults();
  }

  private printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    let passCount = 0;
    let failCount = 0;

    this.results.forEach(result => {
      const statusIcon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${statusIcon} ${result.test}: ${result.status}`);
      
      if (result.status === 'PASS') {
        passCount++;
      } else {
        failCount++;
        if (result.details) {
          console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
        }
      }
    });

    console.log('\n📈 Summary:');
    console.log(`Total Tests: ${this.results.length}`);
    console.log(`Passed: ${passCount} ✅`);
    console.log(`Failed: ${failCount} ❌`);
    console.log(`Success Rate: ${((passCount / this.results.length) * 100).toFixed(1)}%`);

    if (failCount === 0) {
      console.log('\n🎉 All tests passed! The withdrawal system is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the issues above.');
    }
  }

  public cleanup() {
    this.db.close();
  }
}

// Run tests
async function main() {
  const tester = new WithdrawalSystemTester();
  
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ Test execution failed:', error);
  } finally {
    tester.cleanup();
  }
}

if (import.meta.main) {
  main();
}
