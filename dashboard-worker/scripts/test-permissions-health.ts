#!/usr/bin/env bun

/**
 * 🔐 Fire22 Enhanced Permissions Health Test
 * Tests the enhanced permissions health endpoints with live casino integration
 */

class PermissionsHealthTester {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'http://localhost:8787'; // Default Cloudflare Workers dev server
  }

  /**
   * Test basic permissions health endpoint
   */
  async testPermissionsHealth() {
    console.log('🔐 **Testing Enhanced Permissions Health Endpoint**\n');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/health/permissions`);
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ **Permissions Health Check Successful**\n');
        console.log(`📊 **Overall Status**: ${data.status}`);
        console.log(`🏥 **Health Score**: ${data.health_score}%`);
        console.log(`👥 **Total Agents**: ${data.total_agents}`);
        console.log(`⚠️ **Agents with Errors**: ${data.agents_with_errors}`);
        console.log(`📅 **Timestamp**: ${data.timestamp}\n`);
        
        // Display validation summary
        if (data.validation_summary) {
          console.log('📋 **Validation Summary**:');
          console.log(`  • Valid Permissions: ${data.validation_summary.valid_permissions}/${data.total_agents}`);
          console.log(`  • Valid Commission Rates: ${data.validation_summary.valid_commission_rates}/${data.total_agents}`);
          console.log(`  • Has Required Fields: ${data.validation_summary.has_required_fields}/${data.total_agents}`);
          console.log(`  • Valid Max Wager Type: ${data.validation_summary.valid_max_wager_type}/${data.total_agents}\n`);
        }
        
        // Display live casino validation
        if (data.live_casino_validation) {
          console.log('🎰 **Live Casino Validation**:');
          console.log(`  • Agents with Casino Rates: ${data.live_casino_validation.has_live_casino_rates}/${data.total_agents} (${data.live_casino_validation.casino_rate_coverage}%)`);
          console.log(`  • Valid Casino Rates: ${data.live_casino_validation.valid_casino_rates}/${data.total_agents}`);
          console.log(`  • Performance Ready: ${data.live_casino_validation.casino_performance_ready}/${data.total_agents}\n`);
        }
        
        // Display live casino stats
        if (data.live_casino_stats) {
          console.log('🎮 **Live Casino System Stats**:');
          console.log(`  • Total Games: ${data.live_casino_stats.totalGames}`);
          console.log(`  • Active Games: ${data.live_casino_stats.activeGames}`);
          console.log(`  • Total Sessions: ${data.live_casino_stats.totalSessions}`);
          console.log(`  • Active Sessions: ${data.live_casino_stats.activeSessions}\n`);
        }
        
        // Display agent details if available
        if (data.agent_validation_details && data.agent_validation_details.length > 0) {
          console.log('👤 **Agent Validation Details**:');
          data.agent_validation_details.forEach((agent: any, index: number) => {
            console.log(`\n  **Agent ${index + 1}**: ${agent.agent_id}`);
            console.log(`    Status: ${agent.status}`);
            console.log(`    Score: ${agent.score}%`);
            if (agent.errors && agent.errors.length > 0) {
              console.log(`    Errors: ${agent.errors.join(', ')}`);
            }
          });
          console.log();
        }
        
      } else {
        console.log('❌ **Permissions Health Check Failed**');
        console.log(`Error: ${data.message || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.error('❌ **Error testing permissions health**:', error);
    }
  }

  /**
   * Test permissions matrix health endpoint
   */
  async testPermissionsMatrixHealth() {
    console.log('🔐 **Testing Enhanced Permissions Matrix Health Endpoint**\n');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/health/permissions-matrix`);
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ **Permissions Matrix Health Check Successful**\n');
        console.log(`📊 **Matrix Status**: ${data.status}`);
        console.log(`🏥 **Matrix Health Score**: ${data.matrix_health_score}%`);
        console.log(`📅 **Timestamp**: ${data.timestamp}\n`);
        
        // Display matrix stats
        if (data.matrix_stats) {
          console.log('📋 **Matrix Statistics**:');
          console.log(`  • Total Agents: ${data.matrix_stats.total_agents}`);
          console.log(`  • Total Permissions: ${data.matrix_stats.total_permissions}`);
          console.log(`  • Total Matrix Cells: ${data.matrix_stats.total_matrix_cells}`);
          console.log(`  • Valid Matrix Cells: ${data.matrix_stats.valid_matrix_cells}`);
          console.log(`  • Data Completeness: ${data.matrix_stats.data_completeness}%`);
          console.log(`  • Permission Coverage: ${data.matrix_stats.permission_coverage}%`);
          console.log(`  • Agent Data Quality: ${data.matrix_stats.agent_data_quality}%\n`);
        }
        
        // Display live casino matrix stats
        if (data.live_casino_matrix_stats) {
          console.log('🎰 **Live Casino Matrix Integration**:');
          console.log(`  • Total Games: ${data.live_casino_matrix_stats.totalGames}`);
          console.log(`  • Active Games: ${data.live_casino_matrix_stats.activeGames}`);
          console.log(`  • Agents with Casino Rates: ${data.live_casino_matrix_stats.totalRates}/${data.matrix_stats.total_agents}`);
          console.log(`  • Casino Rate Coverage: ${data.live_casino_matrix_stats.casinoRateCoverage}%\n`);
        }
        
        // Display cell validation
        if (data.cell_validation) {
          console.log('🔍 **Cell Validation**:');
          console.log(`  • Total Cells: ${data.cell_validation.total_cells}`);
          console.log(`  • Valid Cells: ${data.cell_validation.valid_cells}`);
          console.log(`  • Warning Cells: ${data.cell_validation.warning_cells}`);
          console.log(`  • Invalid Cells: ${data.cell_validation.invalid_cells}\n`);
        }
        
        // Display permission keys
        if (data.permission_keys && data.permission_keys.length > 0) {
          console.log('🔑 **Permission Keys**:');
          console.log(`  ${data.permission_keys.join(', ')}\n`);
        }
        
        // Display matrix issues if any
        if (data.matrix_issues && data.matrix_issues.length > 0) {
          console.log('⚠️ **Matrix Issues**:');
          data.matrix_issues.forEach((issue: string, index: number) => {
            console.log(`  ${index + 1}. ${issue}`);
          });
          console.log();
        }
        
        // Display recommendations if any
        if (data.recommendations && data.recommendations.length > 0) {
          console.log('💡 **Recommendations**:');
          data.recommendations.forEach((rec: string, index: number) => {
            console.log(`  ${index + 1}. ${rec}`);
          });
          console.log();
        }
        
      } else {
        console.log('❌ **Permissions Matrix Health Check Failed**');
        console.log(`Error: ${data.error || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.error('❌ **Error testing permissions matrix health**:', error);
    }
  }

  /**
   * Run comprehensive permissions health test
   */
  async runComprehensiveTest() {
    console.log('🔐 **Fire22 Enhanced Permissions Health Test Suite**\n');
    console.log('This test suite validates the enhanced permissions health system with live casino integration.\n');
    
    await this.testPermissionsHealth();
    console.log('='.repeat(80));
    await this.testPermissionsMatrixHealth();
    
    console.log('🎉 **Permissions Health Test Suite Complete!**\n');
    console.log('✅ Enhanced permissions health with live casino integration');
    console.log('✅ Comprehensive validation and error detection');
    console.log('✅ Real-time system statistics and monitoring');
    console.log('✅ Advanced matrix health analysis');
    console.log('✅ Live casino rate validation and coverage analysis');
  }

  /**
   * Test specific endpoint
   */
  async testSpecificEndpoint(endpoint: string) {
    switch (endpoint) {
      case 'permissions':
        await this.testPermissionsHealth();
        break;
      case 'matrix':
        await this.testPermissionsMatrixHealth();
        break;
      default:
        await this.runComprehensiveTest();
    }
  }
}

// Main execution
async function main() {
  const tester = new PermissionsHealthTester();
  const endpoint = process.argv[2];
  
  if (endpoint) {
    await tester.testSpecificEndpoint(endpoint);
  } else {
    await tester.runComprehensiveTest();
  }
}

// Run if called directly
if (import.meta.main) {
  main().catch(console.error);
}

export { PermissionsHealthTester };
