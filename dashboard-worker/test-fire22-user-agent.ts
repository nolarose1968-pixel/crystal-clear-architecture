#!/usr/bin/env bun

/**
 * Test Fire22 API connections with configured user-agent
 */

import { Fire22Config } from './src/config/fire22-config';

console.log('🧪 Testing Fire22 User-Agent Configuration\n');

// Display current configuration
Fire22Config.logConfiguration();

// Test API request with configured user-agent
console.log('\n📡 Testing API Connection...');

async function testFire22Connection() {
  try {
    const headers = Fire22Config.getDefaultHeaders();
    const config = Fire22Config.getConnectionConfig();
    
    console.log('\nRequest Headers:');
    console.log(JSON.stringify(headers, null, 2));
    
    // Test with echo service to verify headers
    const response = await fetch('https://echo.hoppscotch.io/', {
      method: 'POST',
      headers: {
        ...headers,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        test: 'Fire22 Dashboard Connection Test',
        agentID: Fire22Config.AGENT_ID,
        version: Fire22Config.VERSION
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n✅ Connection Successful!');
      console.log('📱 User-Agent sent:', data.headers?.['user-agent'] || 'Not found');
      console.log('📦 Version header:', data.headers?.['x-dashboard-version'] || 'Not found');
      console.log('🏗️  Build header:', data.headers?.['x-dashboard-build'] || 'Not found');
    } else {
      console.log('❌ Connection failed:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
await testFire22Connection();

console.log('\n✅ Test Complete!');