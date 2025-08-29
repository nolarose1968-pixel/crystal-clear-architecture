#!/usr/bin/env bun

/**
 * Fire22 API Authentication Test Script
 * Tests the provided credentials against the Fire22 API
 */

// Bun automatically loads .env files

const FIRE22_API_URL = process.env.FIRE22_API_URL || 'https://fire22.ag/cloud/api';
const FIRE22_USERNAME = process.env.FIRE22_USERNAME;
const FIRE22_PASSWORD = process.env.FIRE22_PASSWORD;
const FIRE22_AGENT_ID = process.env.FIRE22_AGENT_ID;

console.log('🔥 Fire22 API Authentication Test');
console.log('==================================');
console.log(`API URL: ${FIRE22_API_URL}`);
console.log(`Username: ${FIRE22_USERNAME}`);
console.log(`Agent ID: ${FIRE22_AGENT_ID}`);
console.log('');

async function testFire22Auth() {
  if (!FIRE22_USERNAME || !FIRE22_PASSWORD) {
    console.error('❌ Missing FIRE22_USERNAME or FIRE22_PASSWORD in environment variables');
    process.exit(1);
  }

  try {
    // Test 1: Try Basic Authentication
    console.log('📡 Test 1: Testing Basic Authentication...');
    const basicAuth = Buffer.from(`${FIRE22_USERNAME}:${FIRE22_PASSWORD}`).toString('base64');
    
    const basicAuthResponse = await fetch(`${FIRE22_API_URL}/Manager/getCustomerList`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Fire22-Dashboard/3.0.9'
      },
      body: new URLSearchParams({
        agentID: FIRE22_AGENT_ID || FIRE22_USERNAME || '',
        sessionID: '',
        top: '10'
      })
    });

    console.log(`Response Status: ${basicAuthResponse.status}`);
    console.log(`Response Headers:`, Object.fromEntries(basicAuthResponse.headers.entries()));
    
    const responseText = await basicAuthResponse.text();
    console.log(`Response Length: ${responseText.length} bytes`);
    
    if (basicAuthResponse.ok) {
      console.log('✅ Basic Authentication successful!');
      
      // Try to parse response
      try {
        const data = JSON.parse(responseText);
        console.log('📊 Response Data:', JSON.stringify(data, null, 2).slice(0, 500));
      } catch {
        console.log('📄 Response (first 500 chars):', responseText.slice(0, 500));
      }
    } else {
      console.log('⚠️ Basic Authentication failed');
      console.log('Response:', responseText.slice(0, 500));
    }

    // Test 2: Try without authentication (to see difference)
    console.log('\n📡 Test 2: Testing without authentication (for comparison)...');
    const noAuthResponse = await fetch(`${FIRE22_API_URL}/Manager/getCustomerList`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Fire22-Dashboard/3.0.9'
      },
      body: new URLSearchParams({
        agentID: FIRE22_AGENT_ID || FIRE22_USERNAME || '',
        top: '10'
      })
    });

    console.log(`No-Auth Response Status: ${noAuthResponse.status}`);
    const noAuthText = await noAuthResponse.text();
    console.log(`No-Auth Response Length: ${noAuthText.length} bytes`);

    // Test 3: Try form-based login (session-based auth)
    console.log('\n📡 Test 3: Testing form-based login...');
    const loginResponse = await fetch(`${FIRE22_API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Fire22-Dashboard/3.0.9'
      },
      body: new URLSearchParams({
        username: FIRE22_USERNAME || '',
        password: FIRE22_PASSWORD || '',
        agentID: FIRE22_AGENT_ID || ''
      })
    });

    console.log(`Login Response Status: ${loginResponse.status}`);
    const loginHeaders = Object.fromEntries(loginResponse.headers.entries());
    console.log(`Login Response Headers:`, loginHeaders);
    
    // Check for session cookie
    const setCookie = loginResponse.headers.get('set-cookie');
    if (setCookie) {
      console.log('🍪 Session Cookie received:', setCookie.slice(0, 100));
      
      // Test 4: Try authenticated request with session
      console.log('\n📡 Test 4: Testing with session cookie...');
      const sessionResponse = await fetch(`${FIRE22_API_URL}/Manager/getCustomerList`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': setCookie,
          'User-Agent': 'Fire22-Dashboard/3.0.9'
        },
        body: new URLSearchParams({
          agentID: FIRE22_AGENT_ID || FIRE22_USERNAME || '',
          top: '10'
        })
      });

      console.log(`Session Response Status: ${sessionResponse.status}`);
      const sessionText = await sessionResponse.text();
      console.log(`Session Response Length: ${sessionText.length} bytes`);
      
      if (sessionResponse.ok) {
        console.log('✅ Session-based authentication successful!');
      }
    }

    // Test 5: Try a simple endpoint
    console.log('\n📡 Test 5: Testing simple endpoint...');
    const simpleResponse = await fetch(`${FIRE22_API_URL}/Manager`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'User-Agent': 'Fire22-Dashboard/3.0.9'
      }
    });

    console.log(`Simple Response Status: ${simpleResponse.status}`);
    const simpleText = await simpleResponse.text();
    console.log(`Simple Response Length: ${simpleText.length} bytes`);

  } catch (error) {
    console.error('❌ Error testing Fire22 authentication:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack:', error.stack);
    }
  }
}

// Run the test
testFire22Auth().then(() => {
  console.log('\n✅ Fire22 API authentication test complete');
}).catch((error) => {
  console.error('\n❌ Fire22 API authentication test failed:', error);
  process.exit(1);
});