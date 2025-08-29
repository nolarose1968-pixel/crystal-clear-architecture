#!/usr/bin/env bun

/**
 * Test the new Fantasy402 Agent Dashboard Endpoint
 * Verifies that the backend API returns proper data structure
 */

const DASHBOARD_URL = 'http://localhost:3000/api/fantasy402/agent-dashboard';

async function testDashboardEndpoint() {
  console.log('🧪 Testing Fantasy402 Agent Dashboard Endpoint');
  console.log('!==!==!==!==!==!==!==!==!==');
  console.log(`URL: ${DASHBOARD_URL}`);
  console.log('');

  try {
    console.log('📡 Making request to dashboard endpoint...');

    const response = await fetch(DASHBOARD_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Dashboard-Test-Client/1.0',
      },
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Request failed');
      console.error('Response:', errorText);
      return;
    }

    const data = await response.json();

    if (data.success) {
      console.log('✅ Request successful!');
      console.log('');

      // Display key data points
      const agentData = data.data;

      console.log('🎯 AGENT PROFILE');
      console.log('!==!==!==');
      console.log(`Customer ID: ${agentData.agentProfile?.customerID || 'N/A'}`);
      console.log(`Agent ID: ${agentData.agentProfile?.agentID || 'N/A'}`);
      console.log(`Office: ${agentData.agentProfile?.office || 'N/A'}`);
      console.log(`Store: ${agentData.agentProfile?.store || 'N/A'}`);
      console.log(`Active: ${agentData.agentProfile?.active ? 'Yes' : 'No'}`);

      console.log('\n💰 FINANCIAL PERFORMANCE');
      console.log('!==!==!==!====');
      console.log(
        `This Week Profit: $${agentData.financialPerformance?.currentWeek?.profit?.toLocaleString() || 'N/A'}`
      );
      console.log(
        `Today Profit: $${agentData.financialPerformance?.currentWeek?.todayProfit?.toLocaleString() || 'N/A'}`
      );
      console.log(
        `Active Players: ${agentData.financialPerformance?.currentWeek?.activePlayers?.toLocaleString() || 'N/A'}`
      );
      console.log(
        `Last Week Profit: $${agentData.financialPerformance?.lastWeek?.profit?.toLocaleString() || 'N/A'}`
      );
      console.log(
        `Account Balance: $${agentData.financialPerformance?.accountSummary?.balance?.toLocaleString() || 'N/A'}`
      );
      console.log(
        `Available Balance: $${agentData.financialPerformance?.accountSummary?.availableBalance?.toLocaleString() || 'N/A'}`
      );

      console.log('\n🔧 OPERATIONAL STATUS');
      console.log('!==!==!==!==');
      console.log(`New Emails: ${agentData.operationalStatus?.newEmailsCount || 0}`);
      console.log(`Token Status: ${agentData.operationalStatus?.tokenStatus || 'Unknown'}`);
      console.log(`Last Activity: ${agentData.operationalStatus?.lastActivityTimestamp || 'N/A'}`);

      console.log('\n🔐 PERMISSIONS');
      console.log('!==!=====');
      console.log(`View Reports: ${agentData.permissions?.canViewReports ? 'Yes' : 'No'}`);
      console.log(`Access Billing: ${agentData.permissions?.canAccessBilling ? 'Yes' : 'No'}`);
      console.log(`Manage Lines: ${agentData.permissions?.canManageLines ? 'Yes' : 'No'}`);
      console.log(`Add Accounts: ${agentData.permissions?.canAddAccounts ? 'Yes' : 'No'}`);
      console.log(`Office Account: ${agentData.permissions?.isOfficeAccount ? 'Yes' : 'No'}`);

      console.log('\n📊 METADATA');
      console.log('!==!===');
      console.log(`Fetched At: ${agentData.metadata?.fetchedAt || 'N/A'}`);
      console.log(`API Calls Made: ${agentData.metadata?.apiCallCount || 0}`);
      console.log(`Cache Expiry: ${new Date(agentData.metadata?.cacheExpiry || 0).toISOString()}`);

      if (agentData.errors && agentData.errors.length > 0) {
        console.log('\n⚠️  ERRORS');
        console.log('!==!==');
        agentData.errors.forEach((error: any, index: number) => {
          console.log(`${index + 1}. ${error.endpoint}: ${error.error}`);
        });
      }

      console.log('\n📈 CACHE STATS');
      console.log('!==!=====');
      const cacheStats = data.meta?.cacheStats;
      if (cacheStats) {
        console.log(`Total Entries: ${cacheStats.totalEntries}`);
        console.log(`Active Entries: ${cacheStats.activeEntries}`);
        console.log(`Expired Entries: ${cacheStats.expiredEntries}`);
        console.log(`Cache Hit Rate: ${(cacheStats.cacheHitRate * 100).toFixed(1)}%`);
      }
    } else {
      console.error('❌ Request failed:', data.error);
      if (data.details) {
        console.error('Details:', data.details);
      }
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test cache clearing endpoint
async function testCacheClear() {
  console.log('\n🧹 Testing Cache Clear Endpoint');
  console.log('!==!==!==!==!==!==');

  try {
    const response = await fetch('http://localhost:3000/api/fantasy402/clear-cache', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: 'billy666' }),
    });

    const data = await response.json();
    console.log(`Cache clear result: ${data.success ? 'Success' : 'Failed'}`);
    console.log(`Message: ${data.message || data.error}`);
  } catch (error) {
    console.error('❌ Cache clear test failed:', error);
  }
}

// Run tests
async function runAllTests() {
  await testDashboardEndpoint();
  console.log('\n' + '='.repeat(50));
  await testCacheClear();

  console.log('\n🎉 Dashboard endpoint testing complete!');
  console.log('\n💡 Next Steps:');
  console.log('1. Verify real Fantasy402 data is being returned');
  console.log('2. Check that caching is working (run test twice)');
  console.log('3. Integration with frontend dashboard UI');
}

runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
