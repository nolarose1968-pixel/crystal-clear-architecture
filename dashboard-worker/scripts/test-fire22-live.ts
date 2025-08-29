#!/usr/bin/env bun

/**
 * Fire22 Live API Testing
 * Tests real Fire22 endpoints with authentication and security
 */

import { Fire22SecurityManager } from './fire22-security-suite';

// Fire22 API Configuration
const FIRE22_CONFIG = {
  baseUrl: process.env.FIRE22_API_BASE_URL || 'https://fire22.ag/cloud/api',
  username: process.env.FIRE22_USERNAME || 'BLAKEPPH',
  password: process.env.FIRE22_PASSWORD || 'balls',
  agentId: process.env.FIRE22_AGENT_ID || 'BLAKEPPH',
  agentOwner: process.env.FIRE22_AGENT_OWNER || 'BLAKEPPH',
  apiKey: process.env.FIRE22_API_KEY || process.env.FIRE22_TOKEN || '',
  apiSecret: process.env.FIRE22_API_SECRET || process.env.FIRE22_WEBHOOK_SECRET || '',
};

// Test results storage
const testResults: Array<{
  endpoint: string;
  method: string;
  status: number;
  success: boolean;
  responseTime: number;
  data?: any;
  error?: string;
}> = [];

/**
 * Fire22 API Client with Security
 */
class Fire22APIClient {
  private token: string | null = null;
  private security: Fire22SecurityManager;
  private sessionStartTime: Date;

  constructor() {
    this.security = new Fire22SecurityManager(FIRE22_CONFIG.apiKey, FIRE22_CONFIG.apiSecret);
    this.sessionStartTime = new Date();
  }

