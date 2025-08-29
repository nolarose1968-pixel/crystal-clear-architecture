#!/usr/bin/env bun

/**
 * Test the Fantasy402 authentication implementation
 */

import { Fantasy402Auth } from '../src/api/fantasy402-auth';

// Load credentials from environment
const USERNAME = process.env.FIRE22_USERNAME || 'billy666';
const PASSWORD = process.env.FIRE22_PASSWORD || 'backdoor69';

console.log('🎰 Fantasy402 Authentication Test');
console.log('==================================');
console.log(`Username: ${USERNAME}`);
console.log('');

async function testAuth() {
  // Create auth client
  const auth = new Fantasy402Auth(USERNAME, PASSWORD);

  // Test 1: Login
  console.log('📡 Test 1: Login');
  console.log('-----------------');
  const loginResult = await auth.login();
  
  if (loginResult.success) {
    console.log('✅ Login successful!');
    console.log(`Session ID: ${loginResult.sessionId}`);
    console.log(`Bearer Token: ${loginResult.token || 'Not provided'}`);
    console.log(`Response Data:`, JSON.stringify(loginResult.data).slice(0, 500));
  } else {
    console.log('❌ Login failed:', loginResult.error);
    return;
  }

  // Test 2: Get Customer List
  console.log('\n📡 Test 2: Get Customer List');
  console.log('-----------------------------');
  try {
    const customers = await auth.getCustomerList();
    console.log('Customer List Response:', JSON.stringify(customers).slice(0, 500));
    
    if (Array.isArray(customers)) {
      console.log(`✅ Retrieved ${customers.length} customers`);
    } else if (customers && typeof customers === 'object') {
      console.log('Response type:', typeof customers);
      console.log('Response keys:', Object.keys(customers));
    }
  } catch (error) {
    console.error('❌ Failed to get customers:', error);
  }

  // Test 3: Get Weekly Figures
  console.log('\n📡 Test 3: Get Weekly Figures');
  console.log('------------------------------');
  try {
    const figures = await auth.getWeeklyFigures('0');
    console.log('Weekly Figures Response:', JSON.stringify(figures).slice(0, 500));
    
    if (figures && typeof figures === 'object') {
      console.log('Response type:', typeof figures);
      console.log('Response keys:', Object.keys(figures));
    }
  } catch (error) {
    console.error('❌ Failed to get weekly figures:', error);
  }

  // Test 4: Check session
  console.log('\n📡 Test 4: Session Status');
  console.log('-------------------------');
  const session = auth.getSession();
  if (session) {
    console.log('✅ Session active');
    console.log(`Customer ID: ${session.customerId}`);
    console.log(`PHP Session ID: ${session.phpSessionId}`);
    console.log(`Has Bearer Token: ${!!session.bearerToken}`);
    console.log(`Has CF Clearance: ${!!session.cfClearance}`);
    console.log(`Expires at: ${new Date(session.expiresAt || 0).toISOString()}`);
  } else {
    console.log('❌ No active session');
  }
}

testAuth().then(() => {
  console.log('\n✅ Test complete!');
  console.log('\n💡 Next steps:');
  console.log('1. If authentication works, integrate into the worker');
  console.log('2. Update dashboard endpoints to use real API calls');
  console.log('3. Handle session refresh/renewal');
}).catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});