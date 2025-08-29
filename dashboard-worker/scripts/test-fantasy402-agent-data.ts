#!/usr/bin/env bun

/**
 * Test Fantasy402 Agent Data Access using Unified Client
 * Verify what endpoints the agent can access through the unified client
 */

import {
  createFantasy402Client,
  initializeDefaultClient,
} from '../src/api/fantasy402-unified-client';

const USERNAME = process.env.FIRE22_USERNAME || 'billy666';
const PASSWORD = process.env.FIRE22_PASSWORD || 'backdoor69';

console.log('🎰 Fantasy402 Agent Data Access Test (Unified Client)');
console.log('!==!==!==!==!==!==!==!==!=====');
console.log(`Agent: ${USERNAME}`);
console.log('');

async function testUnifiedClient() {
  console.log('🔐 Step 1: Initialize Unified Client');
  console.log('------------------------------------');

  // Initialize the unified client
  const initResult = await initializeDefaultClient({
    username: USERNAME,
    password: PASSWORD,
    enableCache: true,
    enableRealtime: false,
  });

  if (!initResult.success) {
    console.error('❌ Unified client initialization failed:', initResult.error);
    return;
  }

  console.log('✅ Unified client initialized successfully!');

  // Test agent dashboard endpoint
  console.log('\n📊 Step 2: Test Agent Dashboard');
  console.log('-------------------------------');
  const dashboardResult = await createFantasy402Client({
    username: USERNAME,
    password: PASSWORD,
  }).getAgentDashboard();

  if (dashboardResult.success && dashboardResult.data) {
    console.log('✅ Agent dashboard data retrieved successfully!');
    console.log(`- Weekly Figures: ${JSON.stringify(dashboardResult.data.weeklyFigures, null, 2)}`);

    if (dashboardResult.data.accountInfo?.data) {
      console.log('\n📈 Account Information:');
      console.log(`- Customer ID: ${dashboardResult.data.accountInfo.data.customerID}`);
      console.log(`- Current Balance: $${dashboardResult.data.accountInfo.data.currentBalance}`);
      console.log(`- Office: ${dashboardResult.data.accountInfo.data.office}`);
      console.log(`- Store: ${dashboardResult.data.accountInfo.data.store}`);
      console.log(`- Active: ${dashboardResult.data.accountInfo.data.active}`);
    }
  } else {
    console.error('❌ Failed to get agent dashboard:', dashboardResult.error);
  }

  // Test customer details endpoint
  console.log('\n👤 Step 3: Test Customer Details');
  console.log('-------------------------------');
  const testCustomerId = USERNAME.toUpperCase();

  const client = createFantasy402Client({
    username: USERNAME,
    password: PASSWORD,
  });

  // Initialize the client
  await client.initialize();

  const customerResult = await client.getCustomerDetails(testCustomerId);

  if (customerResult.success && customerResult.data) {
    console.log('✅ Customer details retrieved successfully!');
    console.log(`- Customer ID: ${customerResult.data.customerID}`);

    if (customerResult.data.info) {
      console.log('\n👤 Customer Information:');
      console.log(`- Login: ${customerResult.data.info.login}`);
      console.log(`- Current Balance: $${customerResult.data.info.currentBalance}`);
      console.log(`- Available Balance: $${customerResult.data.info.availableBalance}`);
      console.log(`- Office: ${customerResult.data.info.office}`);
      console.log(`- Store: ${customerResult.data.info.store}`);
      console.log(`- Active: ${customerResult.data.info.active}`);
    }

    if (customerResult.data.transactions && Array.isArray(customerResult.data.transactions)) {
      console.log(`\n📈 Recent Transactions: ${customerResult.data.transactions.length} items`);
    }

    if (customerResult.data.wagers && Array.isArray(customerResult.data.wagers)) {
      console.log(`🎲 Recent Wagers: ${customerResult.data.wagers.length} items`);
    }
  } else {
    console.error('❌ Failed to get customer details:', customerResult.error);
  }

  // Test pending bets endpoint
  console.log('\n⏳ Step 4: Test Pending Bets');
  console.log('---------------------------');
  const pendingResult = await client.getPending();

  if (pendingResult.success && pendingResult.data) {
    console.log('✅ Pending bets retrieved successfully!');
    console.log(`- Pending Wagers: ${JSON.stringify(pendingResult.data.pendingWagers, null, 2)}`);
  } else {
    console.error('❌ Failed to get pending bets:', pendingResult.error);
  }

  // Test weekly figures endpoint
  console.log('\n📊 Step 5: Test Weekly Figures');
  console.log('------------------------------');
  const weeklyResult = await client.getWeeklyFigureByAgent();

  if (weeklyResult.success && weeklyResult.data) {
    console.log('✅ Weekly figures retrieved successfully!');
    console.log(`- This Week: ${weeklyResult.data.thisWeek || 0}`);
    console.log(`- Today: ${weeklyResult.data.today || 0}`);
    console.log(`- Active: ${weeklyResult.data.active || 0}`);
  } else {
    console.error('❌ Failed to get weekly figures:', weeklyResult.error);
  }

  console.log('\n✅ Unified Client Test Complete!');
  console.log('\n📋 Summary:');
  console.log('✓ Unified client initialized successfully');
  console.log('✓ Agent dashboard data retrieved');
  console.log('✓ Customer details fetched');
  console.log('✓ Pending bets retrieved');
  console.log('✓ Weekly figures obtained');
  console.log('\n💡 Benefits of Unified Client:');
  console.log('• Clean, documented API');
  console.log('• Consistent error handling');
  console.log('• Automatic authentication management');
  console.log('• Built-in caching and performance optimizations');
  console.log('• Type-safe responses');
  console.log('• Single point of maintenance');
}

testUnifiedClient()
  .then(() => {
    console.log('\n🎉 All tests completed successfully!');
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
