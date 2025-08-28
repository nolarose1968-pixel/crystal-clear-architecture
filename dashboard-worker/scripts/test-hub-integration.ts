#!/usr/bin/env bun

/**
 * Hub Integration Test Suite
 * 
 * Tests D1, R2, SQLite, and Language system connections to hub at localhost:3000
 */

import { hubConnection } from '../src/config/hub-connection';
import { databaseLinks } from '../src/config/database-links';
import { fire22LanguageWithHub } from '../src/i18n/language-manager';

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  error?: string;
  details?: any;
}

class HubIntegrationTester {
  private results: TestResult[] = [];

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Hub Integration Test Suite');
    console.log('=' .repeat(60));

    // Test hub connection
    await this.testHubConnection();
    
    // Test database links
    await this.testDatabaseLinks();
    
    // Test D1 operations
    await this.testD1Operations();
    
    // Test R2 operations
    await this.testR2Operations();
    
    // Test SQLite sync
    await this.testSQLiteSync();
    
    // Test language system
    await this.testLanguageSystem();
    
    // Print summary
    this.printSummary();
  }

  private async runTest(name: string, testFn: () => Promise<any>): Promise<TestResult> {
    const startTime = performance.now();
    
    try {
      console.log(`\n🔍 Testing: ${name}`);
      const result = await testFn();
      const duration = performance.now() - startTime;
      
      console.log(`✅ ${name}: PASSED (${Math.round(duration)}ms)`);
      
      const testResult: TestResult = {
        name,
        success: true,
        duration,
        details: result
      };
      
      this.results.push(testResult);
      return testResult;
    } catch (error) {
      const duration = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.log(`❌ ${name}: FAILED (${Math.round(duration)}ms)`);
      console.log(`   Error: ${errorMessage}`);
      
      const testResult: TestResult = {
        name,
        success: false,
        duration,
        error: errorMessage
      };
      
      this.results.push(testResult);
      return testResult;
    }
  }

  private async testHubConnection(): Promise<void> {
    await this.runTest('Hub Connection', async () => {
      // Test basic hub connectivity
      const hubUrl = process.env.HUB_URL || 'http://localhost:3001';
      const response = await fetch(`${hubUrl}/health`, {
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        throw new Error(`Hub not available: ${response.status}`);
      }
      
      const healthData = await response.json();
      
      // Test hub connection manager
      const connectionResult = await hubConnection.connectToHub();
      
      if (!connectionResult.success) {
        throw new Error('Hub connection manager failed to connect');
      }
      
      return {
        hubHealth: healthData,
        connections: connectionResult.connections,
        connectedServices: connectionResult.connections.filter(c => c.status === 'connected').length
      };
    });
  }

  private async testDatabaseLinks(): Promise<void> {
    await this.runTest('Database Links Status', async () => {
      const linkStatuses = databaseLinks.getLinkStatus();
      const testResults = await databaseLinks.testAllLinks();
      
      const totalLinks = linkStatuses.length;
      const enabledLinks = linkStatuses.filter(link => link.enabled).length;
      const connectedLinks = Object.values(testResults).filter(test => test.status === 'connected').length;
      
      return {
        totalLinks,
        enabledLinks,
        connectedLinks,
        links: linkStatuses.map(link => ({
          ...link,
          connectionTest: testResults[link.name]
        }))
      };
    });
  }

  private async testD1Operations(): Promise<void> {
    await this.runTest('D1 Database Operations', async () => {
      // Test fire22-dashboard D1 database
      const tablesResult = await hubConnection.executeD1Query(
        'fire22-dashboard', 
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
      );
      
      if (!tablesResult) {
        throw new Error('Failed to query D1 database tables');
      }
      
      // Test a simple SELECT query
      const customersResult = await hubConnection.executeD1Query(
        'fire22-dashboard',
        'SELECT COUNT(*) as count FROM customers;'
      );
      
      return {
        tablesQuery: tablesResult,
        customersCount: customersResult,
        database: 'fire22-dashboard'
      };
    });
  }

  private async testR2Operations(): Promise<void> {
    await this.runTest('R2 Storage Operations', async () => {
      const testKey = `test-hub-integration-${Date.now()}.txt`;
      const testData = 'Hub integration test data';
      
      // Test upload
      const uploadSuccess = await hubConnection.uploadToR2('fire22-packages', testKey, testData);
      
      if (!uploadSuccess) {
        throw new Error('Failed to upload to R2');
      }
      
      // Test download
      const downloadedData = await hubConnection.downloadFromR2('fire22-packages', testKey);
      
      if (!downloadedData) {
        throw new Error('Failed to download from R2');
      }
      
      const downloadedText = new TextDecoder().decode(downloadedData);
      
      if (downloadedText !== testData) {
        throw new Error('Downloaded data does not match uploaded data');
      }
      
      return {
        uploadSuccess,
        downloadSuccess: true,
        testKey,
        dataMatch: true
      };
    });
  }

  private async testSQLiteSync(): Promise<void> {
    await this.runTest('SQLite Synchronization', async () => {
      // Test push sync
      const pushResult = await hubConnection.syncSQLite('push', 'customers');
      
      // Test pull sync
      const pullResult = await hubConnection.syncSQLite('pull', 'customers');
      
      return {
        pushSync: pushResult,
        pullSync: pullResult,
        table: 'customers'
      };
    });
  }

  private async testLanguageSystem(): Promise<void> {
    await this.runTest('Language System Hub Integration', async () => {
      // Test language sync
      const pushSyncResult = await fire22LanguageWithHub.syncWithHub('push');
      const pullSyncResult = await fire22LanguageWithHub.syncWithHub('pull');
      
      // Test hub status
      const hubStatus = await fire22LanguageWithHub.getHubStatus();
      
      // Test language codes
      const codes = fire22LanguageWithHub.getAllCodes();
      const statistics = fire22LanguageWithHub.getStatistics();
      
      return {
        pushSync: pushSyncResult,
        pullSync: pullSyncResult,
        hubStatus,
        codesCount: codes.length,
        statistics
      };
    });
  }

  private async testLinksSyncAll(): Promise<void> {
    await this.runTest('Links Sync All', async () => {
      const pushResults = await databaseLinks.syncAll('push');
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const pullResults = await databaseLinks.syncAll('pull');
      
      return {
        pushResults,
        pullResults,
        totalSuccessful: pushResults.successful + pullResults.successful
      };
    });
  }

  private printSummary(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 Hub Integration Test Summary');
    console.log('='.repeat(60));
    
    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const total = this.results.length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    
    console.log(`\n📈 Results:`);
    console.log(`  Total Tests: ${total}`);
    console.log(`  ✅ Passed: ${passed} (${Math.round((passed/total)*100)}%)`);
    console.log(`  ❌ Failed: ${failed} (${Math.round((failed/total)*100)}%)`);
    console.log(`  ⏱️  Total Duration: ${Math.round(totalDuration)}ms`);
    
    if (failed > 0) {
      console.log(`\n❌ Failed Tests:`);
      this.results.filter(r => !r.success).forEach(result => {
        console.log(`  - ${result.name}: ${result.error}`);
      });
    }
    
    console.log(`\n🔗 Hub Integration Status: ${failed === 0 ? 'HEALTHY' : 'DEGRADED'}`);
    
    // Detailed results
    console.log(`\n📋 Detailed Results:`);
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`  ${status} ${result.name} (${Math.round(result.duration)}ms)`);
      
      if (result.details && typeof result.details === 'object') {
        const detailsStr = JSON.stringify(result.details, null, 2);
        const preview = detailsStr.length > 200 ? 
          detailsStr.substring(0, 200) + '...' : 
          detailsStr;
        console.log(`      Details: ${preview.replace(/\n/g, ' ')}`);
      }
    });
    
    // Exit with appropriate code
    process.exit(failed === 0 ? 0 : 1);
  }
}

// Run tests if script is executed directly
if (import.meta.main) {
  const tester = new HubIntegrationTester();
  
  // Add test for links sync all
  tester['testLinksSyncAll'] = async function() {
    await this.runTest('Links Sync All', async () => {
      const pushResults = await databaseLinks.syncAll('push');
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const pullResults = await databaseLinks.syncAll('pull');
      
      return {
        pushResults,
        pullResults,
        totalSuccessful: pushResults.successful + pullResults.successful
      };
    });
  };
  
  tester.runAllTests().catch(error => {
    console.error('🚨 Test suite failed:', error);
    process.exit(1);
  });
}

export { HubIntegrationTester };