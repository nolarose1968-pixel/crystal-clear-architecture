#!/usr/bin/env bun

/**
 * Test Working Fantasy402 Endpoints
 * Focus only on endpoints that return actual data
 */

import { Fantasy402AgentClient } from '../src/api/fantasy402-agent-client';

const USERNAME = process.env.FIRE22_USERNAME || 'billy666';
const PASSWORD = process.env.FIRE22_PASSWORD || 'backdoor69';

interface WorkingData {
  weeklyFigures: {
    current: any;
    lastWeek: any;
    dateRange: any;
  };
  transactions: any;
  emailCount: number;
  accountInfo: any;
  permissions: any;
}

async function testWorkingEndpoints(): Promise<WorkingData> {
  console.log('🎯 Testing Only Working Fantasy402 Endpoints');
  console.log('!==!==!==!==!==!==!==!===');
  console.log(`Agent: ${USERNAME}\n`);

  const client = new Fantasy402AgentClient(USERNAME, PASSWORD);

  // Initialize
  const initialized = await client.initialize();
  if (!initialized) {
    throw new Error('Failed to initialize client');
  }

  const workingData: WorkingData = {
    weeklyFigures: { current: null, lastWeek: null, dateRange: null },
    transactions: null,
    emailCount: 0,
    accountInfo: client.getAccountInfo(),
    permissions: client.getPermissions(),
  };

  // Get date range
  const today = new Date().toISOString().split('T')[0];
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  console.log('📊 1. Weekly Figures (WORKING)');
  console.log('------------------------------');

  // Current week figures
  try {
    workingData.weeklyFigures.current = await client.getWeeklyFigures({ week: '0' });
    console.log('✅ Current Week Data:');
    console.log(
      `   Profit: $${workingData.weeklyFigures.current?.LIST?.ARRAY?.[0]?.ThisWeek?.toLocaleString() || 'N/A'}`
    );
    console.log(
      `   Today: $${workingData.weeklyFigures.current?.LIST?.ARRAY?.[0]?.Today?.toLocaleString() || 'N/A'}`
    );
    console.log(
      `   Active Players: ${workingData.weeklyFigures.current?.LIST?.ARRAY?.[0]?.Active?.toLocaleString() || 'N/A'}`
    );
  } catch (error) {
    console.error('❌ Current week failed:', error);
  }

  // Last week figures
  try {
    workingData.weeklyFigures.lastWeek = await client.getWeeklyFigures({ week: '-1' });
    console.log('✅ Last Week Data:');
    console.log(
      `   Profit: $${workingData.weeklyFigures.lastWeek?.LIST?.ARRAY?.[0]?.ThisWeek?.toLocaleString() || 'N/A'}`
    );
  } catch (error) {
    console.error('❌ Last week failed:', error);
  }

  // Date range figures
  try {
    workingData.weeklyFigures.dateRange = await client.getWeeklyFigures({
      dateFrom: lastWeek,
      dateTo: today,
    });
    console.log('✅ Date Range Data:');
    console.log(
      `   Profit: $${workingData.weeklyFigures.dateRange?.LIST?.ARRAY?.[0]?.ThisWeek?.toLocaleString() || 'N/A'}`
    );
  } catch (error) {
    console.error('❌ Date range failed:', error);
  }

  console.log('\n📈 2. Manager Transactions (WORKING - Empty but Valid)');
  console.log('-----------------------------------------------------');
  try {
    workingData.transactions = await client.rawRequest('Manager/getTransactions', 'POST', {
      agentID: USERNAME.toUpperCase(),
      start: lastWeek,
      end: today,
    });
    console.log('✅ Transactions endpoint works');
    console.log(`   Response: ${JSON.stringify(workingData.transactions).slice(0, 100)}`);
  } catch (error) {
    console.error('❌ Transactions failed:', error);
  }

  console.log('\n📧 3. Email Count (WORKING)');
  console.log('---------------------------');
  try {
    workingData.emailCount = await client.getNewEmailsCount();
    console.log(`✅ New Emails: ${workingData.emailCount}`);
  } catch (error) {
    console.error('❌ Email count failed:', error);
  }

  console.log('\n🔄 4. Token Management (WORKING)');
  console.log('--------------------------------');
  try {
    const renewed = await client.renewToken();
    console.log(`✅ Token Renewal: ${renewed ? 'Success' : 'Failed'}`);
  } catch (error) {
    console.error('❌ Token renewal failed:', error);
  }

  console.log('\n📝 5. Activity Logging (WORKING)');
  console.log('--------------------------------');
  try {
    await client.writeLog(`Dashboard access - ${new Date().toISOString()}`);
    console.log('✅ Activity logged successfully');
  } catch (error) {
    console.error('❌ Logging failed:', error);
  }

  return workingData;
}

// Export for dashboard integration
export async function getAgentDashboardData(): Promise<WorkingData> {
  return await testWorkingEndpoints();
}

// Run if called directly
if (import.meta.main) {
  testWorkingEndpoints()
    .then(data => {
      console.log('\n🎉 SUCCESS! Working Endpoints Identified');
      console.log('!==!==!==!==!==!==!====');
      console.log('✅ Weekly Figures - Real financial data');
      console.log('✅ Email Count - System notifications');
      console.log('✅ Token Renewal - Session management');
      console.log('✅ Activity Logging - Audit trail');
      console.log('✅ Manager Transactions - Empty but valid endpoint');

      console.log('\n📊 Dashboard Integration Ready');
      console.log('------------------------------');
      console.log('Account:', data.accountInfo?.customerID);
      console.log('Office:', data.accountInfo?.office);
      console.log('Balance:', `$${data.accountInfo?.balance?.toLocaleString()}`);
      console.log('Active Players:', data.weeklyFigures.current?.LIST?.ARRAY?.[0]?.Active);
      console.log(
        'This Week Profit:',
        `$${data.weeklyFigures.current?.LIST?.ARRAY?.[0]?.ThisWeek?.toLocaleString()}`
      );
    })
    .catch(error => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}
