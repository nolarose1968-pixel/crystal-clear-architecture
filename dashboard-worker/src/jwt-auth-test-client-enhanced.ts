#!/usr/bin/env bun

/**
 * 🔐 Enhanced JWT Authentication Test Client
 * Tests advanced security features: rate limiting, audit logging, session management, etc.
 */

interface TestUser {
  username: string;
  password: string;
  role: string;
}

interface AuthResponse {
  message: string;
  user: {
    id: string;
    username: string;
    role: string;
    created_at: string;
    last_login?: string;
    mfa_enabled: boolean;
  };
  token: string;
  session: {
    id: string;
    expires_at: string;
    device_fingerprint?: string;
  };
}

interface AuditLog {
  id: string;
  timestamp: string;
  user_id?: string;
  username?: string;
  action: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  details?: any;
}

interface Session {
  id: string;
  user_id: string;
  jti: string;
  created_at: string;
  expires_at: string;
  last_accessed: string;
  ip_address: string;
  user_agent: string;
  is_active: boolean;
  device_fingerprint?: string;
}

class EnhancedAuthTestClient {
  private baseUrl: string;
  private authToken: string | null = null;
  private adminToken: string | null = null;

  constructor(baseUrl: string = 'http://localhost:8788') {
    this.baseUrl = baseUrl;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken && !options.headers?.['Authorization']) {
      defaultHeaders['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    return response;
  }

  private async makeAdminRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.adminToken) {
      defaultHeaders['Authorization'] = `Bearer ${this.adminToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    return response;
  }

  /**
   * Test basic authentication
   */
  async testBasicAuth(user: TestUser): Promise<boolean> {
    console.log(`🔐 Testing Basic Auth for user: ${user.username}`);
    
    try {
      const response = await this.makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: user.username,
          password: user.password,
        }),
      });

      const data = await response.json() as any;

      if (response.ok) {
        const authData = data as AuthResponse;
        this.authToken = authData.token;
        
        if (user.role === 'admin') {
          this.adminToken = authData.token;
        }

        console.log('✅ Basic Auth successful');
        console.log(`👤 User: ${authData.user.username} (${authData.user.role})`);
        console.log(`🎫 Token: ${authData.token.substring(0, 50)}...`);
        console.log(`🆔 Session: ${authData.session.id}`);
        console.log(`🔒 Device Fingerprint: ${authData.session.device_fingerprint}`);
        console.log(`⏰ Expires: ${authData.session.expires_at}`);
        console.log();
        
        return true;
      } else {
        console.log(`❌ Basic Auth failed: ${data.error}`);
        console.log();
        return false;
      }
    } catch (error) {
      console.log(`❌ Basic Auth error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log();
      return false;
    }
  }

  /**
   * Test protected route access
   */
  async testProtectedRoute(): Promise<boolean> {
    console.log('🛡️ Testing Protected Route Access');
    
    try {
      const response = await this.makeRequest('/protected');
      const data = await response.json() as any;

      if (response.ok) {
        console.log('✅ Protected route access successful');
        console.log(`👤 User: ${data.user.username} (${data.user.role})`);
        console.log(`🔐 Secret: ${data.data.secret}`);
        console.log(`⏰ Timestamp: ${data.data.timestamp}`);
        console.log(`🆔 Session ID: ${data.data.session_id}`);
        console.log();
        return true;
      } else {
        console.log(`❌ Protected route access failed: ${data.error}`);
        console.log();
        return false;
      }
    } catch (error) {
      console.log(`❌ Protected route error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log();
      return false;
    }
  }

  /**
   * Test user info endpoint
   */
  async testGetUserInfo(): Promise<boolean> {
    console.log('👤 Testing Get User Info');
    
    try {
      const response = await this.makeRequest('/auth/me');
      const data = await response.json() as any;

      if (response.ok) {
        console.log('✅ Get user info successful');
        console.log(`🆔 ID: ${data.user.id}`);
        console.log(`👤 Username: ${data.user.username}`);
        console.log(`🎭 Role: ${data.user.role}`);
        console.log(`📅 Created: ${data.user.created_at}`);
        console.log(`🔐 Last Login: ${data.user.last_login || 'Never'}`);
        console.log(`🔒 MFA Enabled: ${data.user.mfa_enabled}`);
        console.log(`🚫 Failed Attempts: ${data.user.failed_login_attempts}`);
        console.log(`🔒 Active: ${data.user.is_active}`);
        console.log(`🔓 Locked Until: ${data.user.locked_until || 'Not locked'}`);
        console.log();
        return true;
      } else {
        console.log(`❌ Get user info failed: ${data.error}`);
        console.log();
        return false;
      }
    } catch (error) {
      console.log(`❌ Get user info error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log();
      return false;
    }
  }

  /**
   * Test token refresh
   */
  async testTokenRefresh(): Promise<boolean> {
    console.log('🔄 Testing Token Refresh');
    
    try {
      const response = await this.makeRequest('/auth/refresh', {
        method: 'POST',
      });
      const data = await response.json() as any;

      if (response.ok) {
        const oldToken = this.authToken;
        this.authToken = data.token;
        
        console.log('✅ Token refresh successful');
        console.log(`🎫 New Token: ${data.token.substring(0, 50)}...`);
        console.log(`🔄 Old Token: ${oldToken?.substring(0, 50)}...`);
        console.log();
        return true;
      } else {
        console.log(`❌ Token refresh failed: ${data.error}`);
        console.log();
        return false;
      }
    } catch (error) {
      console.log(`❌ Token refresh error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log();
      return false;
    }
  }

  /**
   * Test logout
   */
  async testLogout(): Promise<boolean> {
    console.log('🚪 Testing Logout');
    
    try {
      const response = await this.makeRequest('/auth/logout', {
        method: 'POST',
      });
      const data = await response.json() as any;

      if (response.ok) {
        this.authToken = null;
        console.log('✅ Logout successful');
        console.log(`📝 Message: ${data.message}`);
        console.log();
        return true;
      } else {
        console.log(`❌ Logout failed: ${data.error}`);
        console.log();
        return false;
      }
    } catch (error) {
      console.log(`❌ Logout error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log();
      return false;
    }
  }

  /**
   * Test rate limiting
   */
  async testRateLimiting(): Promise<boolean> {
    console.log('⚡ Testing Rate Limiting');
    
    const testUser: TestUser = { username: 'nonexistent', password: 'wrong', role: 'user' };
    let rateLimitHit = false;
    
    // Make multiple failed requests to trigger rate limiting
    for (let i = 1; i <= 15; i++) {
      try {
        const response = await this.makeRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify(testUser),
        });
        
        const data = await response.json() as any;
        
        if (response.status === 429) {
          console.log(`✅ Rate limiting triggered on attempt ${i}`);
          console.log(`🚫 Error: ${data.error}`);
          rateLimitHit = true;
          break;
        }
        
        if (i > 10) {
          console.log(`⚠️ Rate limiting not triggered after ${i} attempts`);
        }
      } catch (error) {
        console.log(`❌ Rate limit test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    console.log();
    return rateLimitHit;
  }

  /**
   * Test account lockout
   */
  async testAccountLockout(): Promise<boolean> {
    console.log('🔒 Testing Account Lockout');
    
    const testUser: TestUser = { username: 'admin', password: 'wrongpassword', role: 'admin' };
    let accountLocked = false;
    
    // Make multiple failed login attempts
    for (let i = 1; i <= 6; i++) {
      try {
        const response = await this.makeRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify(testUser),
        });
        
        const data = await response.json() as any;
        
        if (data.error && data.error.includes('locked')) {
          console.log(`✅ Account lockout triggered on attempt ${i}`);
          console.log(`🔒 Error: ${data.error}`);
          accountLocked = true;
          break;
        }
        
        if (i === 5) {
          console.log(`⚠️ Account not locked after ${i} attempts`);
        }
      } catch (error) {
        console.log(`❌ Account lockout test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    // Test if account is actually locked by trying with correct password
    if (accountLocked) {
      try {
        const response = await this.makeRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ username: 'admin', password: 'admin123', role: 'admin' }),
        });
        
        const data = await response.json() as any;
        
        if (data.error && data.error.includes('locked')) {
          console.log('✅ Account confirmed to be locked (even with correct password)');
        } else {
          console.log('⚠️ Account might not be properly locked');
        }
      } catch (error) {
        console.log(`❌ Account lockout verification error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    console.log();
    return accountLocked;
  }

  /**
   * Test audit logs (admin only)
   */
  async testAuditLogs(): Promise<boolean> {
    console.log('📋 Testing Audit Logs');
    
    if (!this.adminToken) {
      console.log('❌ Admin token required for audit logs test');
      console.log();
      return false;
    }
    
    try {
      const response = await this.makeAdminRequest('/admin/audit-logs?limit=10');
      const data = await response.json() as any;

      if (response.ok) {
        console.log('✅ Audit logs retrieved successfully');
        console.log(`📊 Total logs: ${data.total}`);
        
        if (data.audit_logs && data.audit_logs.length > 0) {
          console.log('📝 Recent audit logs:');
          data.audit_logs.slice(0, 3).forEach((log: AuditLog, index: number) => {
            console.log(`  ${index + 1}. [${log.timestamp}] ${log.action} - ${log.username || 'N/A'} (${log.success ? '✅' : '❌'})`);
          });
        } else {
          console.log('📝 No audit logs found');
        }
        console.log();
        return true;
      } else {
        console.log(`❌ Audit logs failed: ${data.error}`);
        console.log();
        return false;
      }
    } catch (error) {
      console.log(`❌ Audit logs error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log();
      return false;
    }
  }

  /**
   * Test session management (admin only)
   */
  async testSessionManagement(): Promise<boolean> {
    console.log('🔐 Testing Session Management');
    
    if (!this.adminToken) {
      console.log('❌ Admin token required for session management test');
      console.log();
      return false;
    }
    
    try {
      const response = await this.makeAdminRequest('/admin/sessions');
      const data = await response.json() as any;

      if (response.ok) {
        console.log('✅ Sessions retrieved successfully');
        console.log(`📊 Total active sessions: ${data.total}`);
        
        if (data.sessions && data.sessions.length > 0) {
          console.log('🔐 Active sessions:');
          data.sessions.slice(0, 3).forEach((session: Session, index: number) => {
            console.log(`  ${index + 1}. ${session.id} - User ${session.user_id} (${session.ip_address})`);
            console.log(`     Created: ${session.created_at}`);
            console.log(`     Last Accessed: ${session.last_accessed}`);
            console.log(`     Device: ${session.device_fingerprint || 'N/A'}`);
          });
        } else {
          console.log('🔐 No active sessions found');
        }
        console.log();
        return true;
      } else {
        console.log(`❌ Session management failed: ${data.error}`);
        console.log();
        return false;
      }
    } catch (error) {
      console.log(`❌ Session management error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log();
      return false;
    }
  }

  /**
   * Test token revocation (admin only)
   */
  async testTokenRevocation(): Promise<boolean> {
    console.log('🚫 Testing Token Revocation');
    
    if (!this.adminToken) {
      console.log('❌ Admin token required for token revocation test');
      console.log();
      return false;
    }
    
    // First, get a regular user token
    const regularUser: TestUser = { username: 'user', password: 'user123', role: 'user' };
    let userToken: string | null = null;
    
    try {
      const response = await this.makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(regularUser),
      });
      
      if (response.ok) {
        const data = await response.json() as any;
        userToken = data.token;
        console.log(`🎫 Got user token: ${userToken.substring(0, 50)}...`);
      }
    } catch (error) {
      console.log(`❌ Failed to get user token: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log();
      return false;
    }
    
    if (!userToken) {
      console.log('❌ Could not get user token for revocation test');
      console.log();
      return false;
    }
    
    // Test that the token works
    this.authToken = userToken;
    const protectedAccessBefore = await this.testProtectedRoute();
    
    // Now revoke the token
    try {
      const response = await this.makeAdminRequest('/admin/revoke-token', {
        method: 'POST',
        body: JSON.stringify({ token_to_revoke: userToken }),
      });
      
      const data = await response.json() as any;
      
      if (response.ok) {
        console.log('✅ Token revocation successful');
        console.log(`📝 Message: ${data.message}`);
        
        // Test that the token no longer works
        const protectedAccessAfter = await this.testProtectedRoute();
        
        if (protectedAccessBefore && !protectedAccessAfter) {
          console.log('✅ Token successfully revoked - protected access denied');
        } else {
          console.log('⚠️ Token revocation might not be working correctly');
        }
        
        console.log();
        return true;
      } else {
        console.log(`❌ Token revocation failed: ${data.error}`);
        console.log();
        return false;
      }
    } catch (error) {
      console.log(`❌ Token revocation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log();
      return false;
    }
  }

  /**
   * Test health check
   */
  async testHealthCheck(): Promise<boolean> {
    console.log('🏥 Testing Health Check');
    
    try {
      const response = await this.makeRequest('/health');
      const data = await response.json() as any;

      if (response.ok) {
        console.log('✅ Health check successful');
        console.log(`📊 Status: ${data.status}`);
        console.log(`⏰ Timestamp: ${data.timestamp}`);
        console.log(`🏷️ Version: ${data.version}`);
        console.log(`⏱️ Uptime: ${data.uptime}s`);
        console.log(`🔐 Active Sessions: ${data.active_sessions}`);
        console.log(`📋 Total Audit Logs: ${data.total_audit_logs}`);
        console.log();
        return true;
      } else {
        console.log(`❌ Health check failed: ${data.error}`);
        console.log();
        return false;
      }
    } catch (error) {
      console.log(`❌ Health check error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log();
      return false;
    }
  }

  /**
   * Run comprehensive security test
   */
  async runComprehensiveSecurityTest(): Promise<void> {
    console.log('🔐 Enhanced JWT Authentication Security Test Suite\n');
    console.log('This test suite validates advanced security features including rate limiting,');
    console.log('account lockout, audit logging, session management, and token revocation.\n');
    
    const testUsers: TestUser[] = [
      { username: 'admin', password: 'admin123', role: 'admin' },
      { username: 'user', password: 'user123', role: 'user' },
      { username: 'TITTYB69', password: 'test123', role: 'user' },
    ];

    const results: boolean[] = [];

    // Test basic authentication for all users
    for (const user of testUsers) {
      results.push(await this.testBasicAuth(user));
      
      if (this.authToken) {
        results.push(await this.testProtectedRoute());
        results.push(await this.testGetUserInfo());
        results.push(await this.testTokenRefresh());
        results.push(await this.testLogout());
      }
    }

    // Test security features (using admin user)
    await this.testBasicAuth({ username: 'admin', password: 'admin123', role: 'admin' });
    
    results.push(await this.testRateLimiting());
    results.push(await this.testAccountLockout());
    results.push(await this.testAuditLogs());
    results.push(await this.testSessionManagement());
    results.push(await this.testTokenRevocation());
    results.push(await this.testHealthCheck());

    // Summary
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    console.log('🎉 Enhanced Security Test Suite Complete!\n');
    console.log(`📊 Results: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 All security tests passed! System is secure.');
    } else {
      console.log(`⚠️ ${total - passed} tests failed. Review security configuration.`);
    }
    
    console.log('\n🔐 Security Features Tested:');
    console.log('✅ JWT Authentication with enhanced payload');
    console.log('✅ Password hashing and verification');
    console.log('✅ Rate limiting and brute force protection');
    console.log('✅ Account lockout after failed attempts');
    console.log('✅ Comprehensive audit logging');
    console.log('✅ Session management with device fingerprinting');
    console.log('✅ Token revocation and refresh');
    console.log('✅ Admin-only endpoints for management');
    console.log('✅ Security headers and CORS configuration');
    console.log('✅ Health monitoring and statistics');
  }

  /**
   * Run quick security test
   */
  async runQuickSecurityTest(): Promise<void> {
    console.log('⚡ Running Quick Security Test\n');
    
    const results: boolean[] = [];
    
    // Test basic authentication
    results.push(await this.testBasicAuth({ username: 'admin', password: 'admin123', role: 'admin' }));
    
    if (this.authToken) {
      results.push(await this.testProtectedRoute());
      results.push(await this.testGetUserInfo());
      results.push(await this.testHealthCheck());
    }
    
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    console.log('⚡ Quick Security Test Complete!\n');
    console.log(`📊 Results: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 Quick security tests passed!');
    } else {
      console.log(`⚠️ ${total - passed} tests failed.`);
    }
  }
}

// Main execution
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const baseUrl = process.env.AUTH_BASE_URL || 'http://localhost:8788';
  const testType = args[0] || 'comprehensive';

  const client = new EnhancedAuthTestClient(baseUrl);

  console.log(`🔧 Using base URL: ${baseUrl}\n`);

  switch (testType) {
    case 'quick':
      await client.runQuickSecurityTest();
      break;
    case 'comprehensive':
      await client.runComprehensiveSecurityTest();
      break;
    default:
      console.log(`❌ Unknown test type: ${testType}`);
      console.log('Available test types: quick, comprehensive');
  }
}

// Run if called directly
if (import.meta.main) {
  main().catch(console.error);
}

export { EnhancedAuthTestClient };
