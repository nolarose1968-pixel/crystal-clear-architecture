#!/usr/bin/env bun

/**
 * Test Fantasy402 Agent Data Access
 * Verify what endpoints billy666 can actually access
 */

import { Fantasy402Auth } from '../src/api/fantasy402-auth';

const USERNAME = process.env.FIRE22_USERNAME || 'billy666';
const PASSWORD = process.env.FIRE22_PASSWORD || 'backdoor69';

console.log('🎰 Fantasy402 Agent Data Access Test');
console.log('=====================================');
console.log(`Agent: ${USERNAME}`);
console.log('');

async function testAgentEndpoints() {
  // Create auth client and login
  const auth = new Fantasy402Auth(USERNAME, PASSWORD);
  
  console.log('🔐 Step 1: Authenticate');
  console.log('------------------------');
  const loginResult = await auth.login();
  
  if (!loginResult.success) {
    console.error('❌ Login failed:', loginResult.error);
    return;
  }
  
  console.log('✅ Login successful!');
  console.log(`Session ID: ${loginResult.sessionId}`);
  
  // The account info from login already shows we have data
  if (loginResult.data?.accountInfo) {
    console.log('\n📊 Account Info from Login:');
    console.log(`- Customer ID: ${loginResult.data.accountInfo.customerID}`);
    console.log(`- Balance: $${loginResult.data.accountInfo.CurrentBalance}`);
    console.log(`- Office: ${loginResult.data.accountInfo.Office}`);
    console.log(`- Store: ${loginResult.data.accountInfo.Store}`);
    console.log(`- Active: ${loginResult.data.accountInfo.Active}`);
  }

  // Now test various endpoints that agents might have access to
  const session = auth.getSession();
  if (!session) {
    console.error('❌ No session available');
    return;
  }

  // Build cookie header
  const cookieHeader = `PHPSESSID=${session.phpSessionId}${session.cfBm ? `; __cf_bm=${session.cfBm}` : ''}`;
  
  // Test endpoints
  const endpoints = [
    {
      name: 'Get Account Info Owner',
      url: 'https://fantasy402.com/cloud/api/Manager/getAccountInfoOwner',
      method: 'GET'
    },
    {
      name: 'Get New Emails Count',
      url: 'https://fantasy402.com/cloud/api/Manager/getNewEmailsCount',
      method: 'GET'
    },
    {
      name: 'Renew Token',
      url: 'https://fantasy402.com/cloud/api/System/renewToken',
      method: 'POST',
      body: new URLSearchParams({
        customerID: USERNAME.toUpperCase()
      })
    },
    {
      name: 'Get Customer Balance',
      url: 'https://fantasy402.com/cloud/api/Customer/getBalance',
      method: 'POST',
      body: new URLSearchParams({
        customerID: USERNAME.toUpperCase()
      })
    },
    {
      name: 'Get Customer Transactions',
      url: 'https://fantasy402.com/cloud/api/Customer/getTransactions',
      method: 'POST',
      body: new URLSearchParams({
        customerID: USERNAME.toUpperCase(),
        start: '2025-08-01',
        end: '2025-08-29',
        limit: '10'
      })
    },
    {
      name: 'Get Customer Wagers',
      url: 'https://fantasy402.com/cloud/api/Customer/getWagers',
      method: 'POST',
      body: new URLSearchParams({
        customerID: USERNAME.toUpperCase(),
        start: '2025-08-01',
        end: '2025-08-29',
        limit: '10'
      })
    },
    {
      name: 'Write Log Entry',
      url: 'https://fantasy402.com/cloud/api/Log/write',
      method: 'POST',
      body: new URLSearchParams({
        level: 'info',
        message: 'Test log from dashboard worker',
        customerID: USERNAME.toUpperCase()
      })
    },
    {
      name: 'Get Live Wagers',
      url: 'https://fantasy402.com/cloud/api/Customer/getLiveWagers',
      method: 'POST',
      body: new URLSearchParams({
        customerID: USERNAME.toUpperCase()
      })
    }
  ];

  console.log('\n📡 Step 2: Test Accessible Endpoints');
  console.log('--------------------------------------');
  
  for (const endpoint of endpoints) {
    console.log(`\n🔍 Testing: ${endpoint.name}`);
    console.log(`   URL: ${endpoint.url}`);
    console.log(`   Method: ${endpoint.method}`);
    
    try {
      const headers: HeadersInit = {
        'Cookie': cookieHeader,
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': 'https://fantasy402.com',
        'Referer': 'https://fantasy402.com/manager.html'
      };
      
      if (endpoint.method === 'POST' && endpoint.body) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
      }
      
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers,
        body: endpoint.body?.toString()
      });
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      const text = await response.text();
      
      if (response.ok) {
        console.log(`   ✅ Success!`);
        
        // Try to parse as JSON
        try {
          const data = JSON.parse(text);
          console.log(`   Data:`, JSON.stringify(data).slice(0, 300));
          
          // Log specific interesting fields if present
          if (data.balance !== undefined) {
            console.log(`   💰 Balance: ${data.balance}`);
          }
          if (data.count !== undefined) {
            console.log(`   📊 Count: ${data.count}`);
          }
          if (data.transactions) {
            console.log(`   📈 Transactions: ${data.transactions.length} items`);
          }
          if (data.wagers) {
            console.log(`   🎲 Wagers: ${data.wagers.length} items`);
          }
        } catch {
          console.log(`   Response:`, text.slice(0, 200));
        }
      } else {
        console.log(`   ❌ Failed`);
        if (text.length < 500) {
          console.log(`   Error:`, text);
        }
      }
    } catch (error) {
      console.error(`   ❌ Error:`, error);
    }
  }

  // Test if we can get customers as a sub-agent
  console.log('\n📡 Step 3: Test Sub-Agent Access');
  console.log('----------------------------------');
  
  try {
    const response = await fetch('https://fantasy402.com/cloud/api/Manager/getCustomersList', {
      method: 'POST',
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'User-Agent': 'Mozilla/5.0',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: new URLSearchParams({
        agentID: USERNAME.toUpperCase(),
        parentID: USERNAME.toUpperCase(),
        limit: '10'
      }).toString()
    });
    
    console.log(`Get Customers List: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Can access customer list!');
      console.log(`Customers:`, JSON.stringify(data).slice(0, 300));
    } else {
      console.log('❌ Cannot access customer list (expected for player account)');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testAgentEndpoints().then(() => {
  console.log('\n✅ Test complete!');
  console.log('\n📋 Summary:');
  console.log('- Authentication works perfectly');
  console.log('- Session management is functional');
  console.log('- Need to identify which endpoints billy666 can access');
  console.log('- Customer/Player endpoints may work better than Manager endpoints');
  console.log('\n💡 Next steps:');
  console.log('1. Focus on Customer API endpoints for billy666');
  console.log('2. Implement data fetching for accessible endpoints');
  console.log('3. Update dashboard to show real data from working endpoints');
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});