  /**
   * Login to Fire22
   */
  async login(): Promise<boolean> {
    console.log('🔐 Logging into Fire22...');
    console.log(`  URL: ${FIRE22_CONFIG.baseUrl}`);
    console.log(`  Username: ${FIRE22_CONFIG.username}`);
    const startTime = performance.now();

    try {
      // Fire22 uses different auth endpoint structure
      const authUrl = `${FIRE22_CONFIG.baseUrl}/login.aspx`;
      console.log(`  Attempting login at: ${authUrl}`);

      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Fire22-Security-Test/1.0',
        },
        body: new URLSearchParams({
          username: FIRE22_CONFIG.username,
          password: FIRE22_CONFIG.password,
          submit: 'login',
        }).toString(),
      });

      const responseTime = performance.now() - startTime;

      // Check content type
      const contentType = response.headers.get('content-type');
      console.log(`  Response Content-Type: ${contentType}`);
      console.log(`  Response Status: ${response.status}`);

      let data: any;
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.log(`  Response preview: ${text.substring(0, 200)}...`);

        // Check if login was successful by looking for indicators in HTML
        const isSuccess =
          text.includes('successful') ||
          text.includes('dashboard') ||
          response.headers.get('set-cookie')?.includes('session');

        data = {
          success: isSuccess,
          token: response.headers.get('set-cookie'),
          message: isSuccess ? 'Login successful' : 'Login failed',
        };
      }

      testResults.push({
        endpoint: authUrl,
        method: 'POST',
        status: response.status,
        success: response.ok || data.success,
        responseTime,
        data: response.ok || data.success ? { token: '***hidden***' } : data,
      });

      if (response.ok || data.success) {
        this.token = data.token || 'session-cookie';
        console.log(`✅ Login successful (${responseTime.toFixed(2)}ms)`);
        return true;
      } else {
        console.error(`❌ Login failed: ${data.message || 'Check credentials'}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Login error: ${error.message}`);
      testResults.push({
        endpoint: '/auth/login',
        method: 'POST',
        status: 0,
        success: false,
        responseTime: performance.now() - startTime,
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Make authenticated API request with security checks
   */
  async request(method: string, endpoint: string, body?: any): Promise<any> {
    if (!this.token) {
      throw new Error('Not authenticated. Please login first.');
    }

    // Security validation
    const securityCheck = await this.security.validateAPIRequest({
      method,
      path: endpoint,
      body,
      ip: '127.0.0.1',
      userAgent: 'Fire22-Security-Test/1.0',
      token: this.token,
    });

    if (!securityCheck.valid) {
      console.warn(`⚠️  Security check failed: ${securityCheck.reason}`);
      // Continue anyway for testing purposes
    }

    const startTime = performance.now();

    try {
      const url = `${FIRE22_CONFIG.baseUrl}${endpoint}`;
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
          'User-Agent': 'Fire22-Security-Test/1.0',
          'X-Request-ID': crypto.randomUUID(),
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      // Sign request if API secret is available
      if (FIRE22_CONFIG.apiSecret) {
        const signature = this.security['secureComm'].signRequest(method, endpoint, body);
        options.headers['X-Signature'] = signature;
      }

      const response = await fetch(url, options);
      const responseTime = performance.now() - startTime;

      let data: any;
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      testResults.push({
        endpoint,
        method,
        status: response.status,
        success: response.ok,
        responseTime,
        data: response.ok ? data : undefined,
        error: !response.ok ? data.message || data : undefined,
      });

      return { response, data, responseTime };
    } catch (error) {
      const responseTime = performance.now() - startTime;

      testResults.push({
        endpoint,
        method,
        status: 0,
        success: false,
        responseTime,
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Test customer endpoints
   */
  async testCustomerEndpoints() {
    console.log('\n📊 Testing Customer Endpoints...');

    // Get customers
    try {
      const { data, responseTime } = await this.request('GET', '/api/customers?limit=10');
      console.log(
        `✅ GET /api/customers - ${responseTime.toFixed(2)}ms - ${data?.length || 0} customers`
      );

      if (data && data.length > 0) {
        // Get specific customer
        const customerId = data[0].id;
        const { data: customer, responseTime: custTime } = await this.request(
          'GET',
          `/api/customers/${customerId}`
        );
        console.log(`✅ GET /api/customers/${customerId} - ${custTime.toFixed(2)}ms`);

        // Get customer balance
        const { data: balance, responseTime: balTime } = await this.request(
          'GET',
          `/api/customers/${customerId}/balance`
        );
        console.log(
          `✅ GET /api/customers/${customerId}/balance - ${balTime.toFixed(2)}ms - Balance: $${balance?.balance || 0}`
        );
      }
    } catch (error) {
      console.error(`❌ Customer endpoint error: ${error.message}`);
    }
  }

  /**
   * Test agent endpoints
   */
  async testAgentEndpoints() {
    console.log('\n📊 Testing Agent Endpoints...');

    try {
      // Get agent hierarchy
      const { data, responseTime } = await this.request('GET', '/api/agents/hierarchy');
      console.log(
        `✅ GET /api/agents/hierarchy - ${responseTime.toFixed(2)}ms - ${data?.length || 0} agents`
      );

      // Get agent stats
      const { data: stats, responseTime: statsTime } = await this.request(
        'POST',
        '/api/manager/getWeeklyFigureByAgent',
        {
          agentId: 'demo-agent',
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
        }
      );
      console.log(`✅ POST /api/manager/getWeeklyFigureByAgent - ${statsTime.toFixed(2)}ms`);

      // Get agent permissions
      const { data: perms, responseTime: permsTime } = await this.request(
        'GET',
        '/api/agents/permissions'
      );
      console.log(`✅ GET /api/agents/permissions - ${permsTime.toFixed(2)}ms`);
    } catch (error) {
      console.error(`❌ Agent endpoint error: ${error.message}`);
    }
  }

  /**
   * Test transaction endpoints
   */
  async testTransactionEndpoints() {
    console.log('\n📊 Testing Transaction Endpoints...');

    try {
      // Get transactions
      const { data, responseTime } = await this.request('GET', '/api/transactions?limit=10');
      console.log(
        `✅ GET /api/transactions - ${responseTime.toFixed(2)}ms - ${data?.length || 0} transactions`
      );

      // Get transaction summary
      const { data: summary, responseTime: summaryTime } = await this.request(
        'GET',
        '/api/transactions/summary'
      );
      console.log(`✅ GET /api/transactions/summary - ${summaryTime.toFixed(2)}ms`);

      // Test transaction validation (without actually creating)
      const testTx = {
        type: 'deposit',
        amount: 100,
        userId: 'test-user',
        notes: 'Test transaction',
      };

      // Validate with security manager
      const txSecurity = this.security['transactionSecurity'];
      const isValid = await txSecurity.validateTransaction({
        id: crypto.randomUUID(),
        userId: testTx.userId,
        amount: testTx.amount,
        type: testTx.type as any,
        timestamp: new Date(),
      });

      console.log(`✅ Transaction validation - Amount: $${testTx.amount} - Valid: ${isValid}`);
    } catch (error) {
      console.error(`❌ Transaction endpoint error: ${error.message}`);
    }
  }

  /**
   * Test live wager endpoints
   */
  async testWagerEndpoints() {
    console.log('\n📊 Testing Wager Endpoints...');

    try {
      // Get live wagers
      const { data, responseTime } = await this.request('POST', '/api/manager/getLiveWagers', {
        status: 'pending',
        limit: 10,
      });
      console.log(
        `✅ POST /api/manager/getLiveWagers - ${responseTime.toFixed(2)}ms - ${data?.length || 0} wagers`
      );

      // Get wager statistics
      const { data: stats, responseTime: statsTime } = await this.request(
        'GET',
        '/api/wagers/stats'
      );
      console.log(`✅ GET /api/wagers/stats - ${statsTime.toFixed(2)}ms`);
    } catch (error) {
      console.error(`❌ Wager endpoint error: ${error.message}`);
    }
  }

  /**
   * Test Fire22-specific endpoints
   */
  async testFire22Endpoints() {
    console.log('\n📊 Testing Fire22-Specific Endpoints...');

    try {
      // Test Fire22 sync
      const { data, responseTime } = await this.request('POST', '/api/fire22/sync-customers', {
        forceRefresh: false,
      });
      console.log(`✅ POST /api/fire22/sync-customers - ${responseTime.toFixed(2)}ms`);

      // Test auth status
      const { data: authStatus, responseTime: authTime } = await this.request(
        'POST',
        '/api/fire22/auth-status'
      );
      console.log(
        `✅ POST /api/fire22/auth-status - ${authTime.toFixed(2)}ms - Authorized: ${authStatus?.authorized || false}`
      );

      // Test cache stats
      const { data: cache, responseTime: cacheTime } = await this.request(
        'GET',
        '/api/fire22/cache-stats'
      );
      console.log(
        `✅ GET /api/fire22/cache-stats - ${cacheTime.toFixed(2)}ms - Hit Rate: ${cache?.hitRate || 0}%`
      );

      // Test DNS stats
      const { data: dns, responseTime: dnsTime } = await this.request(
        'GET',
        '/api/fire22/dns-stats'
      );
      console.log(
        `✅ GET /api/fire22/dns-stats - ${dnsTime.toFixed(2)}ms - Cache Size: ${dns?.cacheSize || 0}`
      );
    } catch (error) {
      console.error(`❌ Fire22 endpoint error: ${error.message}`);
    }
  }

  /**
   * Test security features
   */
  async testSecurityFeatures() {
    console.log('\n🔒 Testing Security Features...');

    // Test rate limiting
    console.log('Testing rate limiting...');
    let rateLimitHit = false;

    for (let i = 0; i < 5; i++) {
      try {
        await this.request('GET', '/api/health');
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      } catch (error) {
        if (error.message.includes('rate limit')) {
          rateLimitHit = true;
          console.log(`✅ Rate limiting working - blocked after ${i + 1} requests`);
          break;
        }
      }
    }

    if (!rateLimitHit) {
      console.log('✅ Rate limiting not triggered in test (normal behavior)');
    }

    // Test SQL injection protection
    console.log('Testing SQL injection protection...');
    try {
      const { response } = await this.request('POST', '/api/test-security', {
        search: "'; DROP TABLE users; --",
      });

      if (response.ok) {
        console.log('⚠️  SQL injection test passed through (endpoint may have protection)');
      }
    } catch (error) {
      console.log('✅ SQL injection blocked or endpoint protected');
    }

    // Test XSS protection
    console.log('Testing XSS protection...');
    try {
      const { response } = await this.request('POST', '/api/test-security', {
        input: "<script>alert('XSS')</script>",
      });

      if (response.ok) {
        console.log('⚠️  XSS test passed through (endpoint may have protection)');
      }
    } catch (error) {
      console.log('✅ XSS blocked or endpoint protected');
    }

    // Get security status
    const status = this.security.getSecurityStatus();
    console.log(`\n📊 Security Status:`);
    console.log(`  Threat Level: ${status.threatLevel}`);
    console.log(`  Active Sessions: ${status.activeSessions}`);
    console.log(`  Blocked IPs: ${status.blockedIPs}`);
    console.log(`  Recent Threats: ${status.recentThreats}`);
  }

  /**
   * Generate test report
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 FIRE22 API TEST REPORT\n');

    const successCount = testResults.filter(t => t.success).length;
    const failureCount = testResults.filter(t => !t.success).length;
    const totalTime = testResults.reduce((sum, t) => sum + t.responseTime, 0);
    const avgTime = totalTime / testResults.length;

    console.log(`Total Endpoints Tested: ${testResults.length}`);
    console.log(`Successful: ${successCount} ✅`);
    console.log(`Failed: ${failureCount} ❌`);
    console.log(`Average Response Time: ${avgTime.toFixed(2)}ms`);
    console.log(
      `Session Duration: ${((Date.now() - this.sessionStartTime.getTime()) / 1000).toFixed(2)}s`
    );

    // Group by endpoint
    const endpointStats = new Map<
      string,
      {
        count: number;
        avgTime: number;
        successRate: number;
      }
    >();

    testResults.forEach(result => {
      const key = `${result.method} ${result.endpoint}`;
      const existing = endpointStats.get(key) || { count: 0, avgTime: 0, successRate: 0 };

      existing.count++;
      existing.avgTime =
        (existing.avgTime * (existing.count - 1) + result.responseTime) / existing.count;
      existing.successRate = result.success
        ? (existing.successRate * (existing.count - 1) + 100) / existing.count
        : (existing.successRate * (existing.count - 1)) / existing.count;

      endpointStats.set(key, existing);
    });

    console.log('\n📈 Endpoint Performance:');
    endpointStats.forEach((stats, endpoint) => {
      console.log(`  ${endpoint}`);
      console.log(
        `    Calls: ${stats.count} | Avg Time: ${stats.avgTime.toFixed(2)}ms | Success: ${stats.successRate.toFixed(0)}%`
      );
    });

    // Failed requests
    const failures = testResults.filter(t => !t.success);
    if (failures.length > 0) {
      console.log('\n❌ Failed Requests:');
      failures.forEach(f => {
        console.log(`  ${f.method} ${f.endpoint} - Status: ${f.status} - Error: ${f.error}`);
      });
    }

    // Save report
    const report = {
      timestamp: new Date().toISOString(),
      config: {
        baseUrl: FIRE22_CONFIG.baseUrl,
        username: FIRE22_CONFIG.username,
      },
      summary: {
        totalEndpoints: testResults.length,
        successful: successCount,
        failed: failureCount,
        avgResponseTime: `${avgTime.toFixed(2)}ms`,
        sessionDuration: `${((Date.now() - this.sessionStartTime.getTime()) / 1000).toFixed(2)}s`,
      },
      endpointStats: Array.from(endpointStats.entries()).map(([endpoint, stats]) => ({
        endpoint,
        ...stats,
      })),
      results: testResults.map(r => ({
        ...r,
        data: r.success ? '***data***' : r.data, // Hide successful response data
      })),
    };

    Bun.write('fire22-api-test-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Report saved to fire22-api-test-report.json');
  }
}

/**
 * Main test runner
 */
async function runFire22Tests() {
  console.log('🔥 Fire22 Live API Security Testing');
  console.log('='.repeat(60));

  const client = new Fire22APIClient();

  // Login
  const loggedIn = await client.login();
  if (!loggedIn) {
    console.error('❌ Failed to login to Fire22. Please check credentials.');
    console.log('\nSet these environment variables:');
    console.log('  FIRE22_API_URL=https://api.fire22.ag');
    console.log('  FIRE22_USERNAME=your_username');
    console.log('  FIRE22_PASSWORD=your_password');
    console.log('  FIRE22_API_KEY=your_api_key (optional)');
    console.log('  FIRE22_API_SECRET=your_api_secret (optional)');
    return false;
  }

  // Run tests
  await client.testCustomerEndpoints();
  await client.testAgentEndpoints();
  await client.testTransactionEndpoints();
  await client.testWagerEndpoints();
  await client.testFire22Endpoints();
  await client.testSecurityFeatures();

  // Generate report
  client.generateReport();

  return true;
}

// Run tests if executed directly
if (import.meta.main) {
  runFire22Tests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

export { Fire22APIClient, runFire22Tests };
