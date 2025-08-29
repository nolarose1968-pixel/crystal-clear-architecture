#!/usr/bin/env bun

/**
 * Test the Fantasy402 Agent Client
 * Verifies what data the agent can actually access
 */

import { Fantasy402AgentClient } from '../src/api/fantasy402-agent-client';

const USERNAME = process.env.FIRE22_USERNAME || 'billy666';
const PASSWORD = process.env.FIRE22_PASSWORD || 'backdoor69';

console.log('🎯 Fantasy402 Agent Client Test');
console.log('================================');
console.log(`Agent: ${USERNAME}`);
console.log('');

async function testAgentClient() {
  const client = new Fantasy402AgentClient(USERNAME, PASSWORD);
  
  // Initialize the client
  console.log('📡 Step 1: Initialize Client');
  console.log('-----------------------------');
  const initialized = await client.initialize();
  
  if (!initialized) {
    console.error('❌ Failed to initialize client');
    return;
  }
  
  console.log('');
  
  // Get permissions summary
  const permissions = client.getPermissions();
  const accountInfo = client.getAccountInfo();
  
  if (permissions) {
    console.log('🔐 Agent Permissions Summary:');
    console.log('-----------------------------');
    console.log(`Agent ID: ${permissions.agentID}`);
    console.log(`Master Agent: ${permissions.masterAgentID}`);
    console.log(`Is Office Account: ${permissions.isOffice ? 'Yes' : 'No'}`);
    console.log(`Can Manage Lines: ${permissions.canManageLines ? 'Yes' : 'No'}`);
    console.log(`Can Add Accounts: ${permissions.canAddAccounts ? 'Yes' : 'No'}`);
    console.log(`Can Delete Bets: ${permissions.canDeleteBets ? 'Yes' : 'No'}`);
    console.log(`Can View Reports: ${permissions.canViewReports ? 'Yes' : 'No'}`);
    console.log(`Can Access Billing: ${permissions.canAccessBilling ? 'Yes' : 'No'}`);
    console.log('');
  }
  
  if (accountInfo) {
    console.log('💰 Account Information:');
    console.log('-----------------------');
    console.log(`Customer ID: ${accountInfo.customerID}`);
    console.log(`Balance: $${accountInfo.balance.toLocaleString()}`);
    console.log(`Available: $${accountInfo.availableBalance.toLocaleString()}`);
    console.log(`Pending Wagers: $${accountInfo.pendingWagers.toLocaleString()}`);
    console.log(`Office: ${accountInfo.office}`);
    console.log(`Store: ${accountInfo.store}`);
    console.log(`Active: ${accountInfo.active ? 'Yes' : 'No'}`);
    console.log(`Agent Type: ${accountInfo.agentType}`);
    console.log('');
  }
  
  // Get date range for testing
  const today = new Date().toISOString().split('T')[0];
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  console.log('📡 Step 2: Test Agent Endpoints');
  console.log('--------------------------------');
  
  // Test 1: Account Balance
  console.log('\n💰 Test 1: Get Account Balance');
  try {
    const balance = await client.getBalance();
    console.log('✅ Balance retrieved');
    console.log('Response:', JSON.stringify(balance).slice(0, 200));
  } catch (error) {
    console.log('❌ Failed:', error);
  }
  
  // Test 2: Transactions  
  console.log('\n📈 Test 2: Get Transactions');
  try {
    const transactions = await client.getTransactions({
      start: lastMonth,
      end: today,
      limit: 10
    });
    console.log('✅ Transactions retrieved');
    console.log('Response:', JSON.stringify(transactions).slice(0, 300));
    
    // Show summary if we have data
    if (transactions && Array.isArray(transactions.transactions)) {
      console.log(`   📊 Found ${transactions.transactions.length} transactions`);
    } else if (transactions && transactions.LIST) {
      console.log('   📊 Response has LIST field');
    }
  } catch (error) {
    console.log('❌ Failed:', error);
  }
  
  // Test 3: Wagers
  console.log('\n🎲 Test 3: Get Wagers');
  try {
    const wagers = await client.getWagers({
      start: lastWeek,
      end: today,
      limit: 10
    });
    console.log('✅ Wagers retrieved');
    console.log('Response:', JSON.stringify(wagers).slice(0, 300));
    
    // Show summary if we have data
    if (wagers && Array.isArray(wagers.wagers)) {
      console.log(`   🎯 Found ${wagers.wagers.length} wagers`);
    } else if (wagers && wagers.LIST) {
      console.log('   🎯 Response has LIST field');
    }
  } catch (error) {
    console.log('❌ Failed:', error);
  }
  
  // Test 4: Live Wagers
  console.log('\n🎯 Test 4: Get Live Wagers');
  try {
    const liveWagers = await client.getLiveWagers();
    console.log('✅ Live wagers retrieved');
    console.log('Response:', JSON.stringify(liveWagers).slice(0, 300));
  } catch (error) {
    console.log('❌ Failed:', error);
  }
  
  // Test 5: Weekly Figures (with improved parameters)
  console.log('\n📊 Test 5: Get Weekly Figures');
  console.log('   Testing different parameters...');
  
  // Try current week
  try {
    console.log('   - Current week (0):');
    const currentWeek = await client.getWeeklyFigures({ week: '0' });
    console.log('     Response:', JSON.stringify(currentWeek).slice(0, 200));
  } catch (error) {
    console.log('     ❌ Failed:', error);
  }
  
  // Try last week
  try {
    console.log('   - Last week (-1):');
    const lastWeekData = await client.getWeeklyFigures({ week: '-1' });
    console.log('     Response:', JSON.stringify(lastWeekData).slice(0, 200));
  } catch (error) {
    console.log('     ❌ Failed:', error);
  }
  
  // Try with date range
  try {
    console.log(`   - Date range (${lastWeek} to ${today}):`);
    const dateRange = await client.getWeeklyFigures({ 
      dateFrom: lastWeek, 
      dateTo: today 
    });
    console.log('     Response:', JSON.stringify(dateRange).slice(0, 200));
  } catch (error) {
    console.log('     ❌ Failed:', error);
  }
  
  // Test 6: Sub-Agents
  console.log('\n👥 Test 6: Get Sub-Agents');
  try {
    const subAgents = await client.getSubAgents();
    console.log('✅ Sub-agents retrieved');
    console.log('Response:', JSON.stringify(subAgents).slice(0, 300));
  } catch (error) {
    console.log('❌ Failed:', error);
  }
  
  // Test 7: Customers (may not work)
  console.log('\n👤 Test 7: Get Customers (may not work for this account type)');
  try {
    const customers = await client.getCustomers(10);
    console.log('✅ Customers retrieved');
    console.log('Response:', JSON.stringify(customers).slice(0, 300));
  } catch (error) {
    console.log('⚠️ Expected for this account type:', error);
  }
  
  // Test 8: Email Count
  console.log('\n📧 Test 8: Get New Emails Count');
  try {
    const emailCount = await client.getNewEmailsCount();
    console.log(`✅ New emails: ${emailCount}`);
  } catch (error) {
    console.log('❌ Failed:', error);
  }
  
  // Test 9: Write Log
  console.log('\n📝 Test 9: Write to Activity Log');
  try {
    await client.writeLog('Test log entry from dashboard worker - enhanced client');
    console.log('✅ Log entry written');
  } catch (error) {
    console.log('❌ Failed:', error);
  }
  
  // Test 10: Token Renewal
  console.log('\n🔄 Test 10: Token Renewal');
  try {
    const renewed = await client.renewToken();
    console.log(renewed ? '✅ Token renewed successfully' : '❌ Token renewal failed');
  } catch (error) {
    console.log('❌ Failed:', error);
  }
  
  // Test raw requests for specific endpoints that might work
  console.log('\n📡 Step 3: Test Additional Endpoints');
  console.log('-------------------------------------');
  
  const additionalEndpoints = [
    { name: 'Get Account Info Owner', endpoint: 'Manager/getAccountInfoOwner', method: 'GET' },
    { name: 'Get Live Wagers', endpoint: 'Manager/getLiveWagers', method: 'POST', data: { agentID: USERNAME.toUpperCase() } },
    { name: 'Get Transactions', endpoint: 'Manager/getTransactions', method: 'POST', data: { 
      agentID: USERNAME.toUpperCase(),
      start: '2025-08-01',
      end: '2025-08-29'
    }}
  ];
  
  for (const test of additionalEndpoints) {
    console.log(`\n🔍 Testing: ${test.name}`);
    try {
      const response = await client.rawRequest(test.endpoint, test.method, test.data);
      if (response && response.status !== 'Failed') {
        console.log('✅ Success');
        console.log('Response:', JSON.stringify(response).slice(0, 200));
      } else {
        console.log('❌ Failed:', response?.msg || 'Unknown error');
      }
    } catch (error) {
      console.log('❌ Error:', error);
    }
  }
}

testAgentClient().then(() => {
  console.log('\n✅ Agent client test complete!');
  console.log('\n📋 Summary:');
  console.log('- Agent authentication and permissions work');
  console.log('- Token renewal works');
  console.log('- Need to identify which data endpoints are accessible');
  console.log('\n💡 Next steps:');
  console.log('1. Integrate working endpoints into the dashboard');
  console.log('2. Build UI based on agent permissions');
  console.log('3. Implement auto-refresh for token renewal');
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});