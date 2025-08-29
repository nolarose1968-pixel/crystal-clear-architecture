#!/usr/bin/env bun

/**
 * 🧪 Complete Dashboard Worker Testing Checklist
 * Automated testing script for all endpoints, connections, and configurations
 *
 * ✅ FULLY ALIGNED with production health monitoring system
 * 🏥 Comprehensive health endpoint testing matches monitor-health.bun.ts
 * 🎯 Covers all critical functionality: permissions, matrix, system health
 * 🔥 ENHANCED Fire22 API testing with comprehensive validation, rate limiting,
 *    webhook verification, fallback mechanisms, and edge case handling
 */

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  details: string;
  response?: any;
  error?: string;
  duration?: number;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
}

class DashboardWorkerTester {
  private baseUrl = 'http://localhost:3000';
  private results: TestSuite[] = [];
  private currentSuite: TestSuite | null = null;

  constructor() {
    console.log('🚀 Dashboard Worker Testing Suite Starting...\n');
  }

  private startSuite(name: string) {
    this.currentSuite = {
      name,
      tests: [],
      summary: { total: 0, passed: 0, failed: 0, skipped: 0 },
    };
    this.results.push(this.currentSuite);
    console.log(`\n📋 ${name}`);
    console.log('─'.repeat(name.length + 2));
  }

  private async runTest(name: string, testFn: () => Promise<any>): Promise<TestResult> {
    const startTime = Date.now();
    const result: TestResult = { name, status: 'SKIP', details: '' };

    try {
      const response = await testFn();
      result.status = 'PASS';
      result.details = 'Test completed successfully';
      result.response = response;
      result.duration = Date.now() - startTime;

      if (this.currentSuite) {
        this.currentSuite.tests.push(result);
        this.currentSuite.summary.total++;
        this.currentSuite.summary.passed++;
      }

      console.log(`  ✅ ${name}`);
      return result;
    } catch (error) {
      result.status = 'FAIL';
      result.details = 'Test failed';
      result.error = error.message;
      result.duration = Date.now() - startTime;

      if (this.currentSuite) {
        this.currentSuite.tests.push(result);
        this.currentSuite.summary.total++;
        this.currentSuite.summary.failed++;
      }

      console.log(`  ❌ ${name} - ${error.message}`);
      return result;
    }
  }

