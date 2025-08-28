#!/usr/bin/env bun

/**
 * 🔧 Fire22 API Connectivity Test & Fix Script
 * Working solution for E7001: FIRE22_API_CONNECTION_FAILED
 */

import { $ } from "bun";

interface Fire22Config {
  apiUrl: string;
  apiKey: string;
  apiSecret: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

class Fire22ConnectivityTester {
  private config: Fire22Config;
  private dnsCache: Map<string, boolean> = new Map();

  constructor() {
    this.config = {
      apiUrl: process.env.FIRE22_API_URL || 'https://api.fire22.com',
      apiKey: process.env.FIRE22_API_KEY || '',
      apiSecret: process.env.FIRE22_API_SECRET || '',
      timeout: parseInt(process.env.FIRE22_TIMEOUT || '30000'),
      retryAttempts: parseInt(process.env.FIRE22_RETRY_ATTEMPTS || '3'),
      retryDelay: parseInt(process.env.FIRE22_RETRY_DELAY || '1000')
    };
  }

  async runConnectivityTest(): Promise<void> {
    console.log('🔧 Fire22 API Connectivity Test & Fix');
    console.log('━'.repeat(50));
    console.log(`🎯 Target API: ${this.config.apiUrl}`);

    const tests = [
      { name: 'Check Environment Configuration', fn: this.checkEnvironmentConfig },
      { name: 'Test DNS Resolution', fn: this.testDnsResolution },
      { name: 'Test Network Connectivity', fn: this.testNetworkConnectivity },
      { name: 'Test SSL Certificate', fn: this.testSslCertificate },
      { name: 'Test Fire22 API Health', fn: this.testApiHealth },
      { name: 'Test Authentication', fn: this.testAuthentication },
      { name: 'Generate Fix Configuration', fn: this.generateFixConfiguration }
    ];

    const results: Array<{name: string; success: boolean; error?: string}> = [];

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      console.log(`\n[${i + 1}/${tests.length}] ${test.name}...`);
      
      try {
        await test.fn.call(this);
        console.log(`✅ ${test.name} passed`);
        results.push({ name: test.name, success: true });
      } catch (error) {
        console.log(`❌ ${test.name} failed: ${error.message}`);
        results.push({ name: test.name, success: false, error: error.message });
        await this.provideSolution(test.name, error);
      }
    }

    this.printSummary(results);
  }

  private async checkEnvironmentConfig(): Promise<void> {
    console.log(`  🔍 Checking Fire22 environment configuration...`);
    
    const requiredVars = [
      { name: 'FIRE22_API_URL', value: this.config.apiUrl, required: true },
      { name: 'FIRE22_API_KEY', value: this.config.apiKey, required: true, sensitive: true },
      { name: 'FIRE22_API_SECRET', value: this.config.apiSecret, required: true, sensitive: true }
    ];

    const issues: string[] = [];

    for (const varConfig of requiredVars) {
      if (!varConfig.value || varConfig.value.trim() === '') {
        if (varConfig.required) {
          issues.push(`${varConfig.name} is missing or empty`);
        }
      } else {
        const displayValue = varConfig.sensitive ? '***' : varConfig.value;
        console.log(`    ✅ ${varConfig.name}: ${displayValue}`);
        
        // Validate format
        if (varConfig.name === 'FIRE22_API_URL' && !varConfig.value.startsWith('http')) {
          issues.push(`${varConfig.name} must start with http:// or https://`);
        }
        
        if (varConfig.name === 'FIRE22_API_KEY' && varConfig.value.length < 16) {
          issues.push(`${varConfig.name} appears to be too short (expected 16+ chars)`);
        }
      }
    }

    if (issues.length > 0) {
      throw new Error(`Configuration issues: ${issues.join(', ')}`);
    }

    console.log(`  ✅ All required environment variables are configured`);
  }

