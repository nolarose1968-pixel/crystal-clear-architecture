#!/usr/bin/env bun

/**
 * 🧪 Fire22 User-Agent Test Suite
 * 
 * Tests and validates user-agent configuration across different environments
 * and demonstrates Bun v1.2.18+ features
 */

import { $ } from 'bun';

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

class UserAgentTester {
  
  /**
   * Test current user agent
   */
  async testCurrentUserAgent(): Promise<string> {
    try {
      const response = await fetch('https://httpbin.org/user-agent');
      const data = await response.json();
      return data['user-agent'];
    } catch (error) {
      console.error('Failed to fetch user-agent:', error);
      return 'Error fetching user-agent';
    }
  }

  /**
   * Test ANSI stripping (new Bun feature)
   */
  testAnsiStripping(): void {
    console.log('\n📝 Testing ANSI Stripping (Bun.stripANSI):');
    
    const testCases = [
      {
        input: `${colors.red}Red${colors.reset} ${colors.green}Green${colors.reset}`,
        expected: 'Red Green'
      },
      {
        input: `${colors.bold}${colors.blue}Bold Blue${colors.reset}`,
        expected: 'Bold Blue'
      },
      {
        input: `${colors.yellow}Warning:${colors.reset} ${colors.magenta}Important${colors.reset}`,
        expected: 'Warning: Important'
      }
    ];

    testCases.forEach((testCase, index) => {
      const stripped = Bun.stripANSI(testCase.input);
      const passed = stripped === testCase.expected;
      
      console.log(`   Test ${index + 1}: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
      if (!passed) {
        console.log(`      Expected: "${testCase.expected}"`);
        console.log(`      Got: "${stripped}"`);
      }
    });

    // Performance test
    const longString = Array(1000).fill(`${colors.red}Test${colors.reset}`).join(' ');
    const start = Bun.nanoseconds();
    const result = Bun.stripANSI(longString);
    const end = Bun.nanoseconds();
    const timeMs = (end - start) / 1_000_000;
    
    console.log(`   Performance: Stripped ${longString.length} chars in ${timeMs.toFixed(3)}ms`);
  }

  /**
   * Test runtime flags
   */
  testRuntimeFlags(): void {
    console.log('\n🎯 Runtime Flags (process.execArgv):');
    
    if (process.execArgv && process.execArgv.length > 0) {
      console.log('   Embedded flags detected:');
      process.execArgv.forEach((flag, index) => {
        console.log(`   ${index + 1}. ${flag}`);
      });
    } else {
      console.log('   No embedded runtime flags');
    }

    // Check for user-agent flag
    if (process.execArgv?.includes('--user-agent')) {
      const uaIndex = process.execArgv.indexOf('--user-agent');
      if (uaIndex !== -1 && process.execArgv[uaIndex + 1]) {
        console.log(`   📱 User-Agent flag value: ${process.execArgv[uaIndex + 1]}`);
      }
    }
  }

  /**
   * Test environment variables
   */
  testEnvironmentVariables(): void {
    console.log('\n🌍 Environment Variables:');
    
    const envVars = [
      'BUN_USER_AGENT',
      'USER_AGENT', 
      'FIRE22_USER_AGENT',
      'ENVIRONMENT',
      'VERSION',
      'BUILD_TIME',
      'DEBUG_MODE'
    ];

    envVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        console.log(`   ✅ ${varName}: ${value}`);
      } else {
        console.log(`   ⚪ ${varName}: not set`);
      }
    });
  }

  /**
   * Test with different user agents
   */
  async testMultipleUserAgents(): Promise<void> {
    console.log('\n🔄 Testing Multiple User-Agents:');
    
    const userAgents = [
      'Fire22-Dashboard/3.0.9',
      'Fire22-Dashboard/3.0.9 (Development)',
      'Fire22-Dashboard/3.0.9 (Production)',
      `Fire22-Dashboard/3.0.9 (Bun/${Bun.version})`,
      'CustomAgent/1.0'
    ];

    for (const ua of userAgents) {
      // Set environment variable temporarily
      const originalUA = process.env.BUN_USER_AGENT;
      process.env.BUN_USER_AGENT = ua;
      
      const response = await fetch('https://httpbin.org/user-agent');
      const data = await response.json();
      const received = data['user-agent'];
      
      // Note: The environment variable won't affect the current process's fetch
      // This is to demonstrate how it would work in a new process
      console.log(`   Testing: ${ua}`);
      console.log(`   Would send: ${ua} (in new process)`);
      
      // Restore original
      if (originalUA) {
        process.env.BUN_USER_AGENT = originalUA;
      } else {
        delete process.env.BUN_USER_AGENT;
      }
    }
  }

  /**
   * Test executable with embedded user-agent
   */
  async testExecutable(execPath?: string): Promise<void> {
    if (!execPath) {
      console.log('\n📦 Executable Test: No executable path provided');
      return;
    }

    console.log(`\n📦 Testing Executable: ${execPath}`);
    
    try {
      // Create a test script for the executable to run
      const testScript = `
        const response = await fetch('https://httpbin.org/user-agent');
        const data = await response.json();
        console.log('Executable User-Agent:', data['user-agent']);
        
        if (process.execArgv && process.execArgv.length > 0) {
          console.log('Embedded flags:', process.execArgv.join(' '));
        }
      `;
      
      const tempFile = '/tmp/test-ua.js';
      await Bun.write(tempFile, testScript);
      
      // Run the executable
      const result = await $`${execPath} ${tempFile}`.text();
      console.log(result);
      
    } catch (error) {
      console.error('   Failed to test executable:', error);
    }
  }

  /**
   * Performance comparison
   */
  async performanceComparison(): Promise<void> {
    console.log('\n⚡ Performance Comparison:');
    
    // Test fetch with custom user-agent
    const iterations = 10;
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = Bun.nanoseconds();
      await fetch('https://httpbin.org/headers', {
        headers: {
          'User-Agent': `Fire22-Dashboard/3.0.9 (Test ${i})`
        }
      });
      const end = Bun.nanoseconds();
      times.push((end - start) / 1_000_000); // Convert to ms
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    console.log(`   Requests: ${iterations}`);
    console.log(`   Average: ${avgTime.toFixed(2)}ms`);
    console.log(`   Min: ${minTime.toFixed(2)}ms`);
    console.log(`   Max: ${maxTime.toFixed(2)}ms`);
  }

  /**
   * Run all tests
   */
  async runAllTests(execPath?: string): Promise<void> {
    console.log('🧪 Fire22 User-Agent Test Suite');
    console.log('=' .repeat(60));
    console.log(`📊 Bun Version: ${Bun.version}`);
    console.log(`🖥️  Platform: ${process.platform} ${process.arch}`);
    console.log(`📅 Date: ${new Date().toISOString()}`);
    
    // Test current user-agent
    console.log('\n📱 Current User-Agent:');
    const currentUA = await this.testCurrentUserAgent();
    console.log(`   ${currentUA}`);
    
    // Test ANSI stripping
    this.testAnsiStripping();
    
    // Test runtime flags
    this.testRuntimeFlags();
    
    // Test environment variables
    this.testEnvironmentVariables();
    
    // Test multiple user agents
    await this.testMultipleUserAgents();
    
    // Test executable if provided
    if (execPath) {
      await this.testExecutable(execPath);
    }
    
    // Performance comparison
    await this.performanceComparison();
    
    console.log('\n✅ Test Suite Complete!');
    console.log('=' .repeat(60));
  }
}

// CLI interface
if (import.meta.main) {
  const tester = new UserAgentTester();
  const args = process.argv.slice(2);
  
  // Check for executable path
  const execPath = args.find(arg => arg.startsWith('--exec='))?.split('=')[1];
  
  // Check for specific test
  const testType = args[0];
  
  switch (testType) {
    case 'current':
      const ua = await tester.testCurrentUserAgent();
      console.log('Current User-Agent:', ua);
      break;
      
    case 'ansi':
      tester.testAnsiStripping();
      break;
      
    case 'flags':
      tester.testRuntimeFlags();
      break;
      
    case 'env':
      tester.testEnvironmentVariables();
      break;
      
    case 'multi':
      await tester.testMultipleUserAgents();
      break;
      
    case 'perf':
      await tester.performanceComparison();
      break;
      
    case 'exec':
      await tester.testExecutable(execPath);
      break;
      
    default:
      await tester.runAllTests(execPath);
  }
}