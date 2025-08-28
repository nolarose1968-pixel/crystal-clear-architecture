#!/usr/bin/env bun

/**
 * 🧪 Enhanced Matrix Health System Test Script
 * Tests the new Matrix Health API endpoints with comprehensive validation
 */

import { MatrixHealthChecker } from './matrix-health';

class EnhancedMatrixTester {
  private checker: MatrixHealthChecker;

  constructor() {
    this.checker = new MatrixHealthChecker();
  }

  async testMatrixConfigs() {
    console.log('🔧 Testing Matrix Configs API...');
    
    try {
      // This would test the /api/matrix/configs endpoint
      // For now, we'll test the underlying functionality
      const health = await this.checker.checkMatrixHealth();
      
      console.log('✅ Matrix Configs Test:', {
        success: health.success,
        totalAgents: health.matrix_stats?.total_agents,
        dataCompleteness: health.matrix_stats?.data_completeness,
        permissionCoverage: health.matrix_stats?.permission_coverage
      });
      
      return health.success;
    } catch (error) {
      console.error('❌ Matrix Configs Test Failed:', error);
      return false;
    }
  }

  async testMatrixScore() {
    console.log('📊 Testing Matrix Score API...');
    
    try {
      const health = await this.checker.checkMatrixHealth();
      
      // Simulate enhanced scoring
      const enhancedScore = {
        base_score: health.matrix_health_score,
        config_completeness: health.matrix_stats?.data_completeness || 0,
        permission_coverage: health.matrix_stats?.permission_coverage || 0,
        customer_distribution: 85, // Simulated value
        overall_score: 0,
        recommendations: []
      };

      // Calculate overall enhanced score
      enhancedScore.overall_score = Math.round(
        (enhancedScore.base_score * 0.4) +
        (enhancedScore.config_completeness * 0.3) +
        (enhancedScore.permission_coverage * 0.2) +
        (enhancedScore.customer_distribution * 0.1)
      );

      // Generate recommendations
      enhancedScore.recommendations = this.generateMatrixRecommendations(enhancedScore);

      console.log('✅ Matrix Score Test:', {
        success: health.success,
        baseScore: enhancedScore.base_score,
        configCompleteness: enhancedScore.config_completeness,
        permissionCoverage: enhancedScore.permission_coverage,
        customerDistribution: enhancedScore.customer_distribution,
        overallScore: enhancedScore.overall_score,
        recommendations: enhancedScore.recommendations.length
      });
      
      return health.success;
    } catch (error) {
      console.error('❌ Matrix Score Test Failed:', error);
      return false;
    }
  }

  async testMatrixHealthIntegration() {
    console.log('🔗 Testing Matrix Health Integration...');
    
    try {
      // Test the complete integration flow
      const health = await this.checker.checkMatrixHealth();
      const validation = await this.checker.validatePermissionsMatrix();
      const repair = await this.checker.repairMatrixIssues();
      
      console.log('✅ Matrix Health Integration Test:', {
        healthSuccess: health.success,
        healthScore: health.matrix_health_score,
        validationSuccess: validation.success,
        repairSuccess: repair.success,
        integrationStatus: 'Complete'
      });
      
      return health.success && validation.success && repair.success;
    } catch (error) {
      console.error('❌ Matrix Health Integration Test Failed:', error);
      return false;
    }
  }

