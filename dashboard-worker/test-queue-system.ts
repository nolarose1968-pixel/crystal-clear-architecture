#!/usr/bin/env bun

/**
 * Queue System Validation Test
 * Tests the P2P withdrawal/deposit queue system
 */

import { WithdrawalQueueSystem } from './src/queue-system.ts';

async function testQueueSystem() {
  console.log('🔄 Fire22 Queue System Validation Test\n');

  // Mock environment for testing
  const mockEnv = {
    DB: {
      prepare: (sql: string) => ({
        bind: (...params: any[]) => ({
          all: async () => ({ results: [] }),
          first: async () => null,
          run: async () => ({ success: true })
        }),
        exec: async () => ({ success: true })
      })
    }
  };

  const queueSystem = new WithdrawalQueueSystem(mockEnv as any);

  // Test 1: Queue initialization
  console.log('📋 Test 1: Queue System Initialization');
  console.log('Queue System:', queueSystem.constructor.name);
  console.log('Available Methods:', Object.getOwnPropertyNames(WithdrawalQueueSystem.prototype).filter(name => name !== 'constructor'));
  console.log('');

  // Test 2: Add withdrawal to queue
  console.log('💸 Test 2: Adding Withdrawal to Queue');
  try {
    const withdrawalId = await queueSystem.addToQueue({
      type: 'withdrawal',
      customerId: 'customer_001',
      amount: 1000,
      paymentType: 'bank_transfer',
      paymentDetails: 'Bank Account: 1234567890',
      priority: 2,
      notes: 'Test withdrawal'
    });
    console.log('Withdrawal added:', withdrawalId);
  } catch (error) {
    console.log('Withdrawal add error:', error.message);
  }
  console.log('');

  // Test 3: Add deposit to queue
  console.log('💰 Test 3: Adding Deposit to Queue');
  try {
    const depositId = await queueSystem.addDepositToQueue({
      customerId: 'customer_002',
      amount: 1000,
      paymentType: 'bank_transfer',
      paymentDetails: 'Bank Account: 0987654321',
      priority: 1,
      notes: 'Test deposit'
    });
    console.log('Deposit added:', depositId);
  } catch (error) {
    console.log('Deposit add error:', error.message);
  }
  console.log('');

  // Test 4: Queue statistics
  console.log('📊 Test 4: Queue Statistics');
  try {
    const stats = queueSystem.getQueueStats();
    console.log('Queue Stats:', stats);
  } catch (error) {
    console.log('Stats error:', error.message);
  }
  console.log('');

  // Test 5: Matching opportunities
  console.log('🎯 Test 5: Matching Opportunities');
  try {
    const opportunities = await queueSystem.findMatchingOpportunities();
    console.log('Matching opportunities:', opportunities.length);
    opportunities.slice(0, 3).forEach((opp, index) => {
      console.log(`  ${index + 1}. Withdrawal: ${opp.withdrawalId} (${opp.withdrawalAmount}) ↔ Deposit: ${opp.depositId} (${opp.depositAmount}) - Score: ${opp.matchScore}`);
    });
  } catch (error) {
    console.log('Matching error:', error.message);
  }
  console.log('');

  // Test 6: Queue item retrieval
  console.log('📦 Test 6: Queue Item Retrieval');
  try {
    const items = queueSystem.getQueueItems();
    console.log('Total queue items:', items.length);
    const byType = items.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('Items by type:', byType);
  } catch (error) {
    console.log('Item retrieval error:', error.message);
  }
  console.log('');

  console.log('✅ Queue System Validation Complete!');
}

// Run the test
if (import.meta.main) {
  testQueueSystem().catch(console.error);
}