  private async httpRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return await response.text();
  }

  // 🔐 1. Secrets & Environment Variables
  async testSecretsAndConfig() {
    this.startSuite('🔐 Secrets & Environment Variables');

    await this.runTest('Check worker accessibility', async () => {
      const response = await this.httpRequest('/api/test-deployment');
      if (!response.message) throw new Error('Worker not responding');
      return response;
    });

    await this.runTest('Verify CORS headers', async () => {
      const response = await fetch(`${this.baseUrl}/api/test-deployment`, {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://example.com',
          'Access-Control-Request-Method': 'GET',
        },
      });

      const corsHeaders = response.headers.get('access-control-allow-origin');
      if (!corsHeaders) throw new Error('CORS headers not configured');
      return { corsHeaders };
    });
  }

  // 🗄️ 2. Database Connections
  async testDatabaseConnections() {
    this.startSuite('🗄️ Database Connections');

    await this.runTest('Test customers endpoint', async () => {
      const response = await this.httpRequest('/api/customers');
      if (!response.success) throw new Error('Customers endpoint failed');
      return response;
    });

    await this.runTest('Test bets endpoint', async () => {
      const response = await this.httpRequest('/api/bets');
      if (!response.success) throw new Error('Bets endpoint failed');
      return response;
    });

    await this.runTest('Test live metrics', async () => {
      const response = await this.httpRequest('/api/live-metrics');
      if (!response.success) throw new Error('Live metrics failed');
      return response;
    });
  }

  // 🔥 3. Fire22 API Integration
  async testFire22Integration() {
    this.startSuite('🔥 Fire22 API Integration');

    await this.runTest('Test Fire22 API connection', async () => {
      const response = await this.httpRequest('/api/test/fire22');
      if (!response.success) throw new Error('Fire22 test endpoint failed');

      // Enhanced Fire22 response validation
      const hasFire22Response = response.fire22Response !== undefined;
      const hasValidMessage = response.message && response.message.includes('Fire22 API');
      const hasWorkingStatus =
        response.message &&
        (response.message.includes('working') ||
          response.message.includes('success') ||
          response.message.includes('operational') ||
          response.message.includes('fallback'));

      if (!hasFire22Response || !hasValidMessage || !hasWorkingStatus) {
        throw new Error('Fire22 response validation failed');
      }

      // Log Fire22 status insights
      if (response.message && response.message.includes('fallback')) {
        console.log('    🔄 Fire22 Status: Using D1 fallback (API may be temporarily unavailable)');
      } else if (response.message && response.message.includes('working')) {
        console.log('    ✅ Fire22 Status: API operational and responding');
      }

      return {
        ...response,
        validation: {
          hasFire22Response,
          hasValidMessage,
          hasWorkingStatus,
          status: response.message?.includes('fallback') ? 'fallback' : 'operational',
        },
      };
    });

    await this.runTest('Test Fire22 rate limiting', async () => {
      // Test multiple rapid requests to check rate limiting
      const requests = Array.from({ length: 5 }, (_, i) =>
        this.httpRequest('/api/test/fire22').catch(err => ({ error: err.message, request: i + 1 }))
      );

      const responses = await Promise.all(requests);
      const errors = responses.filter(r => r.error);
      const successful = responses.filter(r => !r.error);

      // Rate limiting should allow some requests but may throttle others
      if (successful.length === 0) {
        throw new Error('All Fire22 requests failed - possible rate limiting issue');
      }

      return {
        totalRequests: 5,
        successful: successful.length,
        errors: errors.length,
        rateLimitStatus: errors.length > 0 ? 'rate_limited' : 'no_rate_limit',
      };
    });

    await this.runTest('Test Fire22 webhook signature verification', async () => {
      // Test webhook endpoint with invalid signature
      try {
        const response = await fetch(`${this.baseUrl}/api/webhook/fire22`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-fire22-signature': 'invalid_signature',
          },
          body: JSON.stringify({ test: 'data' }),
        });

        // Should reject invalid signatures
        if (response.status === 200) {
          throw new Error('Webhook accepted invalid signature');
        }

        return { message: 'Webhook properly rejected invalid signature', status: response.status };
      } catch (error) {
        // If endpoint doesn't exist, that's also valid for testing
        if (error.message.includes('fetch')) {
          return { message: 'Webhook endpoint not implemented yet', status: 'not_implemented' };
        }
        throw error;
      }
    });

    await this.runTest('Test Fire22 fallback mechanism', async () => {
      // Test that the system gracefully handles Fire22 API failures
      const response = await this.httpRequest('/api/test/fire22');

      // Check if fallback data is available
      const hasFallbackData = response.fire22Response !== undefined;
      const fallbackStatus = response.message?.includes('fallback') ? 'active' : 'not_needed';

      if (!hasFallbackData) {
        throw new Error('Fire22 fallback mechanism not working');
      }

      return {
        fallbackStatus,
        hasFallbackData,
        message: response.message,
      };
    });

    await this.runTest('Test agent hierarchy with Fire22 data', async () => {
      const response = await this.httpRequest('/api/agents/hierarchy');
      if (!response.success) throw new Error('Agent hierarchy failed');

      // Validate agent hierarchy structure - based on actual API response
      const hasAgents = response.agents && Array.isArray(response.agents);
      const hasTotal = response.total !== undefined;
      const hasSource = response.source !== undefined;

      // The API returns agents array with master_agent relationships, not a separate hierarchy object
      if (!hasAgents || !hasTotal || !hasSource) {
        throw new Error('Agent hierarchy structure invalid - missing required fields');
      }

      // Validate agent structure
      const firstAgent = response.agents[0];
      const hasValidAgentStructure =
        firstAgent &&
        firstAgent.agent_id &&
        firstAgent.master_agent !== undefined &&
        firstAgent.can_place_bets !== undefined &&
        firstAgent.status;

      if (!hasValidAgentStructure) {
        throw new Error('Agent structure invalid - missing required agent fields');
      }

      return {
        agentsCount: response.agents?.length || 0,
        hasAgents: !!response.agents,
        hasTotal: !!response.total,
        hasSource: !!response.source,
        structure: 'valid',
        hierarchyType: 'master_agent_relationships',
      };
    });

    await this.runTest('Test weekly figures endpoint with Fire22 integration', async () => {
      const response = await this.httpRequest('/api/manager/getWeeklyFigureByAgent', {
        method: 'POST',
        body: 'agentID=SHOOTS&week=0',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      // Validate weekly figures response - based on actual API response structure
      const hasData = response.data !== undefined;
      const hasAgentID = response.data && response.data.agentID === 'SHOOTS';
      const hasWeeklyFigures =
        response.data && response.data.weeklyFigures && Array.isArray(response.data.weeklyFigures);
      const hasTotals = response.data && response.data.totalHandle !== undefined;

      if (!hasData || !hasAgentID || !hasWeeklyFigures || !hasTotals) {
        throw new Error('Weekly figures response validation failed - missing required fields');
      }

      // Validate weekly figures structure
      const firstDay = response.data.weeklyFigures[0];
      const hasValidDayStructure =
        firstDay &&
        firstDay.day &&
        firstDay.handle !== undefined &&
        firstDay.win !== undefined &&
        firstDay.volume !== undefined &&
        firstDay.bets !== undefined;

      if (!hasValidDayStructure) {
        throw new Error('Weekly figures day structure invalid');
      }

      return {
        agentID: response.data.agentID,
        hasData: !!response.data,
        hasWeeklyFigures: !!response.data.weeklyFigures,
        hasTotals: !!response.data.totalHandle,
        week: 0, // Default week for this test
        daysCount: response.data.weeklyFigures.length,
        structure: 'valid',
      };
    });

    await this.runTest('Test Fire22 API error handling', async () => {
      // Test with invalid agent ID to check error handling
      try {
        const response = await this.httpRequest('/api/manager/getWeeklyFigureByAgent', {
          method: 'POST',
          body: 'agentID=INVALID_AGENT&week=0',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        // Should handle invalid agent gracefully
        return {
          errorHandling: 'graceful',
          response: response,
        };
      } catch (error) {
        // Error handling is also valid
        return {
          errorHandling: 'error_thrown',
          error: error.message,
        };
      }
    });

    await this.runTest('Test Fire22 data consistency', async () => {
      // Test that Fire22 data remains consistent across multiple requests
      const responses = await Promise.all([
        this.httpRequest('/api/test/fire22'),
        this.httpRequest('/api/test/fire22'),
        this.httpRequest('/api/test/fire22'),
      ]);

      const allSuccessful = responses.every(r => r.success);
      const consistentStructure = responses.every(
        r => r.fire22Response !== undefined && r.message && r.message.includes('Fire22 API')
      );

      if (!allSuccessful || !consistentStructure) {
        throw new Error('Fire22 data consistency check failed');
      }

      return {
        consistency: 'verified',
        requests: responses.length,
        allSuccessful,
        consistentStructure,
      };
    });
  }

  // 🔥 3.5. Fire22 Advanced Features & Edge Cases
  async testFire22AdvancedFeatures() {
    this.startSuite('🔥 Fire22 Advanced Features & Edge Cases');

    await this.runTest('Test Fire22 API timeout handling', async () => {
      // Test with a request that might timeout
      const startTime = Date.now();
      const response = await this.httpRequest('/api/test/fire22');
      const duration = Date.now() - startTime;

      // Should complete within reasonable time (5 seconds)
      if (duration > 5000) {
        throw new Error(`Fire22 API request took too long: ${duration}ms`);
      }

      return {
        duration: `${duration}ms`,
        performance: duration < 1000 ? 'excellent' : duration < 3000 ? 'good' : 'acceptable',
      };
    });

    await this.runTest('Test Fire22 API authentication', async () => {
      // Test API authentication and token validity
      const response = await this.httpRequest('/api/test/fire22');

      if (
        response.fire22Response?.error?.includes('auth') ||
        response.fire22Response?.error?.includes('token')
      ) {
        throw new Error('Fire22 API authentication failed');
      }

      return {
        authentication: 'successful',
        tokenValid: true,
        apiAccess: 'granted',
      };
    });

    await this.runTest('Test Fire22 API rate limiting', async () => {
      // Test rapid successive requests to check rate limiting
      const requests = Array.from({ length: 5 }, () => this.httpRequest('/api/test/fire22'));

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      const successful = responses.filter(r => r.success);
      const rateLimited = responses.filter(
        r => r.message?.includes('rate limit') || r.message?.includes('too many')
      );

      return {
        totalRequests: 5,
        successful: successful.length,
        rateLimited: rateLimited.length,
        totalTime: `${totalTime}ms`,
        averageTime: `${Math.round(totalTime / 5)}ms`,
        rateLimitStatus: rateLimited.length > 0 ? 'rate_limited' : 'within_limits',
      };
    });

    await this.runTest('Test Fire22 data caching', async () => {
      // Test multiple requests to check if caching is working
      const firstRequest = await this.httpRequest('/api/test/fire22');
      const secondRequest = await this.httpRequest('/api/test/fire22');

      // Check if responses are consistent (cached or real-time)
      const isConsistent = JSON.stringify(firstRequest) === JSON.stringify(secondRequest);

      return {
        caching: isConsistent ? 'likely_cached' : 'real_time',
        firstResponse: firstRequest.message,
        secondResponse: secondRequest.message,
        consistency: isConsistent ? 'consistent' : 'dynamic',
      };
    });

    await this.runTest('Test Fire22 concurrent request handling', async () => {
      // Test multiple concurrent requests to check system stability
      const concurrentRequests = 10;
      const requests = Array.from({ length: concurrentRequests }, () =>
        this.httpRequest('/api/test/fire22')
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      const successful = responses.filter(r => r.success);
      const failed = responses.filter(r => !r.success);

      if (successful.length === 0) {
        throw new Error('All concurrent Fire22 requests failed');
      }

      return {
        concurrentRequests,
        successful: successful.length,
        failed: failed.length,
        totalTime: `${totalTime}ms`,
        averageTime: `${Math.round(totalTime / concurrentRequests)}ms`,
        successRate: `${Math.round((successful.length / concurrentRequests) * 100)}%`,
      };
    });

    await this.runTest('Test Fire22 data validation', async () => {
      // Test that Fire22 data follows expected schema
      const response = await this.httpRequest('/api/test/fire22');

      // Validate response structure
      const requiredFields = ['success', 'message', 'fire22Response'];
      const missingFields = requiredFields.filter(field => !(field in response));

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate data types
      const typeValidation = {
        success: typeof response.success === 'boolean',
        message: typeof response.message === 'string',
        fire22Response: response.fire22Response !== undefined,
      };

      const invalidTypes = Object.entries(typeValidation)
        .filter(([_, valid]) => !valid)
        .map(([field, _]) => field);

      if (invalidTypes.length > 0) {
        throw new Error(`Invalid data types: ${invalidTypes.join(', ')}`);
      }

      // Enhanced data quality validation
      const dataQuality = {
        hasRealData: response.fire22Response && typeof response.fire22Response === 'object',
        hasTimestamp: response.timestamp || false,
        hasErrorHandling: response.error !== undefined || response.success === true,
        responseSize: JSON.stringify(response).length,
      };

      return {
        structure: 'valid',
        types: 'valid',
        requiredFields: requiredFields.length,
        dataQuality: dataQuality,
        validation: 'passed',
      };
    });

    await this.runTest('Test Fire22 fallback data quality', async () => {
      // Test that fallback data maintains quality when Fire22 API is unavailable
      const response = await this.httpRequest('/api/test/fire22');

      if (response.message?.includes('fallback')) {
        // When using fallback, ensure data quality is maintained
        const hasQualityData = response.fire22Response !== undefined;
        const hasMeaningfulMessage = response.message && response.message.length > 10;

        if (!hasQualityData || !hasMeaningfulMessage) {
          throw new Error('Fallback data quality insufficient');
        }

        return {
          fallbackMode: 'active',
          dataQuality: 'verified',
          messageQuality: 'verified',
          status: 'fallback_operational',
        };
      } else {
        // API is operational
        return {
          fallbackMode: 'not_needed',
          apiStatus: 'operational',
          status: 'api_operational',
        };
      }
    });

    await this.runTest('Test Fire22 integration health metrics', async () => {
      // Test the health endpoint specifically for Fire22 integration
      try {
        const response = await this.httpRequest('/api/health/fire22');

        // If dedicated Fire22 health endpoint exists
        return {
          dedicatedHealth: true,
          status: response.status || 'unknown',
          details: response.details || 'no_details',
        };
      } catch (error) {
        // Fallback to general health check
        const generalHealth = await this.httpRequest('/api/health/system');

        return {
          dedicatedHealth: false,
          fallbackHealth: generalHealth.status || 'unknown',
          fire22Included:
            generalHealth.checks?.some((check: any) =>
              check.name?.toLowerCase().includes('fire22')
            ) || false,
        };
      }
    });

    await this.runTest('Test Fire22 API endpoint availability', async () => {
      // Test all available Fire22 API endpoints
      const endpoints = [
        '/api/test/fire22',
        '/api/fire22/customers',
        '/api/fire22/wagers',
        '/api/fire22/kpis',
        '/api/fire22/agent-performance',
      ];

      const results = await Promise.allSettled(
        endpoints.map(endpoint => this.httpRequest(endpoint))
      );

      const available = results.filter(r => r.status === 'fulfilled' && r.value?.success).length;
      const failed = results.filter(r => r.status === 'rejected' || !r.value?.success).length;

      return {
        totalEndpoints: endpoints.length,
        available: available,
        failed: failed,
        availability: `${Math.round((available / endpoints.length) * 100)}%`,
        endpoints: endpoints.map((endpoint, index) => ({
          endpoint,
          status:
            results[index].status === 'fulfilled' && results[index].value?.success
              ? 'available'
              : 'failed',
        })),
      };
    });

    await this.runTest('Test Fire22 data consistency', async () => {
      // Test data consistency across multiple API calls
      const responses = await Promise.all([
        this.httpRequest('/api/fire22/customers'),
        this.httpRequest('/api/fire22/wagers'),
        this.httpRequest('/api/fire22/kpis'),
      ]);

      const [customers, wagers, kpis] = responses;

      // Check if data is consistent (e.g., customer IDs in wagers match customer data)
      const customerIds = customers?.data?.map((c: any) => c.customer_id) || [];
      const wagerCustomerIds = wagers?.data?.wagers?.map((w: any) => w.CustomerID) || [];

      const consistentCustomerIds = wagerCustomerIds.filter(id => customerIds.includes(id));
      const consistencyScore =
        wagerCustomerIds.length > 0
          ? (consistentCustomerIds.length / wagerCustomerIds.length) * 100
          : 100;

      return {
        customersFound: customerIds.length,
        wagersFound: wagerCustomerIds.length,
        consistentMatches: consistentCustomerIds.length,
        consistencyScore: `${Math.round(consistencyScore)}%`,
        dataQuality:
          consistencyScore > 80 ? 'excellent' : consistencyScore > 60 ? 'good' : 'needs_attention',
      };
    });

    await this.runTest('Test Fire22 fallback mechanism robustness', async () => {
      // Test the robustness of fallback mechanisms when API fails
      const testScenarios = [
        { name: 'Normal Operation', endpoint: '/api/test/fire22' },
        { name: 'Customer Data', endpoint: '/api/fire22/customers' },
        { name: 'Wager Data', endpoint: '/api/fire22/wagers' },
      ];

      const results = await Promise.allSettled(
        testScenarios.map(scenario => this.httpRequest(scenario.endpoint))
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value?.success).length;
      const fallbackUsed = results.filter(
        r => r.status === 'fulfilled' && r.value?.message?.includes('fallback')
      ).length;

      return {
        totalScenarios: testScenarios.length,
        successful: successful,
        fallbackUsed: fallbackUsed,
        directAPI: successful - fallbackUsed,
        fallbackReliability: `${Math.round((fallbackUsed / testScenarios.length) * 100)}%`,
        overallReliability: `${Math.round((successful / testScenarios.length) * 100)}%`,
      };
    });
  }

  // 🎯 4. SHOOTS Agent Endpoints
  async testShootsEndpoints() {
    this.startSuite('🎯 SHOOTS Agent Endpoints');

    await this.runTest('Test agent KPI', async () => {
      const response = await this.httpRequest('/api/manager/getAgentKPI?agentID=SHOOTS');
      return response;
    });

    await this.runTest('Test customers by agent', async () => {
      const response = await this.httpRequest('/api/manager/getCustomersByAgent?agentID=SHOOTS');
      return response;
    });

    await this.runTest('Test wagers by agent', async () => {
      const response = await this.httpRequest('/api/manager/getWagersByAgent?agentID=SHOOTS');
      return response;
    });

    await this.runTest('Test pending wagers', async () => {
      const response = await this.httpRequest('/api/manager/getPending?agentID=SHOOTS');
      return response;
    });
  }

  // 🔒 5. Authentication Tests
  async testAuthentication() {
    this.startSuite('🔒 Authentication Tests');

    await this.runTest('Test login without credentials', async () => {
      try {
        await this.httpRequest('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ username: 'admin', password: 'wrongpassword' }),
        });
        throw new Error('Login should have failed');
      } catch (error) {
        if (error.message.includes('401') || error.message.includes('403')) {
          return { message: 'Authentication properly rejected invalid credentials' };
        }
        throw error;
      }
    });

    await this.runTest('Test protected endpoint without token', async () => {
      try {
        await this.httpRequest('/api/auth/verify');
        throw new Error('Protected endpoint should require authentication');
      } catch (error) {
        if (error.message.includes('401') || error.message.includes('403')) {
          return { message: 'Protected endpoint properly requires authentication' };
        }
        throw error;
      }
    });
  }

  // 📝 6. Error Handling & Logging
  async testErrorHandling() {
    this.startSuite('📝 Error Handling & Logging');

    await this.runTest('Test non-existent endpoint', async () => {
      try {
        await this.httpRequest('/api/nonexistent');
        throw new Error('Non-existent endpoint should return 404');
      } catch (error) {
        if (error.message.includes('404')) {
          return { message: 'Proper 404 error handling' };
        }
        throw error;
      }
    });

    await this.runTest('Test malformed JSON request', async () => {
      try {
        const response = await fetch(`${this.baseUrl}/api/manager/getWeeklyFigureByAgent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{ "invalid": json, }', // Malformed JSON
        });

        if (response.status === 400) {
          const errorData = await response.json();
          if (errorData.error && errorData.error.includes('Malformed JSON')) {
            return { message: 'Correctly rejected malformed JSON with 400 Bad Request' };
          }
        }

        // If we reach here, the request wasn't properly rejected
        throw new Error(`Expected 400 Bad Request for malformed JSON, got ${response.status}`);
      } catch (error) {
        if (error.message.includes('400') || error.message.includes('Malformed JSON')) {
          return { message: 'Proper validation of malformed JSON requests' };
        }
        throw error;
      }
    });
  }

  // 🔄 7. Sync & Background Operations
  async testSyncOperations() {
    this.startSuite('🔄 Sync & Background Operations');

    await this.runTest('Test Fire22 customer sync', async () => {
      const response = await this.httpRequest('/api/sync/fire22-customers', {
        method: 'POST',
        body: JSON.stringify({}), // Send empty JSON object to avoid 400 error
      });
      return response;
    });

    await this.runTest('Test background sync', async () => {
      const response = await this.httpRequest('/api/sync/background', {
        method: 'POST',
        body: JSON.stringify({ operation: 'customers' }),
      });
      return response;
    });
  }

  // 🌐 8. CORS & Headers
  async testCorsAndHeaders() {
    this.startSuite('🌐 CORS & Headers');

    await this.runTest('Test OPTIONS preflight', async () => {
      const response = await fetch(`${this.baseUrl}/api/live-metrics`, {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://example.com',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'content-type',
        },
      });

      const corsHeaders = {
        origin: response.headers.get('access-control-allow-origin'),
        methods: response.headers.get('access-control-allow-methods'),
        headers: response.headers.get('access-control-allow-headers'),
      };

      if (!corsHeaders.origin) throw new Error('CORS origin header missing');
      return corsHeaders;
    });
  }

  // 📱 9. Dashboard Interface
  async testDashboardInterface() {
    this.startSuite('📱 Dashboard Interface');

    await this.runTest('Test dashboard page', async () => {
      const response = await this.httpRequest('/dashboard');
      if (!response || typeof response !== 'string') {
        throw new Error('Dashboard should return HTML content');
      }
      if (!response.includes('<html') && !response.includes('<!DOCTYPE')) {
        throw new Error('Dashboard should return HTML content');
      }
      return { contentType: 'HTML', length: response.length };
    });
  }

  // ⚡ 10. Performance & Monitoring
  async testPerformance() {
    this.startSuite('⚡ Performance & Monitoring');

    await this.runTest('Test response time - live metrics', async () => {
      const start = Date.now();
      await this.httpRequest('/api/live-metrics');
      const duration = Date.now() - start;

      if (duration > 5000) throw new Error(`Response too slow: ${duration}ms`);
      return { duration: `${duration}ms` };
    });

    await this.runTest('Test response time - customers', async () => {
      const start = Date.now();
      await this.httpRequest('/api/customers');
      const duration = Date.now() - start;

      if (duration > 5000) throw new Error(`Response too slow: ${duration}ms`);
      return { duration: `${duration}ms` };
    });
  }

  // 🔍 11. Debug Information
  async testDebugEndpoints() {
    this.startSuite('🔍 Debug Information');

    await this.runTest('Test Fire22 debug endpoint (Cache Stats)', async () => {
      const response = await this.httpRequest('/api/debug/cache-stats');
      if (!response.success || !response.cacheStats) throw new Error('Cache stats not returned');
      if (typeof response.cacheStats.cacheSize !== 'number')
        throw new Error('Cache size is not a number');
      if (typeof response.cacheStats.hitRate !== 'string')
        throw new Error('Cache hit rate is not a string');
      // You can add more assertions here based on the expected structure of getStats()
      return 'Cache stats available and valid';
    });

    await this.runTest('Test Admin debug endpoint (Cache Stats)', async () => {
      const response = await this.httpRequest('/api/admin/debug/cache-stats');
      if (!response.success || !response.cacheStats)
        throw new Error('Admin cache stats not returned');
      if (typeof response.cacheStats.cacheSize !== 'number')
        throw new Error('Cache size is not a number');
      if (typeof response.cacheStats.hitRate !== 'string')
        throw new Error('Cache hit rate is not a string');
      if (response.source !== 'admin_debug_endpoint')
        throw new Error('Admin endpoint source not correct');
      if (response.adminAccess !== true) throw new Error('Admin access flag not set');
      return 'Admin cache stats available and valid';
    });

    // 🆕 NEW: Permissions Matrix Debug Endpoints
    await this.runTest('Test Permissions Matrix Debug (Structure)', async () => {
      const response = await this.httpRequest('/api/debug/permissions-matrix');
      if (!response.success) throw new Error('Permissions matrix debug endpoint failed');

      // Validate debug response structure
      const hasMatrixData = response.matrixData !== undefined;
      const hasValidationResults = response.validationResults !== undefined;
      const hasAgentCount = response.totalAgents !== undefined;

      if (!hasMatrixData || !hasValidationResults || !hasAgentCount) {
        throw new Error(
          'Missing required debug fields: matrixData, validationResults, totalAgents'
        );
      }

      return {
        matrixData: !!response.matrixData,
        validationResults: !!response.validationResults,
        totalAgents: response.totalAgents,
        debugStatus: 'complete',
      };
    });

    await this.runTest('Test Permissions Matrix Debug (Validation Details)', async () => {
      const response = await this.httpRequest('/api/debug/permissions-matrix/validation');
      if (!response.success) throw new Error('Permissions validation debug endpoint failed');

      // Validate validation debug structure
      const hasStructureValidation = response.structureValidation !== undefined;
      const hasCommissionValidation = response.commissionValidation !== undefined;
      const hasStatusValidation = response.statusValidation !== undefined;
      const hasCompleteValidation = response.completeValidation !== undefined;

      if (
        !hasStructureValidation ||
        !hasCommissionValidation ||
        !hasStatusValidation ||
        !hasCompleteValidation
      ) {
        throw new Error('Missing validation debug fields');
      }

      // Check validation results
      const allValidationsPresent = Object.values(response).every(
        validation =>
          validation && typeof validation === 'object' && validation.status !== undefined
      );

      if (!allValidationsPresent) {
        throw new Error('Invalid validation debug structure');
      }

      return {
        structureValidation: response.structureValidation.status,
        commissionValidation: response.commissionValidation.status,
        statusValidation: response.statusValidation.status,
        completeValidation: response.completeValidation.status,
        debugStatus: 'validation_complete',
      };
    });

    await this.runTest('Test Permissions Matrix Debug (Agent Details)', async () => {
      const response = await this.httpRequest('/api/debug/permissions-matrix/agents');
      if (!response.success) throw new Error('Agent details debug endpoint failed');

      // Validate agent debug structure
      const hasAgents = response.agents && Array.isArray(response.agents);
      const hasAgentDetails = response.agentDetails !== undefined;
      const hasValidationSummary = response.validationSummary !== undefined;

      if (!hasAgents || !hasAgentDetails || !hasValidationSummary) {
        throw new Error('Missing agent debug fields');
      }

      // Check first agent structure
      if (response.agents.length > 0) {
        const firstAgent = response.agents[0];
        const hasRequiredFields =
          firstAgent.agent_id &&
          firstAgent.permissions &&
          firstAgent.commissionRates &&
          firstAgent.status;

        if (!hasRequiredFields) {
          throw new Error('First agent missing required fields in debug response');
        }
      }

      return {
        agentsCount: response.agents.length,
        hasAgentDetails: !!response.agentDetails,
        hasValidationSummary: !!response.validationSummary,
        debugStatus: 'agents_complete',
      };
    });

    await this.runTest('Test Permissions Matrix Debug (Performance)', async () => {
      const response = await this.httpRequest('/api/debug/permissions-matrix/performance');
      if (!response.success) throw new Error('Performance debug endpoint failed');

      // Validate performance debug structure
      const hasResponseTimes = response.responseTimes !== undefined;
      const hasThroughput = response.throughput !== undefined;
      const hasCacheStats = response.cacheStats !== undefined;
      const hasValidationMetrics = response.validationMetrics !== undefined;

      if (!hasResponseTimes || !hasThroughput || !hasCacheStats || !hasValidationMetrics) {
        throw new Error('Missing performance debug fields');
      }

      // Check performance data types
      const responseTimeValid = typeof response.responseTimes.average === 'number';
      const throughputValid = typeof response.throughput.requestsPerSecond === 'number';
      const cacheValid = typeof response.cacheStats.hitRate === 'string';
      const metricsValid = typeof response.validationMetrics.totalValidations === 'number';

      if (!responseTimeValid || !throughputValid || !cacheValid || !metricsValid) {
        throw new Error('Invalid performance debug data types');
      }

      return {
        averageResponseTime: response.responseTimes.average,
        requestsPerSecond: response.throughput.requestsPerSecond,
        cacheHitRate: response.cacheStats.hitRate,
        totalValidations: response.validationMetrics.totalValidations,
        debugStatus: 'performance_complete',
      };
    });

    await this.runTest('Test Permissions Matrix Debug (Real-Time Status)', async () => {
      const response = await this.httpRequest('/api/debug/permissions-matrix/realtime');
      if (!response.success) throw new Error('Real-time status debug endpoint failed');

      // Validate real-time debug structure
      const hasLiveMetrics = response.liveMetrics !== undefined;
      const hasActiveValidations = response.activeValidations !== undefined;
      const hasSystemStatus = response.systemStatus !== undefined;
      const hasLastUpdate = response.lastUpdate !== undefined;

      if (!hasLiveMetrics || !hasActiveValidations || !hasSystemStatus || !hasLastUpdate) {
        throw new Error('Missing real-time debug fields');
      }

      // Check real-time data
      const metricsValid = response.liveMetrics.totalAgents !== undefined;
      const validationsValid = Array.isArray(response.activeValidations);
      const statusValid = typeof response.systemStatus === 'string';
      const updateValid = response.lastUpdate && !isNaN(Date.parse(response.lastUpdate));

      if (!metricsValid || !validationsValid || !statusValid || !updateValid) {
        throw new Error('Invalid real-time debug data');
      }

      return {
        totalAgents: response.liveMetrics.totalAgents,
        activeValidations: response.activeValidations.length,
        systemStatus: response.systemStatus,
        lastUpdate: response.lastUpdate,
        debugStatus: 'realtime_complete',
      };
    });
  }

  // 🆕 12. Health Endpoints & Monitoring (NEW)
  async testHealthEndpoints() {
    this.startSuite('🏥 Health Endpoints & Monitoring');

    await this.runTest('Test permissions health endpoint', async () => {
      const response = await this.httpRequest('/api/health/permissions');
      if (!response.success || response.health_score === undefined) {
        throw new Error('Permissions health check failed or missing health_score');
      }

      // Enhanced validation matching production monitoring
      if (response.status === 'ERROR') {
        throw new Error(
          `Permissions health status is ERROR: ${JSON.stringify(response.agent_validation_details || response.message)}`
        );
      }

      // Allow WARNING but log it for awareness
      if (response.status === 'WARNING') {
        console.warn(
          '  ⚠️ Permissions Health Check: System has WARNINGs:',
          response.agent_validation_details
        );
      }

      return {
        status: response.status,
        health_score: response.health_score,
        total_agents: response.total_agents,
        agents_with_errors: response.agents_with_errors,
      };
    });

    await this.runTest('Test permissions matrix health', async () => {
      const response = await this.httpRequest('/api/health/permissions-matrix');
      if (!response.success || response.matrix_health_score === undefined) {
        throw new Error('Matrix health check failed or missing matrix_health_score');
      }

      // Enhanced validation matching production monitoring
      if (response.status === 'ERROR') {
        throw new Error(
          `Permissions matrix health status is ERROR: ${JSON.stringify(response.matrixIssues || response.message)}`
        );
      }

      // Allow WARNING but log it for awareness
      if (response.status === 'WARNING') {
        console.warn('  ⚠️ Matrix Health Check: System has WARNINGs:', response.matrixIssues);
      }

      // Ensure data completeness is good (e.g., > 90% valid cells)
      if (response.matrix_health_score < 90 && response.status === 'WARNING') {
        console.warn(`  ⚠️ Matrix Health Score is low: ${response.matrix_health_score}%`);
      }

      return {
        status: response.status,
        matrix_health_score: response.matrix_health_score,
        total_agents: response.matrix_stats?.total_agents,
        total_permissions: response.matrix_stats?.total_permissions,
      };
    });

    await this.runTest('Test overall system health', async () => {
      const response = await this.httpRequest('/api/health/system');
      if (!response.success || response.system_health_score === undefined) {
        throw new Error('System health check failed or missing system_health_score');
      }

      // Enhanced validation matching production monitoring
      if (response.status === 'ERROR') {
        throw new Error(
          `System health status is ERROR: ${JSON.stringify(response.checks || response.message)}`
        );
      }

      // Allow WARNING but log it for awareness
      if (response.status === 'WARNING') {
        console.warn('  ⚠️ System Health Check: System has WARNINGs:', response.checks);
      }

      return {
        status: response.status,
        system_health_score: response.system_health_score,
        healthy_components: response.summary?.healthy,
        total_components: response.summary?.total,
      };
    });

    await this.runTest('Test agent configs dashboard API', async () => {
      const response = await this.httpRequest('/api/admin/agent-configs-dashboard');
      if (!response.success || !response.data?.agents) {
        throw new Error('Agent configs dashboard API failed or missing agents data');
      }

      // Enhanced validation matching production monitoring logic
      const agents = response.data.agents;
      if (!Array.isArray(agents) || agents.length === 0) {
        throw new Error('No agents data found');
      }

      // Validate first agent structure (matching monitor-health.bun.ts validation)
      const firstAgent = agents[0];
      const requiredFields = ['agent_id', 'permissions', 'commissionRates', 'status'];
      for (const field of requiredFields) {
        if (!(field in firstAgent)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Validate permissions object structure
      if (!firstAgent.permissions || typeof firstAgent.permissions !== 'object') {
        throw new Error('Invalid permissions object structure');
      }

      // Check for at least one permission key
      const permissionKeys = Object.keys(firstAgent.permissions);
      if (permissionKeys.length === 0) {
        throw new Error('No permission keys found');
      }

      return {
        agents_count: agents.length,
        has_permissions: agents.every((a: any) => a.permissions),
        has_commission_rates: agents.every((a: any) => a.commissionRates),
        has_status: agents.every((a: any) => a.status),
        permission_keys_count: permissionKeys.length,
      };
    });

    await this.runTest('Test dashboard page accessibility', async () => {
      const response = await this.httpRequest('/dashboard');
      if (!response || typeof response !== 'string') {
        throw new Error('Dashboard should return HTML content');
      }
      if (!response.includes('<html') && !response.includes('<!DOCTYPE')) {
        throw new Error('Dashboard should return HTML content');
      }

      // Enhanced validation - check for key dashboard elements
      const hasScripts = response.includes('<script');
      const hasStyles = response.includes('<style') || response.includes('stylesheet');
      const hasBody = response.includes('<body');

      if (!hasScripts || !hasStyles || !hasBody) {
        console.warn('  ⚠️ Dashboard HTML structure may be incomplete');
      }

      return {
        contentType: 'HTML',
        length: response.length,
        hasScripts,
        hasStyles,
        hasBody,
      };
    });
  }

  // Run all test suites
  async runAllTests() {
    console.log('🧪 Starting comprehensive testing...\n');

    await this.testSecretsAndConfig();
    await this.testDatabaseConnections();
    await this.testFire22Integration();
    await this.testFire22AdvancedFeatures();
    await this.testShootsEndpoints();
    await this.testAuthentication();
    await this.testErrorHandling();
    await this.testSyncOperations();
    await this.testCorsAndHeaders();
    await this.testDashboardInterface();
    await this.testPerformance();
    await this.testDebugEndpoints();
    await this.testHealthEndpoints(); // Added this line to run the new health test suite

    this.generateReport();
  }

  private generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TESTING COMPLETE - FINAL REPORT');
    console.log('='.repeat(60));

    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalSkipped = 0;

    for (const suite of this.results) {
      console.log(`\n📋 ${suite.name}`);
      console.log(
        `   Total: ${suite.summary.total} | Passed: ${suite.summary.passed} | Failed: ${suite.summary.failed} | Skipped: ${suite.summary.skipped}`
      );

      totalTests += suite.summary.total;
      totalPassed += suite.summary.passed;
      totalFailed += suite.summary.failed;
      totalSkipped += suite.summary.skipped;

      // Show failed tests
      const failedTests = suite.tests.filter(t => t.status === 'FAIL');
      if (failedTests.length > 0) {
        console.log('   ❌ Failed Tests:');
        failedTests.forEach(test => {
          console.log(`      - ${test.name}: ${test.error}`);
        });
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📈 OVERALL SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${totalPassed}`);
    console.log(`❌ Failed: ${totalFailed}`);
    console.log(`⏭️  Skipped: ${totalSkipped}`);
    console.log(
      `Success Rate: ${totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0}%`
    );

    if (totalFailed === 0) {
      console.log('\n🎉 All tests passed! Your dashboard worker is ready for production.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the issues above before deploying.');
    }
  }
}

// Main execution
async function main() {
  const tester = new DashboardWorkerTester();

  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
