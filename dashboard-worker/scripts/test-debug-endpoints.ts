#!/usr/bin/env bun

/**
 * 🧪 Debug Endpoints Test Script
 * Tests all five new permissions matrix debug endpoints
 */

interface DebugTestResult {
  endpoint: string;
  status: 'PASS' | 'FAIL';
  responseTime: number;
  details: string;
  data?: any;
  error?: string;
}

class DebugEndpointsTester {
  private baseUrl = 'https://dashboard-worker.brendawill2233.workers.dev';
  private results: DebugTestResult[] = [];

  constructor() {
    console.log('🔍 Testing Permissions Matrix Debug Endpoints...\n');
  }

  private async testEndpoint(endpoint: string, description: string): Promise<DebugTestResult> {
    const startTime = Date.now();
    const result: DebugTestResult = {
      endpoint,
      status: 'FAIL',
      responseTime: 0,
      details: description
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      result.responseTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(`API returned success: false - ${data.error || 'Unknown error'}`);
      }

      // Validate response structure based on endpoint
      this.validateResponseStructure(endpoint, data);
      
      result.status = 'PASS';
      result.data = data;
      result.details = `${description} - Response time: ${result.responseTime}ms`;

    } catch (error) {
      result.status = 'FAIL';
      result.error = error.message;
      result.responseTime = Date.now() - startTime;
    }

    return result;
  }

  private validateResponseStructure(endpoint: string, data: any): void {
    const requiredFields = ['success', 'timestamp', 'endpoint'];
    
    // Check required fields
    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Endpoint-specific validation
    switch (endpoint) {
      case '/api/debug/permissions-matrix':
        if (!data.data || !data.data.totalAgents || !data.data.matrixStructure) {
          throw new Error('Invalid matrix structure response');
        }
        break;

      case '/api/debug/permissions-matrix/validation':
        if (!data.data || !data.data.structureValidation || !data.data.commissionValidation) {
          throw new Error('Invalid validation response');
        }
        break;

      case '/api/debug/permissions-matrix/agents':
        if (!data.data || !data.data.agents || !data.data.agentDetails) {
          throw new Error('Invalid agents response');
        }
        break;

      case '/api/debug/permissions-matrix/performance':
        if (!data.data || !data.data.responseTimes || !data.data.throughput) {
          throw new Error('Invalid performance response');
        }
        break;

      case '/api/debug/permissions-matrix/realtime':
        if (!data.data || !data.data.liveMetrics || !data.data.systemStatus) {
          throw new Error('Invalid realtime response');
        }
        break;
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🧪 Starting debug endpoints testing...\n');

    const tests = [
      {
        endpoint: '/api/debug/permissions-matrix',
        description: 'Matrix Structure Debug'
      },
      {
        endpoint: '/api/debug/permissions-matrix/validation',
        description: 'Validation Details Debug'
      },
      {
        endpoint: '/api/debug/permissions-matrix/agents',
        description: 'Agent Details Debug'
      },
      {
        endpoint: '/api/debug/permissions-matrix/performance',
        description: 'Performance Metrics Debug'
      },
      {
        endpoint: '/api/debug/permissions-matrix/realtime',
        description: 'Real-Time Status Debug'
      }
    ];

    for (const test of tests) {
      const result = await this.testEndpoint(test.endpoint, test.description);
      this.results.push(result);
      
      const statusIcon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${statusIcon} ${test.description}`);
      console.log(`   Endpoint: ${test.endpoint}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Response Time: ${result.responseTime}ms`);
      
      if (result.status === 'FAIL') {
        console.log(`   Error: ${result.error}`);
      } else {
        console.log(`   Details: ${result.details}`);
      }
      
      console.log('');
    }

    this.generateReport();
  }

  private generateReport(): void {
    console.log('📊 Debug Endpoints Test Report');
    console.log('='.repeat(50));

    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.status === 'PASS').length;
    const failedTests = this.results.filter(r => r.status === 'FAIL').length;
    const successRate = Math.round((passedTests / totalTests) * 100);

    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📈 Success Rate: ${successRate}%`);

    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.filter(r => r.status === 'FAIL').forEach(result => {
        console.log(`   - ${result.endpoint}: ${result.error}`);
      });
    }

    // Performance summary
    const avgResponseTime = this.results.reduce((sum, r) => sum + r.responseTime, 0) / totalTests;
    console.log(`\n⚡ Performance Summary:`);
    console.log(`   Average Response Time: ${Math.round(avgResponseTime)}ms`);
    console.log(`   Fastest Response: ${Math.min(...this.results.map(r => r.responseTime))}ms`);
    console.log(`   Slowest Response: ${Math.max(...this.results.map(r => r.responseTime))}ms`);

    if (successRate === 100) {
      console.log('\n🎉 All debug endpoints are working perfectly!');
      console.log('Your Enhanced Permissions Matrix Validation System is fully operational.');
    } else {
      console.log('\n⚠️ Some debug endpoints failed. Please check the errors above.');
    }

    console.log('\n🔗 Next Steps:');
    console.log('   1. Test your interactive validation system in @packages.html');
    console.log('   2. Run comprehensive tests: bun run test:checklist');
    console.log('   3. Monitor production health: bun run monitor');
  }
}

// Main execution
async function main() {
  const tester = new DebugEndpointsTester();
  
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ Debug endpoints testing failed:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
