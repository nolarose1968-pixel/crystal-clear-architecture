#!/usr/bin/env bun

/**
 * 🧪 Matrix Health API Test Script
 * Tests the new Matrix Health API endpoints
 */

import { MatrixHealthChecker } from './matrix-health';

class MatrixAPITester {
  private checker: MatrixHealthChecker;

  constructor() {
    this.checker = new MatrixHealthChecker();
  }

  async testMatrixHealth() {
    console.log('🔍 Testing Matrix Health API...');

    try {
      const health = await this.checker.checkMatrixHealth();
      console.log('✅ Matrix Health Check:', {
        success: health.success,
        status: health.status,
        score: health.matrix_health_score,
        agents: health.matrix_stats?.total_agents,
        permissions: health.matrix_stats?.total_permissions,
      });
      return health.success;
    } catch (error) {
      console.error('❌ Matrix Health Check Failed:', error);
      return false;
    }
  }

  async testMatrixValidation() {
    console.log('✅ Testing Matrix Validation API...');

    try {
      const validation = await this.checker.validatePermissionsMatrix();
      console.log('✅ Matrix Validation:', {
        success: validation.success,
        message: validation.message,
      });
      return validation.success;
    } catch (error) {
      console.error('❌ Matrix Validation Failed:', error);
      return false;
    }
  }

  async testMatrixRepair() {
    console.log('🔧 Testing Matrix Repair API...');

    try {
      const repair = await this.checker.repairMatrixIssues();
      console.log('✅ Matrix Repair:', {
        success: repair.success,
        issuesFixed: repair.issues_fixed,
        message: repair.message,
      });
      return repair.success;
    } catch (error) {
      console.error('❌ Matrix Repair Failed:', error);
      return false;
    }
  }

  async testMatrixStatus() {
    console.log('📊 Testing Matrix Status API...');

    try {
      const status = await this.checker.checkMatrixHealth();
      console.log('✅ Matrix Status:', {
        success: status.success,
        healthScore: status.matrix_health_score,
        status: status.status,
      });
      return status.success;
    } catch (error) {
      console.error('❌ Matrix Status Failed:', error);
      return false;
    }
  }

  async testMatrixHistory() {
    console.log('📈 Testing Matrix History API...');

    try {
      const history = this.checker.getMatrixHealthHistory(5);
      console.log('✅ Matrix History:', {
        total: history.length,
        latest: history[0]?.check_timestamp,
        avgScore: history.reduce((sum, h) => sum + h.health_score, 0) / history.length,
      });
      return true;
    } catch (error) {
      console.error('❌ Matrix History Failed:', error);
      return false;
    }
  }

  async testMatrixSummary() {
    console.log('📋 Testing Matrix Summary API...');

    try {
      const summary = this.checker.getCurrentMatrixStatus();
      console.log('✅ Matrix Summary:', {
        lastCheck: summary?.last_check,
        avgHealthScore: summary?.avg_health_score,
        avgDataCompleteness: summary?.avg_data_completeness,
      });
      return true;
    } catch (error) {
      console.error('❌ Matrix Summary Failed:', error);
      return false;
    }
  }

  async runAllTests() {
    console.log('🚀 Matrix Health API Test Suite');
    console.log('!==!==!==!==!==!==\n');

    const tests = [
      { name: 'Matrix Health', test: () => this.testMatrixHealth() },
      { name: 'Matrix Validation', test: () => this.testMatrixValidation() },
      { name: 'Matrix Repair', test: () => this.testMatrixRepair() },
      { name: 'Matrix Status', test: () => this.testMatrixStatus() },
      { name: 'Matrix History', test: () => this.testMatrixHistory() },
      { name: 'Matrix Summary', test: () => this.testMatrixSummary() },
    ];

    const results = [];

    for (const test of tests) {
      const success = await test.test();
      results.push({ name: test.name, success });
      console.log(''); // Add spacing between tests
    }

    // Summary
    console.log('📊 Test Results Summary');
    console.log('!==!==!==!====');

    const passed = results.filter(r => r.success).length;
    const total = results.length;

    results.forEach(result => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${result.name}`);
    });

    console.log(
      `\n🎯 Overall: ${passed}/${total} tests passed (${Math.round((passed / total) * 100)}%)`
    );

    if (passed === total) {
      console.log('🎉 All Matrix Health API tests passed!');
    } else {
      console.log('⚠️  Some tests failed. Check the output above for details.');
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new MatrixAPITester();
  tester.runAllTests().catch(console.error);
}

export { MatrixAPITester };
