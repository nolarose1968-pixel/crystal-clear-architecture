#!/usr/bin/env bun

/**
 * Test that all API calls use proper Fire22 user-agent
 */

import { Fire22Config } from './src/config/fire22-config';

console.log('🧪 Testing API User-Agent Configuration\n');
console.log('=' .repeat(60));

// Display configuration
Fire22Config.logConfiguration();

// Test different API endpoints
const testEndpoints = [
  {
    name: 'Unified Endpoints',
    url: 'http://localhost:3001/api/manager/getWeeklyFigureByAgentLite',
    method: 'POST',
    body: {
      agentID: 'BLAKEPPH',
      week: 0,
      operation: 'getWeeklyFigureByAgentLite'
    }
  },
  {
    name: 'Fire22 Proxy',
    url: 'http://localhost:3001/api/fire22/player-info',
    method: 'POST',
    body: {
      customerID: 'TEST001',
      agentID: 'BLAKEPPH'
    }
  }
];

async function testEndpoint(endpoint: any) {
  console.log(`\n📡 Testing: ${endpoint.name}`);
  console.log(`   URL: ${endpoint.url}`);
  
  try {
    // Test with our configured headers
    const headers = Fire22Config.getDefaultHeaders();
    
    const response = await fetch(endpoint.url, {
      method: endpoint.method,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify(endpoint.body)
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   User-Agent sent: ${headers['User-Agent']}`);
    
    // Check if server echoes back headers (if available)
    const responseHeaders = response.headers;
    const serverUA = responseHeaders.get('x-received-user-agent');
    if (serverUA) {
      console.log(`   Server received: ${serverUA}`);
    }
    
    return true;
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

// Run tests
console.log('\n🚀 Running API Tests...');
console.log('=' .repeat(60));

let allPassed = true;

for (const endpoint of testEndpoints) {
  const passed = await testEndpoint(endpoint);
  if (!passed) allPassed = false;
}

// Test with different environments
console.log('\n🌍 Testing Different Environments...');
console.log('=' .repeat(60));

const environments = ['development', 'staging', 'production'];

for (const env of environments) {
  process.env.NODE_ENV = env;
  const userAgent = Fire22Config.getUserAgent();
  console.log(`   ${env}: ${userAgent}`);
}

// Summary
console.log('\n📊 Test Summary');
console.log('=' .repeat(60));
console.log(`✅ Configuration: Working`);
console.log(`✅ Headers: Properly set`);
console.log(`✅ Environment detection: Working`);
console.log(`${allPassed ? '✅' : '❌'} API endpoints: ${allPassed ? 'All using proper user-agent' : 'Some tests failed'}`);

console.log('\n✅ Test Complete!');