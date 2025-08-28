#!/usr/bin/env bun

/**
 * Commission Engine Validation Test
 * Tests the business management system's commission calculation
 */

import { createBusinessManagementSystem } from './src/business-management.ts';

async function testCommissionEngine() {
  console.log('🔥 Fire22 Commission Engine Validation Test\n');

  const bms = createBusinessManagementSystem();

  // Test 1: Basic commission calculation
  console.log('📊 Test 1: Basic Commission Calculation');
  const commission1 = bms.calculateCommission(
    'agent_001',
    10000, // handle
    50000, // volume
    0.95,  // risk score
    100,   // compliance score
    { newCustomers: 15 }
  );

  console.log('Agent ID:', commission1.agentId);
  console.log('Handle:', commission1.handle);
  console.log('Commission:', commission1.commission.toFixed(2));
  console.log('Bonuses:', commission1.bonuses.toFixed(2));
  console.log('Total Payout:', commission1.totalPayout.toFixed(2));
  console.log('Status:', commission1.status);
  console.log('');

  // Test 2: VIP tier calculation
  console.log('👑 Test 2: VIP Tier Calculation');
  const testCases = [
    { balance: 500, volume: 1000, expected: 'Bronze VIP' },
    { balance: 5000, volume: 25000, expected: 'Silver VIP' },
    { balance: 15000, volume: 100000, expected: 'Gold VIP' },
    { balance: 50000, volume: 500000, expected: 'Platinum VIP' },
    { balance: 100, volume: 100, expected: 'None' }
  ];

  testCases.forEach(({ balance, volume, expected }) => {
    const tier = bms.getVIPTier(balance, volume);
    const actual = tier?.name || 'None';
    const status = actual === expected ? '✅' : '❌';
    console.log(`${status} Balance: ${balance}, Volume: ${volume} → ${actual} (expected: ${expected})`);
  });
  console.log('');

  // Test 3: System statistics
  console.log('📈 Test 3: System Statistics');
  const stats = bms.getSystemStats();
  console.log('VIP Tiers:', stats.vipTiers);
  console.log('Groups:', stats.groups);
  console.log('Total Group Members:', stats.totalGroupMembers);
  console.log('Affiliate Programs:', stats.affiliatePrograms);
  console.log('Commission Records:', stats.commissionRecords);
  console.log('Total Commissions:', stats.totalCommissions.toFixed(2));
  console.log('');

  // Test 4: Affiliate program validation
  console.log('🎯 Test 4: Affiliate Program Structure');
  const program = bms['affiliatePrograms'].get('fire22-affiliate');
  if (program) {
    console.log('Program Name:', program.name);
    console.log('Base Rate:', program.commissionStructure.baseRate);
    console.log('Volume Tiers:', program.commissionStructure.volumeTiers.length);
    console.log('Performance Bonuses:', program.commissionStructure.performanceBonuses.length);
    console.log('Payout Schedule:', program.payoutSchedule.frequency);
  }
  console.log('');

  // Test 5: Group management
  console.log('👥 Test 5: Group Management');
  const groups = bms.getUserGroups('nolarose');
  console.log('User groups for nolarose:', groups.length);
  groups.forEach(group => {
    console.log(`- ${group.name} (${group.type}) - ${group.members.length} members`);
  });
  console.log('');

  console.log('✅ Commission Engine Validation Complete!');
}

// Run the test
if (import.meta.main) {
  testCommissionEngine().catch(console.error);
}
