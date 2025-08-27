/**
 * 🧪 Comprehensive Test Suite for Enhanced API Service
 * Tests all security features, JWT authentication, and error handling
 */

class EnhancedAPITestSuite {
    constructor() {
        this.testResults = [];
        this.api = null;
        this.securityManager = null;
        this.testServer = null;
        this.mockResponses = this.setupMockResponses();
    }

    /**
     * Setup mock responses for testing
     */
    setupMockResponses() {
        return {
            '/api/v1/auth/login': {
                success: {
                    status: 200,
                    data: {
                        token: 'mock-jwt-token-' + Date.now(),
                        refresh_token: 'mock-refresh-token-' + Date.now(),
                        user: {
                            id: 1,
                            username: 'testuser',
                            role: 'user',
                            created_at: new Date().toISOString(),
                            last_login: new Date().toISOString(),
                            mfa_enabled: false
                        }
                    }
                },
                invalid: {
                    status: 401,
                    data: { error: 'Invalid credentials' }
                }
            },
            '/api/v1/token': {
                success: {
                    status: 200,
                    data: {
                        access_token: 'mock-access-token-' + Date.now(),
                        refresh_token: 'mock-refresh-token-' + Date.now(),
                        expires_in: 3600
                    }
                }
            },
            '/api/v1/token/refresh': {
                success: {
                    status: 200,
                    data: {
                        access_token: 'new-access-token-' + Date.now(),
                        refresh_token: 'new-refresh-token-' + Date.now()
                    }
                },
                expired: {
                    status: 401,
                    data: { error: 'Refresh token expired' }
                }
            },
            '/api/v1/verify': {
                success: {
                    status: 200,
                    data: {
                        valid: true,
                        user: {
                            id: 1,
                            username: 'testuser',
                            exp: Math.floor(Date.now() / 1000) + 3600
                        }
                    }
                },
                expired: {
                    status: 401,
                    data: { error: 'Token expired' }
                }
            },
            '/api/v1/token/revoke': {
                success: {
                    status: 200,
                    data: { message: 'Token revoked successfully' }
                }
            },
            '/api/v1/protected': {
                success: {
                    status: 200,
                    data: {
                        message: 'Protected resource accessed',
                        user: { id: 1, username: 'testuser' }
                    }
                },
                unauthorized: {
                    status: 401,
                    data: { error: 'Unauthorized' }
                }
            }
        };
    }

    /**
     * Initialize test environment
     */
    async initialize() {
        console.log('🚀 Initializing Enhanced API Test Suite...');
        
        // Initialize security manager
        if (typeof SecurityManager !== 'undefined') {
            this.securityManager = new SecurityManager();
        }
        
        // Initialize API service
        if (typeof APIService !== 'undefined') {
            this.api = new APIService('http://localhost:3000');
            
            // Integrate with security manager if available
            if (this.securityManager) {
                this.api.initSecurityManager(this.securityManager);
            }
        }
        
        // Setup mock fetch
        this.setupMockFetch();
        
        console.log('✅ Test environment initialized');
    }