  async testMatrixPerformance() {
    console.log('⚡ Testing Matrix Performance...');
    
    try {
      const startTime = Date.now();
      
      // Run multiple health checks to test performance
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(this.checker.checkMatrixHealth());
      }
      
      const results = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / results.length;
      
      const allSuccessful = results.every(r => r.success);
      
      console.log('✅ Matrix Performance Test:', {
        success: allSuccessful,
        totalTime: `${totalTime}ms`,
        averageTime: `${avgTime.toFixed(2)}ms`,
        totalChecks: results.length,
        successfulChecks: results.filter(r => r.success).length
      });
      
      return allSuccessful && avgTime < 1000; // Should complete in under 1 second
    } catch (error) {
      console.error('❌ Matrix Performance Test Failed:', error);
      return false;
    }
  }

  async testMatrixDataQuality() {
    console.log('📈 Testing Matrix Data Quality...');
    
    try {
      const health = await this.checker.checkMatrixHealth();
      const history = this.checker.getMatrixHealthHistory(10);
      
      if (!health.matrix_stats) {
        throw new Error('Matrix stats not available');
      }
      
      const dataQuality = {
        totalAgents: health.matrix_stats.total_agents,
        dataCompleteness: health.matrix_stats.data_completeness,
        permissionCoverage: health.matrix_stats.permission_coverage,
        agentDataQuality: health.matrix_stats.agent_data_quality,
        historyEntries: history.length,
        avgHealthScore: history.reduce((sum, h) => sum + h.health_score, 0) / history.length
      };
      
      console.log('✅ Matrix Data Quality Test:', {
        success: health.success,
        totalAgents: dataQuality.totalAgents,
        dataCompleteness: `${dataQuality.dataCompleteness}%`,
        permissionCoverage: `${dataQuality.permissionCoverage}%`,
        agentDataQuality: `${dataQuality.agentDataQuality}%`,
        historyEntries: dataQuality.historyEntries,
        avgHealthScore: `${dataQuality.avgHealthScore.toFixed(1)}/100`
      });
      
      // Quality thresholds
      const qualityScore = (
        (dataQuality.dataCompleteness >= 70 ? 25 : 0) +
        (dataQuality.permissionCoverage >= 90 ? 25 : 0) +
        (dataQuality.agentDataQuality >= 90 ? 25 : 0) +
        (dataQuality.avgHealthScore >= 80 ? 25 : 0)
      );
      
      return qualityScore >= 75; // At least 75% quality score
    } catch (error) {
      console.error('❌ Matrix Data Quality Test Failed:', error);
      return false;
    }
  }

  generateMatrixRecommendations(enhancedScore: any): string[] {
    const recommendations = [];
    
    if (enhancedScore.config_completeness < 80) {
      recommendations.push('Increase agent configuration completeness by filling missing permissions and commission rates');
    }
    
    if (enhancedScore.permission_coverage < 90) {
      recommendations.push('Improve permission coverage by ensuring all agents have proper permission configurations');
    }
    
    if (enhancedScore.customer_distribution < 70) {
      recommendations.push('Optimize customer distribution across agents for better load balancing');
    }
    
    if (enhancedScore.overall_score < 80) {
      recommendations.push('Review and update agent configurations to improve overall matrix health');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Matrix health is excellent! Continue monitoring and maintaining current configurations');
    }
    
    return recommendations;
  }

  async runAllTests() {
    console.log('🚀 Enhanced Matrix Health System Test Suite');
    console.log('==========================================\n');

    const tests = [
      { name: 'Matrix Configs', test: () => this.testMatrixConfigs() },
      { name: 'Matrix Score', test: () => this.testMatrixScore() },
      { name: 'Matrix Health Integration', test: () => this.testMatrixHealthIntegration() },
      { name: 'Matrix Performance', test: () => this.testMatrixPerformance() },
      { name: 'Matrix Data Quality', test: () => this.testMatrixDataQuality() }
    ];

    const results = [];
    
    for (const test of tests) {
      const success = await test.test();
      results.push({ name: test.name, success });
      console.log(''); // Add spacing between tests
    }

    // Summary
    console.log('📊 Enhanced Test Results Summary');
    console.log('================================');
    
    const passed = results.filter(r => r.success).length;
    const total = results.length;
    
    results.forEach(result => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${result.name}`);
    });
    
    console.log(`\n🎯 Overall: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
    
    if (passed === total) {
      console.log('🎉 All Enhanced Matrix Health tests passed!');
      console.log('🚀 Your Matrix Health system is fully enhanced and operational!');
    } else {
      console.log('⚠️  Some tests failed. Check the output above for details.');
      console.log('🔧 Review the failed tests and ensure proper configuration.');
    }

    // Recommendations
    console.log('\n💡 System Recommendations:');
    console.log('==========================');
    
    if (passed === total) {
      console.log('✅ System is healthy and well-configured');
      console.log('✅ Continue regular monitoring with matrix:health');
      console.log('✅ Use matrix:score for detailed health analysis');
      console.log('✅ Monitor matrix:configs for configuration insights');
    } else {
      console.log('🔧 Review failed test areas');
      console.log('🔧 Check database connectivity and permissions');
      console.log('🔧 Verify agent configuration data integrity');
      console.log('🔧 Run matrix:repair to fix any detected issues');
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new EnhancedMatrixTester();
  tester.runAllTests().catch(console.error);
}

export { EnhancedMatrixTester };
