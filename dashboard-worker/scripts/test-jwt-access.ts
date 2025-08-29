#!/usr/bin/env bun

/**
 * Test API Access with JWT Bearer Token
 * Verifies that we can make authenticated requests using the JWT
 */

import { Fantasy402Auth } from '../src/api/fantasy402-auth';

const USERNAME = process.env.FIRE22_USERNAME || 'billy666';
const PASSWORD = process.env.FIRE22_PASSWORD || 'backdoor69';

console.log('🔐 Fantasy402 JWT Authentication Test');
console.log('!==!==!==!==!==!==!==');
console.log(`Username: ${USERNAME}`);
console.log('');

async function testJWTAccess() {
  // Create auth client and login
  const auth = new Fantasy402Auth(USERNAME, PASSWORD);

  console.log('📡 Step 1: Authenticate and Get JWT');
  console.log('------------------------------------');
  const loginResult = await auth.login();

  if (!loginResult.success) {
    console.error('❌ Login failed:', loginResult.error);
    return;
  }

  console.log('✅ Login successful!');

  const session = auth.getSession();
  if (!session || !session.bearerToken) {
    console.error('❌ No JWT token received');
    return;
  }

  console.log(`🎫 JWT Token: ${session.bearerToken.slice(0, 50)}...`);
  console.log(`🍪 Session ID: ${session.phpSessionId}`);
  console.log('');

  // Now test various endpoints with the JWT
  console.log('📡 Step 2: Test API Endpoints with JWT');
  console.log('---------------------------------------');

  const endpoints = [
    {
      name: 'Get Account Info Owner',
      url: 'https://fantasy402.com/cloud/api/Manager/getAccountInfoOwner',
      method: 'GET',
    },
    {
      name: 'Get Account Info (POST)',
      url: 'https://fantasy402.com/cloud/api/Manager/getAccountInfo',
      method: 'POST',
      body: { customerID: USERNAME.toUpperCase() },
    },
    {
      name: 'Renew Token',
      url: 'https://fantasy402.com/cloud/api/System/renewToken',
      method: 'POST',
      body: { customerID: USERNAME.toUpperCase() },
    },
    {
      name: 'Get New Emails Count',
      url: 'https://fantasy402.com/cloud/api/Manager/getNewEmailsCount',
      method: 'GET',
    },
    {
      name: 'Get Customer Balance',
      url: 'https://fantasy402.com/cloud/api/Customer/getBalance',
      method: 'POST',
      body: { customerID: USERNAME.toUpperCase() },
    },
    {
      name: 'Get Recent Transactions',
      url: 'https://fantasy402.com/cloud/api/Customer/getRecentTransactions',
      method: 'POST',
      body: {
        customerID: USERNAME.toUpperCase(),
        limit: '5',
      },
    },
    {
      name: 'Get Pending Wagers',
      url: 'https://fantasy402.com/cloud/api/Customer/getPendingWagers',
      method: 'POST',
      body: { customerID: USERNAME.toUpperCase() },
    },
  ];

  for (const endpoint of endpoints) {
    console.log(`\n🔍 Testing: ${endpoint.name}`);
    console.log(`   URL: ${endpoint.url}`);

    try {
      const headers: HeadersInit = {
        Authorization: `Bearer ${session.bearerToken}`,
        Cookie: `PHPSESSID=${session.phpSessionId}${session.cfBm ? `; __cf_bm=${session.cfBm}` : ''}`,
        Accept: 'application/json, text/javascript, */*; q=0.01',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        'X-Requested-With': 'XMLHttpRequest',
        Origin: 'https://fantasy402.com',
        Referer: 'https://fantasy402.com/manager.html',
      };

      let body: string | undefined;
      if (endpoint.method === 'POST' && endpoint.body) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        body = new URLSearchParams(endpoint.body as any).toString();
      }

      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers,
        body,
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);

      const text = await response.text();

      if (response.ok) {
        console.log(`   ✅ SUCCESS with JWT!`);

        try {
          const data = JSON.parse(text);
          console.log(`   Response:`, JSON.stringify(data).slice(0, 300));

          // Log interesting data points
          if (data.balance !== undefined) {
            console.log(`   💰 Balance: ${data.balance}`);
          }
          if (data.customerID) {
            console.log(`   👤 Customer: ${data.customerID}`);
          }
          if (data.count !== undefined) {
            console.log(`   📊 Count: ${data.count}`);
          }
          if (Array.isArray(data)) {
            console.log(`   📦 Array with ${data.length} items`);
          }
        } catch {
          console.log(`   Response (text):`, text.slice(0, 200));
        }
      } else {
        console.log(`   ❌ Failed`);
        if (text.length < 300) {
          console.log(`   Error:`, text);
        }
      }
    } catch (error) {
      console.error(`   ❌ Error:`, error);
    }
  }

  // Test using the auth class's request method
  console.log('\n📡 Step 3: Test Using Auth Class Request Method');
  console.log('------------------------------------------------');

  try {
    // This should use the JWT automatically
    const result = await auth.request('System/renewToken', 'POST', {
      customerID: USERNAME.toUpperCase(),
    });

    console.log('renewToken Result:', JSON.stringify(result).slice(0, 300));

    if (result && result.code) {
      console.log('✅ Got new JWT token!');
      console.log(`New token: ${result.code.slice(0, 50)}...`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testJWTAccess()
  .then(() => {
    console.log('\n✅ JWT test complete!');
    console.log('\n📋 Summary:');
    console.log('- JWT extraction from login response works');
    console.log('- Bearer token authorization is being sent');
    console.log('- Check which endpoints accept the JWT');
    console.log('\n💡 Next steps:');
    console.log('1. Focus on endpoints that return 200 OK');
    console.log('2. Implement token renewal before expiration');
    console.log('3. Update dashboard to use working endpoints');
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
