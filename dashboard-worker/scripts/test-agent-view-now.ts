#!/usr/bin/env bun

/**
 * Quick test to verify Agent View is working now
 */

async function testAgentViewNow() {
  console.log('🎯 Testing Agent View After Fix');
  console.log('===============================');
  
  const BASE_URL = 'http://localhost:3000';
  
  // Check if the x-init fix is present
  console.log('1. Checking x-init fix...');
  try {
    const response = await fetch(`${BASE_URL}/dashboard`);
    const html = await response.text();
    
    const hasXInit = html.includes('x-init="init()"');
    const hasXData = html.includes('x-data="agentViewData()"');
    const hasInitFunction = html.includes('async init()');
    
    console.log(`   ✅ x-init directive: ${hasXInit ? 'Present' : 'Missing'}`);
    console.log(`   ✅ x-data directive: ${hasXData ? 'Present' : 'Missing'}`);
    console.log(`   ✅ init() function: ${hasInitFunction ? 'Present' : 'Missing'}`);
    
    if (hasXInit && hasXData && hasInitFunction) {
      console.log('   🎉 All Alpine.js directives properly configured!');
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Test API one more time
  console.log('\n2. Testing Live Data...');
  try {
    const response = await fetch(`${BASE_URL}/api/fantasy402/agent-dashboard`);
    const data = await response.json();
    
    if (data.success) {
      console.log('   ✅ Live Fantasy402 data available:');
      console.log(`      Agent: ${data.data.agentProfile?.customerID}`);
      console.log(`      Weekly P&L: $${data.data.financialPerformance?.currentWeek?.profit?.toLocaleString()}`);
      console.log(`      Today P&L: $${data.data.financialPerformance?.currentWeek?.todayProfit?.toLocaleString()}`);
      console.log(`      Active Players: ${data.data.financialPerformance?.currentWeek?.activePlayers?.toLocaleString()}`);
      console.log(`      Account Balance: $${data.data.financialPerformance?.accountSummary?.balance?.toLocaleString()}`);
      console.log(`      Office: ${data.data.agentProfile?.office}`);
      console.log(`      Token Status: ${data.data.operationalStatus?.tokenStatus}`);
    }
  } catch (error) {
    console.log(`   ❌ API Error: ${error.message}`);
  }
  
  console.log('\n✨ Next Steps:');
  console.log('=============');
  console.log('1. Open browser to: http://localhost:3000/dashboard');
  console.log('2. Click the "🎯 Agent View" tab');
  console.log('3. You should now see:');
  console.log('   • Loading spinner first');
  console.log('   • Then real Fantasy402 data');
  console.log('   • Auto-refresh every 30 seconds');
  console.log('   • All KPI cards with live numbers');
  console.log('');
  console.log('If still not working:');
  console.log('• Hard refresh (Ctrl+Shift+R)');
  console.log('• Check browser console (F12)');
  console.log('• Clear cache and try again');
}

testAgentViewNow().catch(console.error);