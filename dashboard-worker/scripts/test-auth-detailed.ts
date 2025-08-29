#!/usr/bin/env bun

/**
 * Detailed Authentication Response Inspector
 * Examines the full response from authenticateCustomer
 */

const USERNAME = 'billy666';
const PASSWORD = 'backdoor69';
const API_BASE = 'https://fantasy402.com/cloud/api';

console.log('🔍 Fantasy402 Authentication Deep Inspection');
console.log('============================================');
console.log(`Username: ${USERNAME}`);
console.log('');

async function inspectAuthResponse() {
  console.log('📡 Making authenticateCustomer request...');
  console.log('------------------------------------------');
  
  const formData = new URLSearchParams({
    customerID: USERNAME.toUpperCase(),
    state: 'true',
    password: PASSWORD.toUpperCase(),
    multiaccount: '1',
    response_type: 'code',
    client_id: USERNAME.toUpperCase(),
    domain: 'fantasy402.com',
    redirect_uri: 'fantasy402.com',
    operation: 'authenticateCustomer',
    RRO: '1'
  });

  console.log('📦 Request Body:');
  console.log(formData.toString());
  console.log('');

  try {
    const response = await fetch(`${API_BASE}/System/authenticateCustomer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://fantasy402.com',
        'Referer': 'https://fantasy402.com/manager.html',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: formData.toString()
    });

    console.log('📊 Response Status:', response.status, response.statusText);
    console.log('');
    
    console.log('🔑 Response Headers:');
    console.log('--------------------');
    response.headers.forEach((value, key) => {
      console.log(`${key}: ${value}`);
      
      // Highlight important headers
      if (key.toLowerCase() === 'set-cookie') {
        console.log('  → 🍪 COOKIE DETECTED!');
        // Parse individual cookies
        const cookies = value.split(',').map(c => c.trim());
        cookies.forEach(cookie => {
          const [name] = cookie.split('=');
          console.log(`     - ${name}`);
        });
      }
      if (key.toLowerCase().includes('token') || key.toLowerCase().includes('auth')) {
        console.log('  → 🎫 AUTH/TOKEN HEADER DETECTED!');
      }
    });
    console.log('');

    // Get response body as text first
    const responseText = await response.text();
    console.log('📄 Raw Response Length:', responseText.length, 'bytes');
    console.log('');

    // Try to parse as JSON
    try {
      const responseData = JSON.parse(responseText);
      
      console.log('🎯 Parsed JSON Response:');
      console.log('------------------------');
      console.log(JSON.stringify(responseData, null, 2));
      console.log('');
      
      console.log('🔍 Looking for Auth Tokens in Response:');
      console.log('----------------------------------------');
      
      // Check for various token field names
      const tokenFields = [
        'token', 'Token', 'TOKEN',
        'jwt', 'JWT', 'Jwt',
        'access_token', 'accessToken', 'AccessToken',
        'session_token', 'sessionToken', 'SessionToken',
        'auth_token', 'authToken', 'AuthToken',
        'bearer', 'Bearer', 'BEARER',
        'sessionId', 'SessionId', 'sessionID',
        'sid', 'SID', 'Sid'
      ];
      
      function searchForTokens(obj: any, path: string = '') {
        if (!obj) return;
        
        Object.keys(obj).forEach(key => {
          const fullPath = path ? `${path}.${key}` : key;
          const value = obj[key];
          
          // Check if key name suggests token
          if (tokenFields.some(tf => key.includes(tf))) {
            console.log(`  ✅ Found potential token field: ${fullPath}`);
            console.log(`     Value: ${String(value).slice(0, 100)}${String(value).length > 100 ? '...' : ''}`);
          }
          
          // Check if value looks like a token (long string)
          if (typeof value === 'string' && value.length > 20 && !key.includes('ID') && !key.includes('Name')) {
            if (value.match(/^[A-Za-z0-9_\-\.]+$/)) {
              console.log(`  🔸 Found token-like string: ${fullPath}`);
              console.log(`     Value: ${value.slice(0, 50)}${value.length > 50 ? '...' : ''}`);
            }
          }
          
          // Recursively search nested objects
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            searchForTokens(value, fullPath);
          }
        });
      }
      
      searchForTokens(responseData);
      
      // Specifically check accountInfo
      if (responseData.accountInfo) {
        console.log('');
        console.log('📊 Account Info Fields:');
        console.log('-----------------------');
        Object.keys(responseData.accountInfo).forEach(key => {
          const value = responseData.accountInfo[key];
          console.log(`  ${key}: ${value}`);
        });
      }
      
    } catch (e) {
      console.log('⚠️ Response is not JSON');
      console.log('Raw response (first 500 chars):');
      console.log(responseText.slice(0, 500));
    }

    // Now test if we can use just the PHPSESSID
    console.log('\n🧪 Testing API call with session cookie...');
    console.log('-------------------------------------------');
    
    const setCookie = response.headers.get('set-cookie');
    const phpSessionMatch = setCookie?.match(/PHPSESSID=([^;]+)/);
    
    if (phpSessionMatch) {
      const sessionId = phpSessionMatch[1];
      console.log(`Using PHPSESSID: ${sessionId}`);
      
      // Try a simple API call
      const testResponse = await fetch(`${API_BASE}/System/renewToken`, {
        method: 'POST',
        headers: {
          'Cookie': `PHPSESSID=${sessionId}`,
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'Origin': 'https://fantasy402.com',
          'Referer': 'https://fantasy402.com/manager.html',
        },
        body: new URLSearchParams({
          customerID: USERNAME.toUpperCase()
        }).toString()
      });
      
      console.log(`Test Response Status: ${testResponse.status}`);
      const testText = await testResponse.text();
      console.log(`Test Response: ${testText.slice(0, 200)}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

inspectAuthResponse().then(() => {
  console.log('\n✅ Inspection complete!');
  console.log('\n💡 Key Findings:');
  console.log('- Check for JWT/token in response body');
  console.log('- Check for additional cookies beyond PHPSESSID');
  console.log('- Look for auth headers in response');
}).catch(error => {
  console.error('❌ Failed:', error);
});