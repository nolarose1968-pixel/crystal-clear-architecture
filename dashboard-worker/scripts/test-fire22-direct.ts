#!/usr/bin/env bun

/**
 * Direct Fire22 API Test
 * Tests different authentication methods
 */

const FIRE22_BASE = 'https://fire22.ag';
const USERNAME = 'billy666';
const PASSWORD = 'backdoor69';

console.log('🔥 Fire22 Direct API Test');
console.log('!==!==!==!=====');
console.log(`Base URL: ${FIRE22_BASE}`);
console.log(`Username: ${USERNAME}`);
console.log('');

async function testEndpoint(name: string, url: string, options: RequestInit = {}) {
  console.log(`\n📡 Testing: ${name}`);
  console.log(`URL: ${url}`);

  try {
    const response = await fetch(url, {
      ...options,
      redirect: 'manual', // Don't follow redirects automatically
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Location: ${response.headers.get('location') || 'none'}`);
    console.log(`Content-Type: ${response.headers.get('content-type') || 'none'}`);

    const text = await response.text();
    console.log(`Response Length: ${text.length} bytes`);

    if (text.length < 1000) {
      console.log(`Response: ${text}`);
    } else {
      console.log(`Response (first 500 chars): ${text.slice(0, 500)}`);
    }

    return response;
  } catch (error) {
    console.error(`Error: ${error}`);
    return null;
  }
}

async function main() {
  // Test 1: Main site
  await testEndpoint('Main Site', FIRE22_BASE);

  // Test 2: Cloud login page
  await testEndpoint('Cloud Login Page', `${FIRE22_BASE}/cloud/`);

  // Test 3: API base
  await testEndpoint('API Base', `${FIRE22_BASE}/cloud/api`);

  // Test 4: Try POST login to cloud
  await testEndpoint('Cloud Login POST', `${FIRE22_BASE}/cloud/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      username: USERNAME,
      password: PASSWORD,
      submit: 'Login',
    }),
  });

  // Test 5: Try Manager API with form data
  await testEndpoint('Manager API with credentials', `${FIRE22_BASE}/cloud/api/Manager`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      username: USERNAME,
      password: PASSWORD,
      agentID: USERNAME,
      action: 'getCustomerList',
    }),
  });

  // Test 6: Try Customer API
  await testEndpoint('Customer API', `${FIRE22_BASE}/cloud/api/Customer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      username: USERNAME,
      password: PASSWORD,
      customerID: USERNAME,
    }),
  });

  // Test 7: Check if there's a different auth endpoint
  await testEndpoint('Auth Endpoint', `${FIRE22_BASE}/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: USERNAME,
      password: PASSWORD,
    }),
  });

  // Test 8: Try the qubic path mentioned in worker
  await testEndpoint('Qubic API', `${FIRE22_BASE}/qubic/api/Manager`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      username: USERNAME,
      password: PASSWORD,
      agentID: USERNAME,
    }),
  });
}

main()
  .then(() => {
    console.log('\n✅ Test complete');
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
