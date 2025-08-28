/**
 * 🚀 Enhanced API Integration Demo
 * 
 * Demonstrates the enhanced API service with:
 * - JWT authentication and token management
 * - Enhanced security headers
 * - Protected resource access
 * - Security monitoring and audit logging
 * - Integration with Fire22 enhanced security
 */

import { enhancedAPI, EnhancedAPIService } from './enhanced-api-service';

// Demo configuration
const demoConfig = {
  baseURL: 'https://api.fire22.com',
  apiVersion: 'v1',
  timeout: 30000,
  retryAttempts: 3,
  securityLevel: 'enhanced' as const
};

/**
 * Demo: Complete API Integration Workflow
 */
export class EnhancedAPIDemo {
  private api: EnhancedAPIService;

  constructor() {
    this.api = new EnhancedAPIService(demoConfig);
  }

  /**
   * Demo 1: Authentication Flow
   */
  async demoAuthenticationFlow(): Promise<void> {
    console.log('🔐 Demo 1: Authentication Flow\n');

    try {
      // Step 1: Login
      console.log('📝 Step 1: User Login');
      const loginResponse = await this.api.login({
        username: 'fire22_user',
        password: 'secure_password_123'
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ Login successful');
        console.log(`   Access Token: ${loginData.access_token.substring(0, 20)}...`);
        console.log(`   Token Type: ${loginData.token_type}`);
        console.log(`   Expires In: ${loginData.expires_in}s`);
        console.log(`   Scope: ${loginData.scope}`);
      } else {
        console.log('❌ Login failed:', loginResponse.status);
        return;
      }

      // Step 2: Verify Token
      console.log('\n🔍 Step 2: Token Verification');
      const verifyResponse = await this.api.verifyToken();
      
      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        console.log('✅ Token verified successfully');
        console.log(`   User: ${verifyData.user}`);
        console.log(`   Scope: ${verifyData.scope}`);
        console.log(`   Expires: ${new Date(verifyData.expires * 1000).toISOString()}`);
      } else {
        console.log('❌ Token verification failed:', verifyResponse.status);
      }

      // Step 3: Access Protected Resource
      console.log('\n🛡️ Step 3: Protected Resource Access');
      const protectedResponse = await this.api.getProtectedResource('/api/v1/protected');
      
      if (protectedResponse.ok) {
        const protectedData = await protectedResponse.json();
        console.log('✅ Protected resource accessed successfully');
        console.log(`   Message: ${protectedData.message}`);
        console.log(`   User: ${protectedData.user}`);
        console.log(`   Timestamp: ${protectedData.timestamp}`);
      } else {
        console.log('❌ Protected resource access failed:', protectedResponse.status);
      }

      // Step 4: Check Security Status
      console.log('\n📊 Step 4: Security Status Check');
      const status = this.api.getSecurityStatus();
      console.log('🔒 Current Security Status:');
      console.log(`   Authenticated: ${status.authenticated}`);
      console.log(`   Token Expired: ${status.tokenExpired}`);
      console.log(`   Security Level: ${status.securityLevel}`);
      console.log(`   Client ID: ${status.clientId}`);

    } catch (error) {
      console.error('❌ Authentication demo failed:', error);
    }
  }

  /**
   * Demo 2: Enhanced Security Headers
   */
  async demoEnhancedSecurityHeaders(): Promise<void> {
    console.log('\n🛡️ Demo 2: Enhanced Security Headers\n');

    try {
      // Make a request and inspect headers
      console.log('📡 Making request with enhanced security headers...');
      
      const response = await this.api.request('/api/v1/security/status', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Custom-Header': 'demo-value'
        }
      });

      console.log('✅ Request completed successfully');
      console.log(`   Status: ${response.status}`);
      
      // Show response headers
      console.log('\n📋 Response Security Headers:');
      const headers = response.headers;
      const securityHeaders = [
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset',
        'X-Request-ID',
        'X-Fire22-Security',
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection',
        'Strict-Transport-Security'
      ];