    /**
     * Setup mock fetch for testing
     */
    setupMockFetch() {
        const originalFetch = window.fetch;
        const mockResponses = this.mockResponses;
        
        window.fetch = async (url, options = {}) => {
            const endpoint = url.replace('http://localhost:3000', '');
            
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Check rate limiting
            if (this.api && !this.api.rateLimiter.canMakeRequest()) {
                return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
                    status: 429,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
            // Find mock response
            let response = null;
            for (const [path, responses] of Object.entries(mockResponses)) {
                if (endpoint === path || endpoint.startsWith(path)) {
                    // Determine which response to return based on request
                    if (endpoint === '/api/v1/auth/login') {
                        const body = JSON.parse(options.body || '{}');
                        response = body.username === 'testuser' && body.password === 'testpass' 
                            ? responses.success 
                            : responses.invalid;
                    } else if (endpoint === '/api/v1/token/refresh') {
                        response = this.api.token ? responses.success : responses.expired;
                    } else if (endpoint === '/api/v1/verify') {
                        response = this.api.token ? responses.success : responses.expired;
                    } else if (endpoint === '/api/v1/protected') {
                        response = this.api.token ? responses.success : responses.unauthorized;
                    } else {
                        response = responses.success || Object.values(responses)[0];
                    }
                    break;
                }
            }
            
            if (!response) {
                return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
            // Add security headers to response
            const headers = {
                'Content-Type': 'application/json',
                'X-CSRF-Token': 'mock-csrf-token-' + Date.now(),
                'X-API-Version': 'v1'
            };
            
            return new Response(JSON.stringify(response.data), {
                status: response.status,
                headers
            });
        };
    }

    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('🧪 Running Enhanced API Service Tests...\n');
        
        const tests = [
            this.testInitialization.bind(this),
            this.testAuthentication.bind(this),
            this.testTokenManagement.bind(this),
            this.testSecurityFeatures.bind(this),
            this.testRateLimiting.bind(this),
            this.testCaching.bind(this),
            this.testErrorHandling.bind(this),
            this.testIntegration.bind(this)
        ];
        
        for (const test of tests) {
            try {
                await test();
            } catch (error) {
                console.error(`❌ Test failed: ${error.message}`);
                this.addResult('error', error.message);
            }
        }
        
        this.printResults();
        return this.testResults;
    }

    /**
     * Test initialization
     */
    async testInitialization() {
        console.log('📋 Testing Initialization...');
        
        // Test API service creation
        if (!this.api) {
            throw new Error('API service not initialized');
        }
        
        // Test security manager integration
        if (this.securityManager && !this.api.securityManager) {
            throw new Error('Security manager not integrated');
        }
        
        // Test default headers
        const headers = this.api.getAuthHeaders();
        if (!headers['Content-Type'] || !headers['X-API-Version']) {
            throw new Error('Default headers not set correctly');
        }
        
        this.addResult('success', 'Initialization test passed');
        console.log('✅ Initialization test passed\n');
    }

    /**
     * Test authentication
     */
    async testAuthentication() {
        console.log('🔐 Testing Authentication...');
        
        // Test successful login
        const loginResult = await this.api.login({
            username: 'testuser',
            password: 'testpass'
        });
        
        if (!this.api.token) {
            throw new Error('Token not set after successful login');
        }
        
        if (!loginResult.user) {
            throw new Error('User data not returned after login');
        }
        
        // Test invalid login
        try {
            await this.api.login({
                username: 'invalid',
                password: 'invalid'
            });
            throw new Error('Invalid login should have failed');
        } catch (error) {
            if (!error.message.includes('Invalid credentials')) {
                throw new Error('Invalid login error not handled correctly');
            }
        }
        
        this.addResult('success', 'Authentication test passed');
        console.log('✅ Authentication test passed\n');
    }

    /**
     * Test token management
     */
    async testTokenManagement() {
        console.log('🔄 Testing Token Management...');
        
        // Test token verification
        const verifyResult = await this.api.verifyToken();
        if (!verifyResult.valid) {
            throw new Error('Token verification failed');
        }
        
        // Test token refresh
        const oldToken = this.api.token;
        const refreshResult = await this.api.refreshToken();
        
        if (!refreshResult) {
            throw new Error('Token refresh failed');
        }
        
        if (this.api.token === oldToken) {
            throw new Error('Token not updated after refresh');
        }
        
        // Test token revocation
        const revokeResult = await this.api.revokeToken();
        if (!revokeResult) {
            throw new Error('Token revocation failed');
        }
        
        if (this.api.token) {
            throw new Error('Token not cleared after revocation');
        }
        
        this.addResult('success', 'Token management test passed');
        console.log('✅ Token management test passed\n');
    }

    /**
     * Test security features
     */
    async testSecurityFeatures() {
        console.log('🛡️ Testing Security Features...');
        
        // Re-login for security tests
        await this.api.login({
            username: 'testuser',
            password: 'testpass'
        });
        
        // Test CSRF token in headers
        const headers = this.api.getAuthHeaders();
        if (!headers['X-CSRF-Token']) {
            throw new Error('CSRF token not included in headers');
        }
        
        // Test security headers
        const securityHeaders = ['X-Content-Type-Options', 'X-Frame-Options', 'X-XSS-Protection'];
        for (const header of securityHeaders) {
            if (!headers[header]) {
                throw new Error(`Security header ${header} not included`);
            }
        }
        
        // Test input sanitization
        const maliciousInput = '<script>alert("xss")</script>';
        const sanitized = this.api.sanitizeString(maliciousInput);
        
        if (sanitized === maliciousInput) {
            throw new Error('Input sanitization not working');
        }
        
        if (sanitized.includes('<script>')) {
            throw new Error('XSS script not properly sanitized');
        }
        
        // Test credentials validation
        const validCredentials = { username: 'testuser', password: 'testpass' };
        const invalidCredentials = { username: 'a', password: 'short' };
        
        if (!this.api.validateCredentials(validCredentials)) {
            throw new Error('Valid credentials validation failed');
        }
        
        if (this.api.validateCredentials(invalidCredentials)) {
            throw new Error('Invalid credentials validation failed');
        }
        
        this.addResult('success', 'Security features test passed');
        console.log('✅ Security features test passed\n');
    }

    /**
     * Test rate limiting
     */
    async testRateLimiting() {
        console.log('⚡ Testing Rate Limiting...');
        
        // Reset rate limiter
        this.api.rateLimiter.reset();
        
        // Test rate limiting works
        const maxRequests = this.api.rateLimiter.maxRequests;
        let requestsMade = 0;
        
        for (let i = 0; i < maxRequests + 5; i++) {
            if (this.api.rateLimiter.canMakeRequest()) {
                requestsMade++;
            } else {
                break;
            }
        }
        
        if (requestsMade > maxRequests) {
            throw new Error('Rate limiting not working correctly');
        }
        
        // Test rate limit error
        try {
            // Make requests until rate limited
            for (let i = 0; i < maxRequests + 1; i++) {
                await this.api.request('/api/v1/protected');
            }
            throw new Error('Rate limit error not thrown');
        } catch (error) {
            if (!error.message.includes('Rate limit exceeded')) {
                throw new Error('Rate limit error not handled correctly');
            }
        }
        
        this.addResult('success', 'Rate limiting test passed');
        console.log('✅ Rate limiting test passed\n');
    }

    /**
     * Test caching
     */
    async testCaching() {
        console.log('💾 Testing Caching...');
        
        // Clear cache
        this.api.cacheManager.clear();
        
        // Test caching works
        const testData = { message: 'test data', timestamp: Date.now() };
        this.api.cacheManager.set('test_key', testData);
        
        const cachedData = this.api.cacheManager.get('test_key');
        if (!cachedData || cachedData.message !== testData.message) {
            throw new Error('Caching not working correctly');
        }
        
        // Test cache expiration
        this.api.cacheManager.set('expire_test', testData, 100); // 100ms TTL
        await new Promise(resolve => setTimeout(resolve, 150));
        
        const expiredData = this.api.cacheManager.get('expire_test');
        if (expiredData) {
            throw new Error('Cache expiration not working');
        }
        
        // Test protected resource caching
        await this.api.getProtectedResource('/api/v1/protected');
        const cachedResource = this.api.cacheManager.get('resource_/api/v1/protected');
        
        if (!cachedResource) {
            throw new Error('Protected resource caching not working');
        }
        
        this.addResult('success', 'Caching test passed');
        console.log('✅ Caching test passed\n');
    }

    /**
     * Test error handling
     */
    async testErrorHandling() {
        console.log('⚠️ Testing Error Handling...');
        
        // Test network error simulation
        const originalFetch = window.fetch;
        window.fetch = () => Promise.reject(new Error('Network error'));
        
        try {
            await this.api.request('/api/v1/protected');
            throw new Error('Network error not handled');
        } catch (error) {
            if (!error.message.includes('Network error')) {
                throw new Error('Network error not handled correctly');
            }
        }
        
        // Restore fetch
        window.fetch = originalFetch;
        
        // Test 404 error
        try {
            await this.api.request('/api/v1/nonexistent');
            throw new Error('404 error not handled');
        } catch (error) {
            if (!error.message.includes('Endpoint not found')) {
                throw new Error('404 error not handled correctly');
            }
        }
        
        // Test unauthorized access
        this.api.clearAuth();
        try {
            await this.api.getProtectedResource('/api/v1/protected');
            throw new Error('Unauthorized access not handled');
        } catch (error) {
            if (!error.message.includes('Session expired')) {
                throw new Error('Unauthorized access not handled correctly');
            }
        }
        
        this.addResult('success', 'Error handling test passed');
        console.log('✅ Error handling test passed\n');
    }

    /**
     * Test integration with security manager
     */
    async testIntegration() {
        console.log('🔗 Testing Integration...');
        
        if (!this.securityManager) {
            console.log('⚠️ Security manager not available, skipping integration test');
            return;
        }
        
        // Test security manager integration
        this.api.initSecurityManager(this.securityManager);
        
        // Test login through API service updates security manager
        await this.api.login({
            username: 'testuser',
            password: 'testpass'
        });
        
        if (!this.securityManager.tokenStorage.getToken()) {
            throw new Error('Security manager token not updated');
        }
        
        // Test security status
        const apiStatus = this.api.getStatus();
        const securityStatus = this.securityManager.getSecurityStatus();
        
        if (apiStatus.hasToken !== securityStatus.hasToken) {
            throw new Error('Token status mismatch between API service and security manager');
        }
        
        // Test logout clears both systems
        await this.api.revokeToken();
        
        if (this.securityManager.tokenStorage.getToken()) {
            throw new Error('Security manager token not cleared on logout');
        }
        
        this.addResult('success', 'Integration test passed');
        console.log('✅ Integration test passed\n');
    }

    /**
     * Add test result
     */
    addResult(type, message) {
        this.testResults.push({
            type,
            message,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Print test results
     */
    printResults() {
        console.log('📊 Test Results Summary:');
        console.log('='.repeat(50));
        
        const passed = this.testResults.filter(r => r.type === 'success').length;
        const failed = this.testResults.filter(r => r.type === 'error').length;
        const total = this.testResults.length;
        
        console.log(`Total Tests: ${total}`);
        console.log(`Passed: ${passed} ✅`);
        console.log(`Failed: ${failed} ❌`);
        console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
        console.log('='.repeat(50));
        
        if (failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults
                .filter(r => r.type === 'error')
                .forEach(result => {
                    console.log(`  - ${result.message}`);
                });
        }
        
        console.log('\n🎉 Enhanced API Service Test Suite Complete!');
    }
}

// Auto-run tests if this file is loaded directly
if (typeof window !== 'undefined') {
    window.addEventListener('load', async () => {
        const testSuite = new EnhancedAPITestSuite();
        await testSuite.initialize();
        await testSuite.runAllTests();
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedAPITestSuite;
} else {
    window.EnhancedAPITestSuite = EnhancedAPITestSuite;
}