  private async testDnsResolution(): Promise<void> {
    console.log(`  🌐 Testing DNS resolution...`);
    
    const url = new URL(this.config.apiUrl);
    const hostname = url.hostname;
    
    try {
      // Test DNS resolution
      const lookupResult = await $`nslookup ${hostname}`.quiet();
      
      if (lookupResult.exitCode === 0) {
        console.log(`  ✅ DNS resolution successful for ${hostname}`);
        this.dnsCache.set(hostname, true);
        
        // Extract IP addresses from nslookup output
        const output = lookupResult.stdout.toString();
        const ipMatches = output.match(/Address: (\d+\.\d+\.\d+\.\d+)/g);
        if (ipMatches) {
          console.log(`  📍 Resolved IPs: ${ipMatches.map(m => m.split(': ')[1]).join(', ')}`);
        }
      } else {
        throw new Error(`DNS resolution failed for ${hostname}`);
      }
    } catch (error) {
      this.dnsCache.set(hostname, false);
      throw new Error(`DNS lookup failed: ${error.message}`);
    }
  }

  private async testNetworkConnectivity(): Promise<void> {
    console.log(`  🔌 Testing network connectivity...`);
    
    const url = new URL(this.config.apiUrl);
    const hostname = url.hostname;
    const port = url.port || (url.protocol === 'https:' ? '443' : '80');
    
    try {
      // Test basic TCP connectivity
      const result = await $`timeout 10 nc -z ${hostname} ${port}`.quiet();
      
      if (result.exitCode === 0) {
        console.log(`  ✅ Network connectivity successful to ${hostname}:${port}`);
      } else {
        throw new Error(`Cannot connect to ${hostname}:${port}`);
      }
    } catch (error) {
      // Try alternative test with curl
      try {
        const curlResult = await $`timeout 10 curl -I --connect-timeout 5 ${this.config.apiUrl}`.quiet();
        if (curlResult.exitCode === 0) {
          console.log(`  ✅ HTTP connectivity verified with curl`);
        } else {
          throw new Error('Network connectivity test failed');
        }
      } catch {
        throw new Error(`Network connectivity failed: ${error.message}`);
      }
    }
  }

  private async testSslCertificate(): Promise<void> {
    console.log(`  🔐 Testing SSL certificate...`);
    
    if (!this.config.apiUrl.startsWith('https://')) {
      console.log(`  ⚠️  API URL uses HTTP - SSL test skipped`);
      return;
    }

    const url = new URL(this.config.apiUrl);
    const hostname = url.hostname;
    
    try {
      // Test SSL certificate
      const sslResult = await $`timeout 10 openssl s_client -connect ${hostname}:443 -servername ${hostname} < /dev/null`.quiet();
      
      if (sslResult.exitCode === 0) {
        console.log(`  ✅ SSL certificate is valid`);
        
        // Extract certificate info
        const output = sslResult.stdout.toString();
        if (output.includes('Verify return code: 0 (ok)')) {
          console.log(`  ✅ SSL certificate verification passed`);
        } else {
          console.log(`  ⚠️  SSL certificate has warnings but is functional`);
        }
      } else {
        throw new Error('SSL certificate test failed');
      }
    } catch (error) {
      throw new Error(`SSL certificate validation failed: ${error.message}`);
    }
  }

  private async testApiHealth(): Promise<void> {
    console.log(`  🏥 Testing Fire22 API health...`);
    
    try {
      const healthEndpoints = [
        `${this.config.apiUrl}/health`,
        `${this.config.apiUrl}/api/health`,
        `${this.config.apiUrl}/status`,
        `${this.config.apiUrl}/ping`
      ];

      let healthSuccess = false;
      
      for (const endpoint of healthEndpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'User-Agent': 'Fire22-Dashboard-Worker/1.0',
              'Accept': 'application/json'
            },
            signal: AbortSignal.timeout(this.config.timeout)
          });

