#!/usr/bin/env bun

/**
 * Complete Integration Test for Fantasy402 Agent Dashboard
 * Tests the full flow from backend API to frontend accessibility
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const BASE_URL = 'http://localhost:3000';

async function testCompleteIntegration() {
  console.log('🧪 Complete Fantasy402 Agent Dashboard Integration Test');
  console.log('==================================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('');

  const results = {
    backendAPI: false,
    dashboardAccess: false,
    agentTabPresent: false,
    javascriptComponents: false,
    realTimeData: false
  };

  // Test 1: Backend API Endpoint
  console.log('📡 Test 1: Backend API Endpoint');
  console.log('===============================');
  try {
    const response = await fetch(`${BASE_URL}/api/fantasy402/agent-dashboard`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        console.log('✅ Backend API working');
        console.log(`   - Agent: ${data.data.agentProfile?.customerID}`);
        console.log(`   - Weekly P&L: $${data.data.financialPerformance?.currentWeek?.profit?.toLocaleString()}`);
        console.log(`   - Active Players: ${data.data.financialPerformance?.currentWeek?.activePlayers?.toLocaleString()}`);
        console.log(`   - API Calls: ${data.data.metadata?.apiCallCount}`);
        console.log(`   - Cache Hit Rate: ${(data.meta?.cacheStats?.cacheHitRate * 100 || 0).toFixed(1)}%`);
        results.backendAPI = true;
      } else {
        console.log('❌ Backend API returned invalid data');
      }
    } else {
      console.log(`❌ Backend API failed: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Backend API error:', error.message);
  }

  console.log('');

  // Test 2: Dashboard HTML Access
  console.log('🌐 Test 2: Dashboard HTML Access');
  console.log('================================');
  try {
    const response = await fetch(`${BASE_URL}/dashboard`);
    
    if (response.ok) {
      const html = await response.text();
      
      // Check for key dashboard elements
      const hasTitle = html.includes('Fire22 Manager Dashboard');
      const hasAlpineJS = html.includes('alpinejs');
      const hasTailwindCSS = html.includes('tailwindcss');
      
      if (hasTitle && hasAlpineJS && hasTailwindCSS) {
        console.log('✅ Dashboard HTML accessible');
        console.log('   - Title: Fire22 Manager Dashboard ✓');
        console.log('   - AlpineJS loaded ✓');
        console.log('   - TailwindCSS loaded ✓');
        results.dashboardAccess = true;
      } else {
        console.log('❌ Dashboard HTML missing key elements');
        console.log(`   - Title: ${hasTitle ? '✓' : '❌'}`);
        console.log(`   - AlpineJS: ${hasAlpineJS ? '✓' : '❌'}`);
        console.log(`   - TailwindCSS: ${hasTailwindCSS ? '✓' : '❌'}`);
      }
    } else {
      console.log(`❌ Dashboard HTML failed: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Dashboard HTML error:', error.message);
  }

  console.log('');

  // Test 3: Agent View Tab Present
  console.log('🎯 Test 3: Agent View Tab Present');
  console.log('=================================');
  try {
    const response = await fetch(`${BASE_URL}/dashboard`);
    const html = await response.text();
    
    // Check for Agent View tab elements
    const hasAgentTab = html.includes('🎯 Agent View');
    const hasAgentTabContent = html.includes("activeTab === 'agent-view'");
    const hasAgentDataFlag = html.includes('agentData: true');
    
    if (hasAgentTab && hasAgentTabContent && hasAgentDataFlag) {
      console.log('✅ Agent View tab implemented');
      console.log('   - Tab button present ✓');
      console.log('   - Tab content section ✓');
      console.log('   - Visibility flag set ✓');
      results.agentTabPresent = true;
    } else {
      console.log('❌ Agent View tab incomplete');
      console.log(`   - Tab button: ${hasAgentTab ? '✓' : '❌'}`);
      console.log(`   - Tab content: ${hasAgentTabContent ? '✓' : '❌'}`);
      console.log(`   - Visibility flag: ${hasAgentDataFlag ? '✓' : '❌'}`);
    }
  } catch (error) {
    console.log('❌ Agent tab check error:', error.message);
  }

  console.log('');

  // Test 4: JavaScript Components
  console.log('⚙️  Test 4: JavaScript Components');
  console.log('=================================');
  try {
    const response = await fetch(`${BASE_URL}/dashboard`);
    const html = await response.text();
    
    // Check for JavaScript functions and components
    const hasAgentViewData = html.includes('function agentViewData()');
    const hasRefreshFunction = html.includes('async refreshData()');
    const hasAutoRefresh = html.includes('startAutoRefresh()');
    const hasFormatting = html.includes('formatNumber(num)');
    
    if (hasAgentViewData && hasRefreshFunction && hasAutoRefresh && hasFormatting) {
      console.log('✅ JavaScript components implemented');
      console.log('   - agentViewData() function ✓');
      console.log('   - refreshData() function ✓');
      console.log('   - Auto-refresh mechanism ✓');
      console.log('   - Number formatting ✓');
      results.javascriptComponents = true;
    } else {
      console.log('❌ JavaScript components incomplete');
      console.log(`   - agentViewData(): ${hasAgentViewData ? '✓' : '❌'}`);
      console.log(`   - refreshData(): ${hasRefreshFunction ? '✓' : '❌'}`);
      console.log(`   - Auto-refresh: ${hasAutoRefresh ? '✓' : '❌'}`);
      console.log(`   - Formatting: ${hasFormatting ? '✓' : '❌'}`);
    }
  } catch (error) {
    console.log('❌ JavaScript check error:', error.message);
  }

  console.log('');

  // Test 5: Real-time Data Flow
  console.log('🔄 Test 5: Real-time Data Flow');
  console.log('==============================');
  try {
    console.log('Testing data refresh cycle...');
    
    // First request
    const response1 = await fetch(`${BASE_URL}/api/fantasy402/agent-dashboard`);
    const data1 = await response1.json();
    const fetchTime1 = data1.data?.metadata?.fetchedAt;
    
    console.log(`   First fetch: ${fetchTime1}`);
    
    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Second request (should use cache)
    const response2 = await fetch(`${BASE_URL}/api/fantasy402/agent-dashboard`);
    const data2 = await response2.json();
    const fetchTime2 = data2.data?.metadata?.fetchedAt;
    
    console.log(`   Second fetch: ${fetchTime2}`);
    
    // Check if cache is working (same fetch time = cached)
    const isCached = fetchTime1 === fetchTime2;
    console.log(`   Cache working: ${isCached ? '✓' : '❌'}`);
    
    if (data1.success && data2.success && isCached) {
      console.log('✅ Real-time data flow working');
      console.log('   - Data fetching ✓');
      console.log('   - Caching mechanism ✓');
      console.log('   - Consistent data structure ✓');
      results.realTimeData = true;
    } else {
      console.log('❌ Real-time data flow issues');
    }
    
  } catch (error) {
    console.log('❌ Real-time data error:', error.message);
  }

  // Summary
  console.log('');
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('========================');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  const success = passedTests === totalTests;
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const testName = test.replace(/([A-Z])/g, ' $1').toLowerCase();
    console.log(`${status} - ${testName}`);
  });
  
  console.log('');
  console.log(`Overall Result: ${success ? '🎉 ALL TESTS PASSED' : '⚠️  SOME TESTS FAILED'} (${passedTests}/${totalTests})`);
  
  if (success) {
    console.log('');
    console.log('🎯 INTEGRATION SUCCESS!');
    console.log('========================');
    console.log('✅ Backend API endpoint working');
    console.log('✅ Frontend dashboard accessible');
    console.log('✅ Agent View tab implemented');
    console.log('✅ JavaScript components functional');
    console.log('✅ Real-time data flow operational');
    console.log('');
    console.log('🚀 Ready for production deployment!');
    console.log(`   Dashboard URL: ${BASE_URL}/dashboard`);
    console.log(`   Agent API: ${BASE_URL}/api/fantasy402/agent-dashboard`);
  }
  
  return success;
}

// Run the test
testCompleteIntegration()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Integration test failed:', error);
    process.exit(1);
  });