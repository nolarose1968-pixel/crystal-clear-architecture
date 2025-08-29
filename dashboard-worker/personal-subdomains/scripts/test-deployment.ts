#!/usr/bin/env bun
/**
 * Test Fire22 Personal Subdomains Deployment
 * Comprehensive testing for the personal subdomain infrastructure
 */

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  url?: string;
  responseTime?: number;
}

async function main() {
  console.log('🧪 Testing Fire22 Personal Subdomains Deployment...\n');

  const results: TestResult[] = [];

  // Test 1: VIP Subdomain (CRITICAL)
  console.log('🎯 CRITICAL TEST: Vinny2Times VIP Subdomain');
  results.push(await testVIPSubdomain());

  // Test 2: Executive Subdomains
  console.log('\n👑 Testing Executive Subdomains');
  results.push(...await testExecutiveSubdomains());

  // Test 3: Root Domain
  console.log('\n🌐 Testing Root Domain');
  results.push(await testRootDomain());

  // Test 4: SSL Certificates
  console.log('\n🔒 Testing SSL Certificates');
  results.push(...await testSSLCertificates());

  // Test 5: API Endpoints
  console.log('\n🔌 Testing API Endpoints');
  results.push(...await testAPIEndpoints());

  // Test 6: Error Handling
  console.log('\n❌ Testing Error Handling');
  results.push(await test404Handling());

  // Display Results
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;

  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
    console.log(`${icon} ${result.name}: ${result.message}`);
    if (result.url) {
      console.log(`   URL: ${result.url}`);
    }
    if (result.responseTime) {
      console.log(`   Response Time: ${result.responseTime}ms`);
    }
  });

  console.log('\n📈 OVERALL RESULTS:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏭️ Skipped: ${skipped}`);
  console.log(`📊 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

  // Critical Check
  const criticalTests = results.filter(r => r.name.includes('Vinny2Times'));
  const criticalPassed = criticalTests.every(r => r.status === 'PASS');

  if (criticalPassed) {
    console.log('\n🎯 CRITICAL SUCCESS: VIP infrastructure is operational!');
    console.log('🚀 Ready to proceed with remaining employee subdomain rollout.');
  } else {
    console.log('\n🚨 CRITICAL FAILURE: VIP infrastructure needs immediate attention!');
    console.log('Please check the deployment and resolve issues before proceeding.');
    process.exit(1);
  }
}

async function testVIPSubdomain(): Promise<TestResult> {
  const url = 'https://vinny2times.fire22.workers.dev/';

  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Fire22-Test-Suite/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      return {
        name: 'Vinny2Times Profile Page',
        status: 'FAIL',
        message: `HTTP ${response.status}: ${response.statusText}`,
        url,
        responseTime,
      };
    }

    const html = await response.text();

    // Check for critical VIP elements
    const checks = [
      { name: 'VIP Name', check: html.includes('Vinny2Times') },
      { name: 'VIP Title', check: html.includes('Head of VIP Management') },
      { name: 'VIP Badge', check: html.includes('👑 VIP Management') },
      { name: 'VIP Features', check: html.includes('VIP Management Services') },
      { name: 'Fire22 Branding', check: html.includes('Fire22') },
      { name: 'Responsive Design', check: html.includes('viewport') },
    ];

    const failedChecks = checks.filter(c => !c.check);
    if (failedChecks.length > 0) {
      return {
        name: 'Vinny2Times Profile Page',
        status: 'FAIL',
        message: `Missing elements: ${failedChecks.map(c => c.name).join(', ')}`,
        url,
        responseTime,
      };
    }

    return {
      name: 'Vinny2Times Profile Page',
      status: 'PASS',
      message: 'VIP profile page loaded successfully with all features',
      url,
      responseTime,
    };

  } catch (error) {
    return {
      name: 'Vinny2Times Profile Page',
      status: 'FAIL',
      message: `Connection failed: ${error.message}`,
      url,
    };
  }
}

async function testExecutiveSubdomains(): Promise<TestResult[]> {
  const executives = [
    { name: 'William Harris (CEO)', subdomain: 'william-harris' },
    { name: 'Patricia Clark (COO)', subdomain: 'patricia-clark' },
    { name: 'Chris Brown (CTO)', subdomain: 'chris-brown' },
    { name: 'Jennifer Adams (HR Director)', subdomain: 'jennifer-adams' },
  ];

  const results: TestResult[] = [];

  for (const exec of executives) {
    const url = `https://exec.subdomain.fire22.workers.dev/`;

    try {
      const startTime = Date.now();
      const response = await fetch(url);
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const html = await response.text();
        const hasName = html.includes(exec.name.split(' ')[0]);
        const hasTitle = html.includes(exec.name.split('(')[1].replace(')', ''));

        if (hasName && hasTitle) {
          results.push({
            name: `${exec.name} Profile`,
            status: 'PASS',
            message: 'Executive profile loaded successfully',
            url,
            responseTime,
          });
        } else {
          results.push({
            name: `${exec.name} Profile`,
            status: 'FAIL',
            message: 'Profile missing executive information',
            url,
            responseTime,
          });
        }
      } else {
        results.push({
          name: `${exec.name} Profile`,
          status: 'FAIL',
          message: `HTTP ${response.status}: ${response.statusText}`,
          url,
          responseTime,
        });
      }
    } catch (error) {
      results.push({
        name: `${exec.name} Profile`,
        status: 'FAIL',
        message: `Connection failed: ${error.message}`,
        url,
      });
    }
  }

  return results;
}