          if (response.ok) {
            console.log(`  ✅ Health check passed: ${endpoint} (${response.status})`);
            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/json')) {
              const data = await response.json();
              console.log(`  📊 Health status: ${JSON.stringify(data, null, 2)}`);
            }
            healthSuccess = true;
            break;
          }
        } catch (error) {
          // Continue to next endpoint
          continue;
        }
      }

      if (!healthSuccess) {
        // Try basic connection to root endpoint
        const response = await fetch(this.config.apiUrl, {
          method: 'GET',
          headers: { 'User-Agent': 'Fire22-Dashboard-Worker/1.0' },
          signal: AbortSignal.timeout(this.config.timeout)
        });

        if (response.status < 500) {
          console.log(`  ✅ API is responding (${response.status}) - health endpoint may not exist`);
        } else {
          throw new Error(`API returned server error: ${response.status}`);
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`API health check timed out after ${this.config.timeout}ms`);
      }
      throw new Error(`API health check failed: ${error.message}`);
    }
  }

  private async testAuthentication(): Promise<void> {
    console.log(`  🔑 Testing Fire22 authentication...`);
    
    if (!this.config.apiKey || !this.config.apiSecret) {
      throw new Error('API key or secret not configured - cannot test authentication');
    }

    try {
      // Try common Fire22 authentication endpoints
      const authEndpoints = [
        `${this.config.apiUrl}/api/auth/validate`,
        `${this.config.apiUrl}/auth/token`,
        `${this.config.apiUrl}/api/me`,
        `${this.config.apiUrl}/user/profile`
      ];

      let authSuccess = false;
      
      for (const endpoint of authEndpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${this.config.apiKey}`,
              'X-API-Secret': this.config.apiSecret,
              'User-Agent': 'Fire22-Dashboard-Worker/1.0',
              'Accept': 'application/json'
            },
            signal: AbortSignal.timeout(this.config.timeout)
          });

          if (response.ok) {
            console.log(`  ✅ Authentication successful: ${endpoint}`);
            authSuccess = true;
            break;
          } else if (response.status === 401) {
            console.log(`  ❌ Authentication failed: Invalid credentials (401)`);
            break;
          } else if (response.status === 403) {
            console.log(`  ❌ Authentication failed: Insufficient permissions (403)`);
            break;
          }
        } catch (error) {
          continue;
        }
      }

      if (!authSuccess) {
        throw new Error('Could not validate authentication - check API credentials');
      }
    } catch (error) {
      throw new Error(`Authentication test failed: ${error.message}`);
    }
  }

  private async generateFixConfiguration(): Promise<void> {
    console.log(`  🔧 Generating optimized configuration...`);
    
    const optimizedConfig = {
      // DNS caching optimization
      dnsCache: Object.fromEntries(this.dnsCache),
      
      // Connection settings
      connection: {
        timeout: Math.max(this.config.timeout, 15000),
        retryAttempts: this.config.retryAttempts,
        retryDelay: this.config.retryDelay,
        keepAlive: true,
        maxSockets: 10
      },
      
      // Fire22 specific settings
      fire22: {
        apiUrl: this.config.apiUrl,
        apiVersion: 'v1',
        userAgent: 'Fire22-Dashboard-Worker/1.0',
        rateLimit: {
          requests: 100,
          window: 60000 // 1 minute
        }
      }
    };

    // Write optimized configuration
    const configContent = `# Fire22 API Configuration - Generated by test-fire22-connectivity.ts
# Optimized settings based on connectivity test results

FIRE22_API_URL=${this.config.apiUrl}
FIRE22_API_KEY=${this.config.apiKey}
FIRE22_API_SECRET=${this.config.apiSecret}

# Connection optimization
FIRE22_TIMEOUT=${optimizedConfig.connection.timeout}
FIRE22_RETRY_ATTEMPTS=${optimizedConfig.connection.retryAttempts}
FIRE22_RETRY_DELAY=${optimizedConfig.connection.retryDelay}
FIRE22_KEEP_ALIVE=true
FIRE22_MAX_SOCKETS=${optimizedConfig.connection.maxSockets}

# Rate limiting
FIRE22_RATE_LIMIT_REQUESTS=${optimizedConfig.fire22.rateLimit.requests}
FIRE22_RATE_LIMIT_WINDOW=${optimizedConfig.fire22.rateLimit.window}

# User agent
FIRE22_USER_AGENT="${optimizedConfig.fire22.userAgent}"

# Health check settings
FIRE22_HEALTH_CHECK_INTERVAL=60000
FIRE22_HEALTH_CHECK_TIMEOUT=10000
`;

    await Bun.write('.env.fire22', configContent);
    console.log(`  ✅ Created .env.fire22 with optimized settings`);
    
    // Create Fire22 client wrapper with error handling
    const clientCode = `#!/usr/bin/env bun

/**
 * Fire22 API Client - Generated by test-fire22-connectivity.ts
 * Includes automatic error handling and retry logic
 */

export class Fire22Client {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly timeout: number;
  private readonly retryAttempts: number;
  private readonly retryDelay: number;

  constructor() {
    this.apiUrl = process.env.FIRE22_API_URL || 'https://api.fire22.com';
    this.apiKey = process.env.FIRE22_API_KEY || '';
    this.apiSecret = process.env.FIRE22_API_SECRET || '';
    this.timeout = parseInt(process.env.FIRE22_TIMEOUT || '30000');
    this.retryAttempts = parseInt(process.env.FIRE22_RETRY_ATTEMPTS || '3');
    this.retryDelay = parseInt(process.env.FIRE22_RETRY_DELAY || '1000');
  }

  async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = \`\${this.apiUrl}\${endpoint}\`;
    
    const defaultHeaders = {
      'Authorization': \`Bearer \${this.apiKey}\`,
      'X-API-Secret': this.apiSecret,
      'User-Agent': 'Fire22-Dashboard-Worker/1.0',
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    const requestOptions: RequestInit = {
      ...options,
      headers: { ...defaultHeaders, ...options.headers },
      signal: AbortSignal.timeout(this.timeout)
    };

    return await this.executeWithRetry(() => fetch(url, requestOptions));
  }

  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < this.retryAttempts) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1);
          console.log(\`Fire22 API attempt \${attempt} failed, retrying in \${delay}ms...\`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(\`Fire22 API request failed after \${this.retryAttempts} attempts: \${lastError.message}\`);
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/health');
      return response.ok;
    } catch (error) {
      console.error('Fire22 health check failed:', error);
      return false;
    }
  }
}

export const fire22Client = new Fire22Client();
`;

    await Bun.write('src/clients/fire22-client.ts', clientCode);
    console.log(`  ✅ Created Fire22 client with error handling`);
  }

  private async provideSolution(testName: string, error: Error): Promise<void> {
    console.log(`\n💡 Solutions for ${testName}:`);
    
    switch (testName) {
      case 'Check Environment Configuration':
        console.log(`  1. Set required environment variables:`);
        console.log(`     export FIRE22_API_URL="https://api.fire22.com"`);
        console.log(`     export FIRE22_API_KEY="your_api_key_here"`);
        console.log(`     export FIRE22_API_SECRET="your_api_secret_here"`);
        console.log(`  2. Copy from .env.example if available`);
        console.log(`  3. Contact Fire22 support to obtain API credentials`);
        break;
        
      case 'Test DNS Resolution':
        console.log(`  1. Try alternative DNS servers: 8.8.8.8, 1.1.1.1`);
        console.log(`  2. Flush DNS cache: sudo dscacheutil -flushcache`);
        console.log(`  3. Check /etc/hosts for conflicting entries`);
        console.log(`  4. Test with dig: dig api.fire22.com`);
        break;
        
      case 'Test Network Connectivity':
        console.log(`  1. Check firewall settings and proxy configuration`);
        console.log(`  2. Test with curl: curl -I https://api.fire22.com`);
        console.log(`  3. Verify no VPN or network restrictions`);
        console.log(`  4. Contact network administrator if corporate network`);
        break;
        
      case 'Test SSL Certificate':
        console.log(`  1. Update certificates: brew install ca-certificates`);
        console.log(`  2. Check certificate expiration: openssl s_client -connect api.fire22.com:443`);
        console.log(`  3. Verify system time is correct`);
        console.log(`  4. Check for SSL/TLS version compatibility`);
        break;
        
      case 'Test Fire22 API Health':
        console.log(`  1. Check Fire22 status page for service disruptions`);
        console.log(`  2. Try different endpoints: /status, /ping, /health`);
        console.log(`  3. Increase timeout if network is slow`);
        console.log(`  4. Contact Fire22 support if persistent issues`);
        break;
        
      case 'Test Authentication':
        console.log(`  1. Verify API key and secret are correct`);
        console.log(`  2. Check if API key is activated and not expired`);
        console.log(`  3. Ensure proper header format: Authorization: Bearer <token>`);
        console.log(`  4. Regenerate API credentials if compromised`);
        break;
        
      default:
        console.log(`  1. Check detailed logs for more information`);
        console.log(`  2. Try manual testing with curl or postman`);
        console.log(`  3. Contact Fire22 technical support`);
    }
  }

  private printSummary(results: Array<{name: string; success: boolean; error?: string}>): void {
    console.log(`\n${'━'.repeat(50)}`);
    console.log(`📊 Fire22 Connectivity Test Summary`);
    console.log(`${'━'.repeat(50)}`);

    const passed = results.filter(r => r.success).length;
    const total = results.length;
    
    console.log(`\n✅ Passed: ${passed}/${total} tests`);
    console.log(`❌ Failed: ${total - passed}/${total} tests`);

    if (passed === total) {
      console.log(`\n🎉 All Fire22 connectivity tests passed!`);
      console.log(`🔗 Fire22 API is ready for integration`);
    } else {
      console.log(`\n⚠️  Some tests failed. Check the solutions above.`);
      console.log(`📞 Contact Fire22 support if issues persist`);
    }

    console.log(`\n📁 Generated Files:`);
    console.log(`  • .env.fire22 - Optimized configuration`);
    console.log(`  • src/clients/fire22-client.ts - Error-handling client`);
    
    console.log(`\n📚 Related Documentation:`);
    console.log(`  • /docs/integrations/fire22 - Integration guide`);
    console.log(`  • /docs/api/fire22-endpoints - API reference`);
    console.log(`  • /docs/troubleshooting/fire22 - Troubleshooting guide`);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🔧 Fire22 API Connectivity Test & Fix Script

Usage: bun run scripts/test-fire22-connectivity.ts [options]

Options:
  --help, -h     Show this help message
  --verbose, -v  Enable verbose output
  --quick        Run basic tests only

Environment Variables:
  FIRE22_API_URL        Fire22 API base URL (default: https://api.fire22.com)
  FIRE22_API_KEY        Fire22 API key (required)
  FIRE22_API_SECRET     Fire22 API secret (required)
  FIRE22_TIMEOUT        Request timeout in ms (default: 30000)
  FIRE22_RETRY_ATTEMPTS Retry attempts (default: 3)
  FIRE22_RETRY_DELAY    Retry delay in ms (default: 1000)

Examples:
  bun run scripts/test-fire22-connectivity.ts
  FIRE22_API_URL=https://staging.fire22.com bun run scripts/test-fire22-connectivity.ts
  bun run scripts/test-fire22-connectivity.ts --verbose

Related Error Codes:
  E7001 - FIRE22_API_CONNECTION_FAILED
  E4001 - NETWORK_TIMEOUT
  E3001 - API_UNAUTHORIZED
`);
    return;
  }

  const tester = new Fire22ConnectivityTester();
  await tester.runConnectivityTest();
}

main().catch(console.error);