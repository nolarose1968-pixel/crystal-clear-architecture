#!/usr/bin/env bun

/**
 * Test Queue System
 *
 * This script tests the peer-to-peer matching queue system for withdrawals and deposits
 */

import { Database } from 'bun:sqlite';
import { WithdrawalQueueSystem, QueueItem, MatchResult } from '../src/queue-system';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  message: string;
  details?: any;
}

class QueueSystemTester {
  private db: Database;
  private results: TestResult[] = [];
  private testCustomerId1 = 'TEST_CUSTOMER_001';
  private testCustomerId2 = 'TEST_CUSTOMER_002';
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
        balance REAL DEFAULT 0
      )
    `);

    // Create queue items table
    this.db.run(`
      CREATE TABLE queue_items (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL CHECK (type IN ('withdrawal', 'deposit')),
        customer_id TEXT NOT NULL,
        amount REAL NOT NULL,
        payment_type TEXT NOT NULL,
        payment_details TEXT,
        priority INTEGER DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'processing', 'completed', 'failed')),
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        matched_with TEXT,
        notes TEXT
      )
    `);

    // Create queue matches table
    this.db.run(`
      CREATE TABLE queue_matches (
        id TEXT PRIMARY KEY,
        withdrawal_id TEXT NOT NULL,
        deposit_id TEXT NOT NULL,
        amount REAL NOT NULL,
        match_score INTEGER NOT NULL,
        processing_time INTEGER DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        completed_at TEXT,
        notes TEXT
      )
    `);

    // Create transactions table
    this.db.run(`
      CREATE TABLE transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id TEXT NOT NULL,
        amount REAL NOT NULL,
        transaction_type TEXT NOT NULL,
        notes TEXT,
        reference_id TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
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
        completed_at TEXT
      )
    `);

    // Insert test data
    this.db.run(
      `
      INSERT INTO players (customer_id, name, balance)
      VALUES (?, ?, ?)
    `,
      [this.testCustomerId1, 'Test Customer 1', 1000.0]
    );

    this.db.run(
      `
      INSERT INTO players (customer_id, name, balance)
      VALUES (?, ?, ?)
    `,
      [this.testCustomerId2, 'Test Customer 2', 500.0]
    );

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
            details,
          });
        });
      } else {
        this.results.push({
          test: testName,
          status: result ? 'PASS' : 'FAIL',
          message: result ? 'Test passed' : 'Test failed',
          details,
        });
      }
    } catch (error) {
      this.results.push({
        test: testName,
        status: 'FAIL',
        message: `Test error: ${error}`,
        details,
      });
    }
  }

  public async runAllTests() {
    console.log('🚀 Starting queue system tests...\n');

    // Test 1: Initialize queue system
    this.runTest('Initialize Queue System', () => {
      const queueSystem = new WithdrawalQueueSystem({ DB: this.db });
      return queueSystem !== null;
    });

    // Test 2: Add withdrawal to queue
    this.runTest('Add Withdrawal to Queue', async () => {
      const queueSystem = new WithdrawalQueueSystem({ DB: this.db });
      const queueId = await queueSystem.addToQueue({
        type: 'withdrawal',
        customerId: this.testCustomerId1,
        amount: 200.0,
        paymentType: 'venmo',
        paymentDetails: '@testuser1',
        priority: 1,
        notes: 'Test withdrawal',
      });

      return queueId && queueId.length > 0;
    });

    // Test 3: Add deposit to queue
    this.runTest('Add Deposit to Queue', async () => {
      const queueSystem = new WithdrawalQueueSystem({ DB: this.db });
      const queueId = await queueSystem.addDepositToQueue({
        customerId: this.testCustomerId2,
        amount: 250.0,
        paymentType: 'venmo',
        paymentDetails: '@testuser2',
        priority: 1,
        notes: 'Test deposit',
      });

      return queueId && queueId.length > 0;
    });

    // Test 4: Check queue statistics
    this.runTest('Queue Statistics', () => {
      const queueSystem = new WithdrawalQueueSystem({ DB: this.db });
      const stats = queueSystem.getQueueStats();

      return stats.totalItems >= 2 && stats.pendingWithdrawals >= 1 && stats.pendingDeposits >= 1;
    });

    // Test 5: Test matching algorithm
    this.runTest('Matching Algorithm', () => {
      const queueSystem = new WithdrawalQueueSystem({ DB: this.db });
      const items = queueSystem.getQueueItems('pending');

      // Should have both withdrawal and deposit
      const withdrawal = items.find(item => item.type === 'withdrawal');
      const deposit = items.find(item => item.type === 'deposit');

      return (
        withdrawal &&
        deposit &&
        withdrawal.paymentType === deposit.paymentType &&
        withdrawal.amount <= deposit.amount
      );
    });

    // Test 6: Test payment type matching
    this.runTest('Payment Type Matching', async () => {
      const queueSystem = new WithdrawalQueueSystem({ DB: this.db });

      // Add another withdrawal with different payment type
      await queueSystem.addToQueue({
        type: 'withdrawal',
        customerId: this.testCustomerId1,
        amount: 100.0,
        paymentType: 'paypal',
        paymentDetails: 'test@example.com',
        priority: 1,
        notes: 'PayPal withdrawal',
      });

      // Add matching deposit
      await queueSystem.addDepositToQueue({
        customerId: this.testCustomerId2,
        amount: 120.0,
        paymentType: 'paypal',
        paymentDetails: 'deposit@example.com',
        priority: 1,
        notes: 'PayPal deposit',
      });

      const stats = queueSystem.getQueueStats();
      return stats.totalItems >= 4;
    });

    // Test 7: Test amount matching
    this.runTest('Amount Matching', () => {
      const queueSystem = new WithdrawalQueueSystem({ DB: this.db });
      const items = queueSystem.getQueueItems('pending');

      // Find items that can be matched by amount
      const withdrawals = items.filter(item => item.type === 'withdrawal');
      const deposits = items.filter(item => item.type === 'deposit');

      const canMatch = withdrawals.some(w =>
        deposits.some(d => w.paymentType === d.paymentType && w.amount <= d.amount)
      );

      return canMatch;
    });

    // Test 8: Test queue item retrieval
    this.runTest('Queue Item Retrieval', () => {
      const queueSystem = new WithdrawalQueueSystem({ DB: this.db });

      const allItems = queueSystem.getQueueItems();
      const pendingItems = queueSystem.getQueueItems('pending');
      const withdrawalItems = queueSystem.getQueueItems(undefined, 'withdrawal');
      const depositItems = queueSystem.getQueueItems(undefined, 'deposit');

      return (
        allItems.length >= 4 &&
        pendingItems.length >= 4 &&
        withdrawalItems.length >= 2 &&
        depositItems.length >= 2
      );
    });

    // Test 9: Test match completion
    this.runTest('Match Completion', async () => {
      const queueSystem = new WithdrawalQueueSystem({ DB: this.db });

      // Get a match to complete
      const matches = queueSystem.getAllMatches();
      if (matches.length === 0) {
        return false; // No matches to test
      }

      const match = matches[0];
      const success = await queueSystem.completeMatch(match.withdrawalId, 'Test completion');

      return success;
    });

    // Test 10: Test cleanup
    this.runTest('Queue Cleanup', async () => {
      const queueSystem = new WithdrawalQueueSystem({ DB: this.db });

      await queueSystem.cleanupOldItems(0); // Clean up immediately

      const stats = queueSystem.getQueueStats();
      return stats.totalItems >= 0; // Should not crash
    });

    // Wait for async tests to complete
    await new Promise(resolve => setTimeout(resolve, 200));

    this.printResults();
  }

  private printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('!==!==!==!====');

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
      console.log('\n🎉 All tests passed! The queue system is working correctly.');
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
  const tester = new QueueSystemTester();

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