async function testRootDomain(): Promise<TestResult> {
  const url = 'https://fire22.workers.dev/';

  try {
    const response = await fetch(url);

    if (response.ok) {
      const html = await response.text();
      if (html.includes('Fire22') && html.includes('Employee Directory')) {
        return {
          name: 'Root Domain',
          status: 'PASS',
          message: 'Root domain loads correctly with directory info',
          url,
        };
      } else {
        return {
          name: 'Root Domain',
          status: 'FAIL',
          message: 'Root domain missing expected content',
          url,
        };
      }
    } else {
      return {
        name: 'Root Domain',
        status: 'FAIL',
        message: `HTTP ${response.status}: ${response.statusText}`,
        url,
      };
    }
  } catch (error) {
    return {
      name: 'Root Domain',
      status: 'FAIL',
      message: `Connection failed: ${error.message}`,
      url,
    };
  }
}

async function testSSLCertificates(): Promise<TestResult[]> {
  const testUrls = [
    'https://vinny2times.fire22.workers.dev/',
    'https://william-harris.fire22.workers.dev/',
    'https://fire22.workers.dev/',
  ];

  const results: TestResult[] = [];

  for (const url of testUrls) {
    try {
      // Test HTTPS connection
      const response = await fetch(url, {
        method: 'HEAD',
        // This will throw if SSL certificate is invalid
      });

      if (response.ok) {
        results.push({
          name: `SSL Certificate - ${new URL(url).hostname}`,
          status: 'PASS',
          message: 'SSL certificate valid and connection secure',
          url,
        });
      } else {
        results.push({
          name: `SSL Certificate - ${new URL(url).hostname}`,
          status: 'FAIL',
          message: `SSL connection failed: HTTP ${response.status}`,
          url,
        });
      }
    } catch (error) {
      results.push({
        name: `SSL Certificate - ${new URL(url).hostname}`,
        status: 'FAIL',
        message: `SSL error: ${error.message}`,
        url,
      });
    }
  }

  return results;
}

async function testAPIEndpoints(): Promise<TestResult[]> {
  const apiTests = [
    {
      name: 'Vinny2Times Health Check',
      url: 'https://vinny2times.fire22.workers.dev/api/health',
      expectedContent: ['status', 'employee', 'Vinny2Times'],
    },
    {
      name: 'Chris Brown Health Check',
      url: 'https://chris-brown.fire22.workers.dev/api/health',
      expectedContent: ['status', 'employee', 'Chris Brown'],
    },
  ];

  const results: TestResult[] = [];

  for (const test of apiTests) {
    try {
      const response = await fetch(test.url);

      if (response.ok) {
        const data = await response.json();
        const hasExpectedContent = test.expectedContent.every(content =>
          JSON.stringify(data).includes(content)
        );

        if (hasExpectedContent) {
          results.push({
            name: test.name,
            status: 'PASS',
            message: 'API endpoint returns correct data',
            url: test.url,
          });
        } else {
          results.push({
            name: test.name,
            status: 'FAIL',
            message: 'API response missing expected content',
            url: test.url,
          });
        }
      } else {
        results.push({
          name: test.name,
          status: 'FAIL',
          message: `API request failed: HTTP ${response.status}`,
          url: test.url,
        });
      }
    } catch (error) {
      results.push({
        name: test.name,
        status: 'FAIL',
        message: `API request error: ${error.message}`,
        url: test.url,
      });
    }
  }

  return results;
}

async function test404Handling(): Promise<TestResult> {
  const invalidUrls = [
    'https://nonexistent.fire22.workers.dev/',
    'https://vinny2times.fire22.workers.dev/nonexistent-page',
  ];

  for (const url of invalidUrls) {
    try {
      const response = await fetch(url);

      if (response.status === 404) {
        const html = await response.text();
        if (html.includes('Employee Not Found') || html.includes('404')) {
          return {
            name: '404 Error Handling',
            status: 'PASS',
            message: 'Proper 404 pages displayed for invalid subdomains',
            url,
          };
        } else {
          return {
            name: '404 Error Handling',
            status: 'FAIL',
            message: '404 response missing proper error page',
            url,
          };
        }
      } else {
        return {
          name: '404 Error Handling',
          status: 'FAIL',
          message: `Expected 404 but got ${response.status}`,
          url,
        };
      }
    } catch (error) {
      return {
        name: '404 Error Handling',
        status: 'FAIL',
        message: `Connection error: ${error.message}`,
        url,
      };
    }
  }

  return {
    name: '404 Error Handling',
    status: 'PASS',
    message: '404 error handling verified',
  };
}

// Run tests if this file is executed directly
if (import.meta.main) {
  main().catch(console.error);
}

export { main as testPersonalSubdomainsDeployment };