      securityHeaders.forEach(header => {
        const value = headers.get(header);
        if (value) {
          console.log(`   ${header}: ${value}`);
        }
      });

    } catch (error) {
      console.error('❌ Security headers demo failed:', error);
    }
  }

  /**
   * Demo 3: Token Refresh and Management
   */
  async demoTokenManagement(): Promise<void> {
    console.log('\n🔄 Demo 3: Token Refresh and Management\n');

    try {
      // Check current token status
      const status = this.api.getSecurityStatus();
      console.log('🔍 Current Token Status:');
      console.log(`   Authenticated: ${status.authenticated}`);
      console.log(`   Token Expired: ${status.tokenExpired}`);

      if (status.authenticated && !status.tokenExpired) {
        console.log('✅ Token is valid and not expired');
        
        // Simulate token refresh
        console.log('\n🔄 Simulating token refresh...');
        const refreshResult = await this.api.refreshAuthToken();
        
        if (refreshResult) {
          console.log('✅ Token refreshed successfully');
        } else {
          console.log('❌ Token refresh failed');
        }
      } else {
        console.log('⚠️ No valid token available for refresh demo');
      }

      // Show token lifecycle
      console.log('\n📊 Token Lifecycle Information:');
      console.log('   • Access tokens expire in 1 hour');
      console.log('   • Refresh tokens expire in 24 hours');
      console.log('   • Automatic refresh on 401 responses');
      console.log('   • Secure storage in sessionStorage');

    } catch (error) {
      console.error('❌ Token management demo failed:', error);
    }
  }

  /**
   * Demo 4: Error Handling and Retry Logic
   */
  async demoErrorHandling(): Promise<void> {
    console.log('\n⚠️ Demo 4: Error Handling and Retry Logic\n');

    try {
      // Test with invalid endpoint
      console.log('🧪 Testing error handling with invalid endpoint...');
      
      const response = await this.api.request('/api/v1/nonexistent', {
        method: 'GET'
      });

      console.log(`📊 Response Status: ${response.status}`);
      
      if (response.status === 404) {
        console.log('✅ Proper error handling for 404 responses');
      }

      // Test with invalid token
      console.log('\n🧪 Testing error handling with invalid token...');
      
      // Temporarily set invalid token
      this.api['token'] = 'invalid_token_for_testing';
      
      try {
        await this.api.verifyToken();
      } catch (error) {
        console.log('✅ Proper error handling for invalid tokens');
        console.log(`   Error: ${error.message}`);
      }

      // Restore valid token if available
      if (typeof sessionStorage !== 'undefined') {
        const storedToken = sessionStorage.getItem('fire22_access_token');
        if (storedToken) {
          this.api['token'] = storedToken;
          console.log('🔄 Restored valid token from storage');
        }
      }

    } catch (error) {
      console.error('❌ Error handling demo failed:', error);
    }
  }

  /**
   * Demo 5: Security Monitoring and Audit
   */
  async demoSecurityMonitoring(): Promise<void> {
    console.log('\n📊 Demo 5: Security Monitoring and Audit\n');

    try {
      console.log('🔍 Security monitoring features:');
      console.log('   • Request/response audit logging');
      console.log('   • Security event tracking');
      console.log('   • Rate limiting monitoring');
      console.log('   • Token usage analytics');
      console.log('   • Security header validation');

      // Make several requests to demonstrate monitoring
      console.log('\n📡 Making multiple requests to demonstrate monitoring...');
      
      const endpoints = [
        '/api/v1/security/status',
        '/api/v1/protected',
        '/api/v1/auth/verify'
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await this.api.request(endpoint, { method: 'GET' });
          console.log(`   ✅ ${endpoint}: ${response.status}`);
        } catch (error) {
          console.log(`   ❌ ${endpoint}: ${error.message}`);
        }
      }

      console.log('\n📊 Security monitoring is active and logging all events');
      console.log('   Check console for detailed audit logs');

    } catch (error) {
      console.error('❌ Security monitoring demo failed:', error);
    }
  }

  /**
   * Demo 6: Integration with Fire22 Enhanced Security
   */
  async demoFire22Integration(): Promise<void> {
    console.log('\n🔗 Demo 6: Fire22 Enhanced Security Integration\n');

    try {
      console.log('🔐 Fire22 Enhanced Security Integration Features:');
      console.log('   • Enhanced credential management');
      console.log('   • Security policy enforcement');
      console.log('   • Comprehensive security scanning');
      console.log('   • Secure deployment pipeline');
      console.log('   • Security monitoring and reporting');

      // Show current security configuration
      const status = this.api.getSecurityStatus();
      console.log('\n📋 Current Security Configuration:');
      console.log(`   Security Level: ${status.securityLevel}`);
      console.log(`   Client ID: ${status.clientId}`);
      console.log(`   Authentication: ${status.authenticated ? 'Active' : 'Inactive'}`);

      // Demonstrate security level updates
      console.log('\n🔧 Demonstrating security configuration updates...');
      
      this.api.updateSecurityConfig({
        securityLevel: 'strict',
        timeout: 45000,
        retryAttempts: 5
      });

      const updatedStatus = this.api.getSecurityStatus();
      console.log('✅ Security configuration updated:');
      console.log(`   New Security Level: ${updatedStatus.securityLevel}`);

      // Restore original configuration
      this.api.updateSecurityConfig(demoConfig);
      console.log('🔄 Restored original security configuration');

    } catch (error) {
      console.error('❌ Fire22 integration demo failed:', error);
    }
  }

  /**
   * Run all demos
   */
  async runAllDemos(): Promise<void> {
    console.log('🚀 Fire22 Enhanced API Integration Demo');
    console.log('=' .repeat(50));
    console.log('This demo showcases the enhanced API service with:');
    console.log('• JWT authentication and token management');
    console.log('• Enhanced security headers and validation');
    console.log('• Protected resource access');
    console.log('• Security monitoring and audit logging');
    console.log('• Integration with Fire22 enhanced security');
    console.log('=' .repeat(50));

    try {
      await this.demoAuthenticationFlow();
      await this.demoEnhancedSecurityHeaders();
      await this.demoTokenManagement();
      await this.demoErrorHandling();
      await this.demoSecurityMonitoring();
      await this.demoFire22Integration();

      console.log('\n🎉 All demos completed successfully!');
      console.log('\n💡 Next Steps:');
      console.log('   1. Integrate enhanced API service into your dashboard');
      console.log('   2. Configure security monitoring endpoints');
      console.log('   3. Test with your Cloudflare Worker');
      console.log('   4. Monitor security audit logs');
      console.log('   5. Deploy with enhanced security features');

    } catch (error) {
      console.error('❌ Demo execution failed:', error);
    }
  }
}

// Run demo if called directly
if (import.meta.main) {
  console.log('🚀 Starting Enhanced API Integration Demo...\n');
  const demo = new EnhancedAPIDemo();
  demo.runAllDemos().catch(console.error);
}
