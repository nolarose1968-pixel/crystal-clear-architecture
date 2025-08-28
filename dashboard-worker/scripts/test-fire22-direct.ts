#!/usr/bin/env bun

/**
 * Direct Fire22 API Test with exact parameters
 */

async function testFire22Direct() {
  const username = 'BILLY666';
  const password = 'backdoor69';
  
  console.log("🔥 Testing Fire22 Direct API Access");
  console.log("=" .repeat(50));
  
  // Test different parameter combinations
  const tests = [
    {
      name: "Test 1: Form-encoded with all params",
      url: "https://fire22.ag/cloud/api/Manager/getUser",
      params: {
        agentId: username,
        username: username,
        password: password,
        pass: password,
        ownerAGT: username,
        siteID: '1',
        site: '1',
        RRO: '1'
      }
    },
    {
      name: "Test 2: Simple auth",
      url: "https://fire22.ag/cloud/api/Manager/getUser",
      params: {
        username: username,
        password: password
      }
    },
    {
      name: "Test 3: With operation param",
      url: "https://fire22.ag/cloud/api/Manager/getWeeklyFigureByAgentLite",
      params: {
        agentID: username,
        agentOwner: username,
        agentSite: '1',
        operation: 'getWeeklyFigureByAgentLite',
        username: username,
        password: password
      }
    }
  ];
  
  for (const test of tests) {
    console.log(`\n${test.name}`);
    console.log(`URL: ${test.url}`);
    console.log(`Params:`, Object.keys(test.params).join(', '));
    
    const formData = new URLSearchParams(test.params);
    
    try {
      const response = await fetch(test.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': '*/*',
          'Origin': 'https://fire22.ag',
          'Referer': 'https://fire22.ag/manager.html'
        },
        body: formData.toString()
      });
      
      console.log(`Status: ${response.status}`);
      
      if (response.status === 200) {
        const text = await response.text();
        console.log(`✅ Success! Response length: ${text.length} bytes`);
        
        // Try to parse as JSON
        try {
          const json = JSON.parse(text);
          console.log(`Response type: JSON`);
          console.log(`Keys:`, Object.keys(json).join(', '));
          
          if (json.token) {
            console.log(`🔑 Token found: ${json.token.substring(0, 20)}...`);
          }
          if (json.success !== undefined) {
            console.log(`Success flag: ${json.success}`);
          }
        } catch {
          console.log(`Response type: HTML/Text`);
          if (text.includes('success')) {
            console.log(`Contains 'success' keyword`);
          }
          if (text.includes('error')) {
            console.log(`Contains 'error' keyword`);
          }
        }
      } else {
        const text = await response.text();
        if (text.includes('401')) {
          console.log(`❌ Unauthorized`);
        } else {
          console.log(`❌ Failed with status ${response.status}`);
        }
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  // Test with Basic Auth
  console.log("\n🔐 Testing with Basic Auth");
  const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');
  
  const authResponse = await fetch("https://fire22.ag/cloud/api/Manager/getLiveWagers", {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: new URLSearchParams({
      agentId: username,
      site: '1'
    }).toString()
  });
  
  console.log(`Basic Auth Status: ${authResponse.status}`);
  
  // Test GET request
  console.log("\n📊 Testing GET requests");
  const getResponse = await fetch(`https://fire22.ag/cloud/api/Manager/getUser?username=${username}&password=${password}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    }
  });
  
  console.log(`GET Status: ${getResponse.status}`);
}

// Run test
if (import.meta.main) {
  testFire22Direct().catch(console.error);
}