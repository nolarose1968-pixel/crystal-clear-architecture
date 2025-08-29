#!/usr/bin/env bun

/**
 * Fantasy402 Cloud API Test
 * Tests authentication against the cloud/api endpoints
 */

const API_BASE = 'https://fantasy402.com/cloud/api';
const USERNAME = 'billy666';
const PASSWORD = 'backdoor69';

console.log('🎰 Fantasy402 Cloud API Test');
console.log('!==!==!==!==!===');
console.log(`API Base: ${API_BASE}`);
console.log(`Username: ${USERNAME}`);
console.log('');

async function testAuth() {
  // Try Basic Auth
  console.log('📡 Test 1: Basic Authentication');
  const basicAuth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

  try {
    const response = await fetch(`${API_BASE}/Manager`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        action: 'getCustomerList',
        agentID: USERNAME,
        top: '1',
      }),
    });

    console.log(`Status: ${response.status}`);
    const text = await response.text();
    console.log(`Response length: ${text.length} bytes`);

    if (response.ok) {
      console.log('✅ Basic Auth successful!');
      console.log('Response preview:', text.slice(0, 200));
    } else {
      console.log('❌ Basic Auth failed');
      console.log('Response:', text.slice(0, 500));
    }
  } catch (error) {
    console.error('Error:', error);
  }

  // Try with username/password in body
  console.log('\n📡 Test 2: Credentials in Request Body');

  try {
    const response = await fetch(`${API_BASE}/Manager`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: USERNAME,
        password: PASSWORD,
        action: 'getCustomerList',
        agentID: USERNAME,
        top: '1',
      }),
    });

    console.log(`Status: ${response.status}`);
    const text = await response.text();
    console.log(`Response length: ${text.length} bytes`);

    if (response.ok) {
      console.log('✅ Form auth successful!');
      console.log('Response preview:', text.slice(0, 200));
    } else {
      console.log('❌ Form auth failed');
      console.log('Response:', text.slice(0, 500));
    }
  } catch (error) {
    console.error('Error:', error);
  }

  // Try Customer API
  console.log('\n📡 Test 3: Customer API');

  try {
    const response = await fetch(`${API_BASE}/Customer`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        customerID: USERNAME,
        action: 'getBalance',
      }),
    });

    console.log(`Status: ${response.status}`);
    const text = await response.text();
    console.log(`Response length: ${text.length} bytes`);

    if (text.length < 1000) {
      console.log('Response:', text);
    }
  } catch (error) {
    console.error('Error:', error);
  }

  // Try different auth header format
  console.log('\n📡 Test 4: Alternative Auth Headers');

  try {
    const response = await fetch(`${API_BASE}/Manager`, {
      method: 'POST',
      headers: {
        'X-Username': USERNAME,
        'X-Password': PASSWORD,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        agentID: USERNAME,
        action: 'getCustomerList',
      }),
    });

    console.log(`Status: ${response.status}`);
    const text = await response.text();
    console.log(`Response length: ${text.length} bytes`);
  } catch (error) {
    console.error('Error:', error);
  }

  // Check what methods are allowed
  console.log('\n📡 Test 5: OPTIONS Request');

  try {
    const response = await fetch(`${API_BASE}/Manager`, {
      method: 'OPTIONS',
    });

    console.log(`Status: ${response.status}`);
    console.log(`Allow: ${response.headers.get('allow') || 'not specified'}`);
    console.log(
      `Access-Control-Allow-Methods: ${response.headers.get('access-control-allow-methods') || 'not specified'}`
    );
  } catch (error) {
    console.error('Error:', error);
  }
}

testAuth()
  .then(() => {
    console.log('\n✅ Test complete');
    console.log('\n💡 Next steps:');
    console.log('1. If authentication works, implement it in the worker');
    console.log('2. If not, we may need session-based auth or API key');
    console.log("3. Check if there's API documentation available");
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
  });
