#!/usr/bin/env bun

/**
 * Fire22 Security Test Suite
 * Comprehensive testing for Fire22 security implementation
 */

import {
  Fire22SecurityManager,
  Fire22ThreatDetector,
  Fire22SecureComm,
  Fire22AgentSecurity,
  Fire22TransactionSecurity,
} from './fire22-security-suite';
import { zeroTrustManager } from './zero-trust-credentials';
import { configManager } from './secure-config';
import { securityScanner } from './security-scanner';

// Test results tracking
const testResults: Array<{
  test: string;
  passed: boolean;
  details: string;
}> = [];

function logTest(test: string, passed: boolean, details: string) {
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${test}: ${details}`);
  testResults.push({ test, passed, details });
}

async function testFire22Security() {
  console.log('🔥 Fire22 Security Test Suite\n');
  console.log('='.repeat(60));

  // Initialize security manager
  const security = new Fire22SecurityManager(
    process.env.FIRE22_API_KEY || 'test-key',
    process.env.FIRE22_API_SECRET || 'test-secret'
  );

  // Test 1: Threat Detection
  console.log('\n📊 Testing Threat Detection...');
  const detector = new Fire22ThreatDetector();

  // SQL Injection tests
  const sqlTests = [
    { input: 'John Doe', expected: false, desc: 'Clean input' },
    { input: "'; DROP TABLE users; --", expected: true, desc: 'SQL injection' },
    { input: "1' OR '1'='1", expected: true, desc: 'SQL injection OR' },
    { input: "admin' --", expected: true, desc: 'SQL comment injection' },
  ];

  for (const test of sqlTests) {
    const result = detector.detectSQLInjection(test.input);
    logTest(
      `SQL Detection: ${test.desc}`,
      result === test.expected,
      `Input: "${test.input}" - Detected: ${result}`
    );
  }

  // XSS tests
  const xssTests = [
    { input: 'Hello World', expected: false, desc: 'Clean input' },
    { input: "<script>alert('XSS')</script>", expected: true, desc: 'Script tag' },
    { input: "<img onerror='alert(1)' src='x'>", expected: true, desc: 'Image XSS' },
    { input: 'javascript:alert(1)', expected: true, desc: 'JavaScript protocol' },
  ];

  for (const test of xssTests) {
    const result = detector.detectXSS(test.input);
    logTest(
      `XSS Detection: ${test.desc}`,
      result === test.expected,
      `Input: "${test.input}" - Detected: ${result}`
    );
  }

  // Test 2: Rate Limiting
  console.log('\n📊 Testing Rate Limiting...');

  let rateLimitPassed = true;
  const testUser = 'test-user-' + Date.now();

  // Should allow initial requests
  for (let i = 0; i < 10; i++) {
    const allowed = detector.checkRateLimit(testUser);
    if (!allowed) {
      rateLimitPassed = false;
      break;
    }
  }

  logTest('Rate Limiting: Initial requests', rateLimitPassed, 'First 10 requests should pass');

  // Should block after limit
  for (let i = 0; i < 100; i++) {
    detector.checkRateLimit(testUser);
  }

  const blockedAfterLimit = !detector.checkRateLimit(testUser);
  logTest('Rate Limiting: Block after limit', blockedAfterLimit, 'Should block after 100 requests');

  // Test 3: Secure Communication
  console.log('\n📊 Testing Secure Communication...');

  const comm = new Fire22SecureComm('test-api-key', 'test-api-secret');

  // Test request signing
  const signedRequest = comm.signRequest('POST', '/api/bet', { amount: 100 });
  const signatureData = JSON.parse(signedRequest);

  logTest(
    'Request Signing',
    signatureData.signature && signatureData.timestamp && signatureData.nonce,
    'Request contains signature, timestamp, and nonce'
  );

  // Test webhook verification
  const payload = JSON.stringify({ event: 'bet.placed', amount: 100 });
  const timestamp = Date.now();
  const validSignature = require('crypto')
    .createHmac('sha256', 'test-api-secret')
    .update(`${timestamp}|${payload}`)
    .digest('hex');

  const webhookValid = comm.verifyWebhook(payload, validSignature, timestamp);
  logTest(
    'Webhook Verification: Valid signature',
    webhookValid,
    'Should verify valid webhook signature'
  );

  const invalidWebhook = comm.verifyWebhook(payload, 'invalid-signature', timestamp);
  logTest(
    'Webhook Verification: Invalid signature',
    !invalidWebhook,
    'Should reject invalid webhook signature'
  );

  // Test replay attack protection
  const oldTimestamp = Date.now() - 600000; // 10 minutes old
  const replayWebhook = comm.verifyWebhook(payload, validSignature, oldTimestamp);
  logTest(
    'Webhook Verification: Replay protection',
    !replayWebhook,
    'Should reject old timestamps (replay attack)'
  );

  // Test 4: Agent Security
  console.log('\n📊 Testing Agent Security...');

  const agentSec = new Fire22AgentSecurity();

  // Test session creation
  const agentToken = agentSec.createAgentSession('agent-001', 2, '192.168.1.1', 'Fire22/1.0');

  logTest(
    'Agent Session: Creation',
    agentToken.length === 64,
    'Should create 64-character session token'
  );

  // Test session validation
  const validSession = agentSec.validateSession(agentToken, '192.168.1.1', 'Fire22/1.0');

  logTest('Agent Session: Valid session', validSession, 'Should validate correct session');

  // Test fingerprint validation
  const invalidFingerprint = agentSec.validateSession(
    agentToken,
    '192.168.1.2', // Different IP
    'Fire22/1.0'
  );

  logTest(
    'Agent Session: Fingerprint validation',
    !invalidFingerprint,
    'Should reject different fingerprint'
  );

  // Test hierarchy validation
  const hierarchyValid = agentSec.validateHierarchyAccess(
    { id: 'agent-001', level: 1 },
    { id: 'agent-002', level: 3 }
  );

  logTest('Agent Hierarchy: Valid access', hierarchyValid, 'Level 1 can access level 3');

  const hierarchyInvalid = agentSec.validateHierarchyAccess(
    { id: 'agent-002', level: 3 },
    { id: 'agent-001', level: 1 }
  );

  logTest('Agent Hierarchy: Invalid access', !hierarchyInvalid, 'Level 3 cannot access level 1');

  // Test 5: Transaction Security
  console.log('\n📊 Testing Transaction Security...');

  const txSec = new Fire22TransactionSecurity();

  // Test valid transaction
  const validTx = await txSec.validateTransaction({
    id: 'tx-001',
    userId: 'user-001',
    amount: 100,
    type: 'bet',
    timestamp: new Date(),
  });

  logTest('Transaction: Valid amount', validTx, 'Should accept valid transaction');

  // Test invalid amount
  const invalidAmount = await txSec.validateTransaction({
    id: 'tx-002',
    userId: 'user-001',
    amount: 1000000, // Exceeds max
    type: 'bet',
    timestamp: new Date(),
  });

  logTest('Transaction: Invalid amount', !invalidAmount, 'Should reject excessive amount');

  // Test velocity check (rapid transactions)
  const userId = 'velocity-test-' + Date.now();
  let velocityCheckPassed = true;

  for (let i = 0; i < 15; i++) {
    const result = await txSec.validateTransaction({
      id: `tx-vel-${i}`,
      userId,
      amount: 50,
      type: 'bet',
      timestamp: new Date(),
    });

    if (i > 10 && result) {
      velocityCheckPassed = false; // Should fail after 10 rapid transactions
    }
  }

  logTest(
    'Transaction: Velocity check',
    velocityCheckPassed,
    'Should detect rapid transaction velocity'
  );

  // Test transaction hash
  const txHash = txSec.generateTransactionHash({
    id: 'tx-hash-001',
    userId: 'user-001',
    amount: 100,
    type: 'bet',
    timestamp: new Date(),
  });

  logTest(
    'Transaction: Hash generation',
    txHash.length === 64,
    'Should generate 64-character SHA256 hash'
  );

  // Test 6: Zero-Trust Credentials
  console.log('\n📊 Testing Zero-Trust Credentials...');

  // Store test credential
  const testCred = await zeroTrustManager.storeCredential('test_api_key', 'test-secret-value-123', {
    expiresInDays: 30,
    rotateAfterDays: 7,
    tags: ['test', 'api'],
  });

  logTest(
    'Zero-Trust: Store credential',
    testCred.id && testCred.checksum,
    'Should store credential with checksum'
  );

  // Retrieve credential
  const retrievedValue = await zeroTrustManager.getCredential('test_api_key');

  logTest(
    'Zero-Trust: Retrieve credential',
    retrievedValue === 'test-secret-value-123',
    'Should retrieve correct value'
  );

  // Test rotation
  const rotatedCred = await zeroTrustManager.rotateCredential(
    'test_api_key',
    'new-secret-value-456'
  );

  logTest(
    'Zero-Trust: Rotate credential',
    rotatedCred.lastRotated > testCred.lastRotated,
    'Should update rotation timestamp'
  );

  // Clean up test credential
  await zeroTrustManager.deleteCredential('test_api_key');

  // Test 7: Security Status
  console.log('\n📊 Testing Security Status...');

  const status = security.getSecurityStatus();

  logTest(
    'Security Status: Threat level',
    status.threatLevel !== undefined,
    `Current threat level: ${status.threatLevel}`
  );

  logTest(
    'Security Status: Monitoring',
    status.activeSessions >= 0 && status.blockedIPs >= 0,
    `Sessions: ${status.activeSessions}, Blocked IPs: ${status.blockedIPs}`
  );

  // Test 8: API Request Validation
  console.log('\n📊 Testing API Request Validation...');

  const cleanRequest = await security.validateAPIRequest({
    method: 'POST',
    path: '/api/bet',
    body: { amount: 100, userId: 'user-001' },
    ip: '192.168.1.100',
    userAgent: 'Fire22/1.0',
  });

  logTest('API Validation: Clean request', cleanRequest.valid, 'Should accept clean request');

  const maliciousRequest = await security.validateAPIRequest({
    method: 'POST',
    path: '/api/bet',
    body: { amount: "100'; DROP TABLE bets; --" },
    ip: '192.168.1.101',
    userAgent: 'Fire22/1.0',
  });

  logTest(
    'API Validation: Malicious request',
    !maliciousRequest.valid,
    `Should reject: ${maliciousRequest.reason}`
  );

  // Generate test report
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY\n');

  const passed = testResults.filter(t => t.passed).length;
  const failed = testResults.filter(t => !t.passed).length;
  const total = testResults.length;
  const passRate = ((passed / total) * 100).toFixed(1);

  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Pass Rate: ${passRate}%`);

  if (failed > 0) {
    console.log('\nFailed Tests:');
    testResults
      .filter(t => !t.passed)
      .forEach(t => {
        console.log(`  ❌ ${t.test}: ${t.details}`);
      });
  }

  // Save test report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total,
      passed,
      failed,
      passRate: `${passRate}%`,
    },
    results: testResults,
  };

  await Bun.write('fire22-security-test-report.json', JSON.stringify(report, null, 2));

  console.log('\n📄 Test report saved to fire22-security-test-report.json');

  return failed === 0;
}

// Run tests
if (import.meta.main) {
  testFire22Security()
    .then(allPassed => {
      process.exit(allPassed ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    });
}
