#!/usr/bin/env bun

/**
 * Fantasy402 API Authentication Test
 * Tests the provided credentials against fantasy402.com
 */

const FANTASY402_BASE = 'https://fantasy402.com';
const USERNAME = 'billy666';
const PASSWORD = 'backdoor69';

console.log('🎰 Fantasy402 API Authentication Test');
console.log('!==!==!==!==!==!==!==');
console.log(`Base URL: ${FANTASY402_BASE}`);
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
    console.log(`Set-Cookie: ${response.headers.get('set-cookie')?.slice(0, 100) || 'none'}`);

    const text = await response.text();
    console.log(`Response Length: ${text.length} bytes`);

    if (text.length < 1000) {
      console.log(`Response: ${text}`);
    } else {
      console.log(`Response (first 500 chars): ${text.slice(0, 500)}`);

      // Check for specific patterns
      if (text.includes('login') || text.includes('Login')) {
        console.log('  → Contains login form/text');
      }
      if (text.includes('username') || text.includes('Username')) {
        console.log('  → Contains username field');
      }
      if (text.includes('password') || text.includes('Password')) {
        console.log('  → Contains password field');
      }
    }

    return response;
  } catch (error) {
    console.error(`Error: ${error}`);
    return null;
  }
}

async function main() {
  // Test 1: Manager page
  await testEndpoint('Manager Page', `${FANTASY402_BASE}/manager.html`);

  // Test 2: Try login endpoint
  await testEndpoint('Login Attempt', `${FANTASY402_BASE}/login`, {
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

  // Test 3: API endpoints similar to Fire22
  await testEndpoint('API Manager', `${FANTASY402_BASE}/api/Manager`, {
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

  // Test 4: Try cloud/api path
  await testEndpoint('Cloud API', `${FANTASY402_BASE}/cloud/api/Manager`, {
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

  // Test 5: Check for API at root
  await testEndpoint('Root API', `${FANTASY402_BASE}/api`, {
    method: 'GET',
  });

  // Test 6: Try Basic Auth
  const basicAuth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');
  await testEndpoint('Basic Auth Test', `${FANTASY402_BASE}/api/Manager`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${basicAuth}`,
    },
  });

  // Test 7: Look for session-based auth
  console.log('\n🔐 Attempting session-based authentication...');

  // First, try to get the login page
  const loginPageResponse = await fetch(`${FANTASY402_BASE}/manager.html`);
  const loginPageText = await loginPageResponse.text();

  // Look for CSRF token or session info
  const csrfMatch = loginPageText.match(/csrf[_-]?token['"]\s*[:=]\s*['"]([^'"]+)['"]/i);
  const sessionMatch = loginPageText.match(/session[_-]?id['"]\s*[:=]\s*['"]([^'"]+)['"]/i);

  if (csrfMatch) {
    console.log(`Found CSRF token: ${csrfMatch[1].slice(0, 20)}...`);
  }
  if (sessionMatch) {
    console.log(`Found session ID: ${sessionMatch[1].slice(0, 20)}...`);
  }

  // Test 8: Check specific manager endpoints
  await testEndpoint('Get Weekly Figure', `${FANTASY402_BASE}/api/manager/getWeeklyFigureByAgent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      agentID: USERNAME,
      week: '0',
      type: 'A',
    }),
  });

  // Test 9: Try customer list
  await testEndpoint('Get Customer List', `${FANTASY402_BASE}/api/manager/getCustomerList`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      agentID: USERNAME,
      top: '10',
    }),
  });

  // Test 10: Check if qubic path exists
  await testEndpoint('Qubic API', `${FANTASY402_BASE}/qubic/api/Manager`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      agentID: USERNAME,
    }),
  });
}

main()
  .then(() => {
    console.log('\n✅ Fantasy402 test complete');
    console.log('\n📋 Summary:');
    console.log('- Fantasy402.com appears to be accessible');
    console.log('- You may need to update FIRE22_API_URL to: https://fantasy402.com/api');
    console.log('- Or use the appropriate endpoint structure for this domain');
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
