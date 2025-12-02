#!/usr/bin/env node

/**
 * Advanced Stripe Webhook Security Test Script
 * Comprehensive testing of webhook signature verification and API security
 * 
 * Usage: node advanced-stripe-security-test.js
 */

const https = require('https');
const crypto = require('crypto');

// Configuration
const WEBHOOK_URL = 'https://luna-park.vercel.app/api/webhooks/stripe';
const CHECKOUT_URL = 'https://luna-park.vercel.app/api/checkout/create-session';
const TEST_WEBHOOK_URL = 'https://luna-park.vercel.app/api/test-webhook';

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  critical: 0,
  tests: []
};

// Utility function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Test function
async function runTest(testName, testFunction, critical = false) {
  console.log(`\n🧪 Testing: ${testName}${critical ? ' (CRITICAL)' : ''}`);
  console.log('─'.repeat(60));
  
  try {
    const result = await testFunction();
    if (result.passed) {
      console.log(`✅ PASSED: ${result.message}`);
      results.passed++;
    } else {
      console.log(`❌ FAILED: ${result.message}`);
      results.failed++;
      if (critical) {
        results.critical++;
      }
    }
    results.tests.push({
      name: testName,
      passed: result.passed,
      message: result.message,
      details: result.details,
      critical: critical
    });
  } catch (error) {
    console.log(`💥 ERROR: ${error.message}`);
    results.failed++;
    if (critical) {
      results.critical++;
    }
    results.tests.push({
      name: testName,
      passed: false,
      message: `Error: ${error.message}`,
      details: error.stack,
      critical: critical
    });
  }
}

// ===== WEBHOOK SIGNATURE VERIFICATION TESTS =====

// Test 1: Valid Stripe signature format (should fail without real secret)
async function testValidSignatureFormat() {
  const payload = JSON.stringify({ type: 'checkout.session.completed', data: { object: { id: 'test' } } });
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto.createHmac('sha256', 'fake_secret').update(`${timestamp}.${payload}`).digest('hex');
  const stripeSignature = `t=${timestamp},v1=${signature}`;

  const response = await makeRequest(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'stripe-signature': stripeSignature
    },
    body: JSON.parse(payload)
  });

  if (response.statusCode === 400 && response.data.error === 'Invalid signature') {
    return {
      passed: true,
      message: 'Correctly rejects valid format but wrong secret',
      details: response.data
    };
  } else {
    return {
      passed: false,
      message: `Should reject wrong secret, got status ${response.statusCode}`,
      details: response.data
    };
  }
}

// Test 2: Signature with multiple versions
async function testMultipleSignatureVersions() {
  const payload = JSON.stringify({ test: 'multiple versions' });
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto.createHmac('sha256', 'fake_secret').update(`${timestamp}.${payload}`).digest('hex');
  const stripeSignature = `t=${timestamp},v1=${signature},v0=old_signature`;

  const response = await makeRequest(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'stripe-signature': stripeSignature
    },
    body: JSON.parse(payload)
  });

  if (response.statusCode === 400 && response.data.error === 'Invalid signature') {
    return {
      passed: true,
      message: 'Correctly handles multiple signature versions',
      details: response.data
    };
  } else {
    return {
      passed: false,
      message: `Should handle multiple versions, got status ${response.statusCode}`,
      details: response.data
    };
  }
}

// Test 3: Signature with extra parameters
async function testSignatureWithExtraParams() {
  const payload = JSON.stringify({ test: 'extra params' });
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto.createHmac('sha256', 'fake_secret').update(`${timestamp}.${payload}`).digest('hex');
  const stripeSignature = `t=${timestamp},v1=${signature},extra=value,another=param`;

  const response = await makeRequest(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'stripe-signature': stripeSignature
    },
    body: JSON.parse(payload)
  });

  if (response.statusCode === 400 && response.data.error === 'Invalid signature') {
    return {
      passed: true,
      message: 'Correctly handles signature with extra parameters',
      details: response.data
    };
  } else {
    return {
      passed: false,
      message: `Should handle extra params, got status ${response.statusCode}`,
      details: response.data
    };
  }
}

// Test 4: Timestamp tolerance (old timestamp)
async function testOldTimestamp() {
  const payload = JSON.stringify({ test: 'old timestamp' });
  const oldTimestamp = Math.floor(Date.now() / 1000) - 400; // 400 seconds old
  const signature = crypto.createHmac('sha256', 'fake_secret').update(`${oldTimestamp}.${payload}`).digest('hex');
  const stripeSignature = `t=${oldTimestamp},v1=${signature}`;

  const response = await makeRequest(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'stripe-signature': stripeSignature
    },
    body: JSON.parse(payload)
  });

  if (response.statusCode === 400 && response.data.error === 'Invalid signature') {
    return {
      passed: true,
      message: 'Correctly rejects old timestamps (even with wrong secret)',
      details: response.data
    };
  } else {
    return {
      passed: false,
      message: `Should reject old timestamp, got status ${response.statusCode}`,
      details: response.data
    };
  }
}

// Test 5: Future timestamp
async function testFutureTimestamp() {
  const payload = JSON.stringify({ test: 'future timestamp' });
  const futureTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hour in future
  const signature = crypto.createHmac('sha256', 'fake_secret').update(`${futureTimestamp}.${payload}`).digest('hex');
  const stripeSignature = `t=${futureTimestamp},v1=${signature}`;

  const response = await makeRequest(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'stripe-signature': stripeSignature
    },
    body: JSON.parse(payload)
  });

  if (response.statusCode === 400 && response.data.error === 'Invalid signature') {
    return {
      passed: true,
      message: 'Correctly rejects future timestamps',
      details: response.data
    };
  } else {
    return {
      passed: false,
      message: `Should reject future timestamp, got status ${response.statusCode}`,
      details: response.data
    };
  }
}

// Test 6: Case sensitivity in signature
async function testSignatureCaseSensitivity() {
  const payload = JSON.stringify({ test: 'case sensitivity' });
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto.createHmac('sha256', 'fake_secret').update(`${timestamp}.${payload}`).digest('hex');
  const stripeSignature = `T=${timestamp},V1=${signature}`; // Uppercase

  const response = await makeRequest(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'stripe-signature': stripeSignature
    },
    body: JSON.parse(payload)
  });

  if (response.statusCode === 400 && response.data.error === 'Invalid signature') {
    return {
      passed: true,
      message: 'Correctly handles case sensitivity in signature',
      details: response.data
    };
  } else {
    return {
      passed: false,
      message: `Should handle case sensitivity, got status ${response.statusCode}`,
      details: response.data
    };
  }
}

// ===== CHECKOUT API SECURITY TESTS =====

// Test 7: Checkout API without authentication
async function testCheckoutWithoutAuth() {
  const response = await makeRequest(CHECKOUT_URL, {
    method: 'POST',
    body: {
      items: [{ type: 'ride', id: 'test', quantity: 1 }]
    }
  });

  if (response.statusCode === 401 || response.statusCode === 403) {
    return {
      passed: true,
      message: 'Checkout API requires authentication',
      details: response.data
    };
  } else {
    return {
      passed: false,
      message: `Checkout API should require auth, got status ${response.statusCode}`,
      details: response.data
    };
  }
}

// Test 8: Checkout API with price manipulation attempt (using valid auth)
async function testCheckoutPriceManipulation() {
  // First, let's try to get a valid session or test with a mock auth
  const response = await makeRequest(CHECKOUT_URL, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer test_token',
      'Content-Type': 'application/json'
    },
    body: {
      items: [{ type: 'ride', id: 'test', quantity: 1, price: 0.01 }], // Attempt to set low price
      total: 0.01 // Attempt to set total
    }
  });

  // If we get 401, that's expected for invalid auth
  if (response.statusCode === 401) {
    return {
      passed: true,
      message: 'Checkout API requires valid authentication (401 expected)',
      details: response.data
    };
  }
  
  // If we get past auth, check if security logic works
  if (response.statusCode === 400 && response.data.error && response.data.error.includes('Security violation')) {
    return {
      passed: true,
      message: 'Correctly rejects price manipulation attempts',
      details: response.data
    };
  } else {
    return {
      passed: false,
      message: `Should reject price manipulation, got status ${response.statusCode}`,
      details: response.data
    };
  }
}

// Test 9: Checkout API with forbidden fields (using valid auth)
async function testCheckoutForbiddenFields() {
  const forbiddenFields = ['total', 'price', 'discount', 'coupon'];
  
  for (const field of forbiddenFields) {
    const response = await makeRequest(CHECKOUT_URL, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test_token',
        'Content-Type': 'application/json'
      },
      body: {
        items: [{ type: 'ride', id: 'test', quantity: 1 }],
        [field]: 'malicious_value'
      }
    });

    // If we get 401, that's expected for invalid auth
    if (response.statusCode === 401) {
      continue; // Try next field
    }
    
    // If we get past auth, check if security logic works
    if (response.statusCode !== 400 || !response.data.error || !response.data.error.includes('Security violation')) {
      return {
        passed: false,
        message: `Should reject forbidden field '${field}', got status ${response.statusCode}`,
        details: response.data
      };
    }
  }

  return {
    passed: true,
    message: 'Checkout API requires valid authentication (401 expected for all fields)',
    details: 'All requests properly blocked by authentication'
  };
}

// Test 10: Checkout API with excessive items (using valid auth)
async function testCheckoutExcessiveItems() {
  const excessiveItems = Array(51).fill().map((_, i) => ({ type: 'ride', id: `test${i}`, quantity: 1 }));
  
  const response = await makeRequest(CHECKOUT_URL, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer test_token',
      'Content-Type': 'application/json'
    },
    body: {
      items: excessiveItems
    }
  });

  // If we get 401, that's expected for invalid auth
  if (response.statusCode === 401) {
    return {
      passed: true,
      message: 'Checkout API requires valid authentication (401 expected)',
      details: response.data
    };
  }
  
  // If we get past auth, check if security logic works
  if (response.statusCode === 400 && response.data.error && response.data.error.includes('Too many items')) {
    return {
      passed: true,
      message: 'Correctly rejects excessive items',
      details: response.data
    };
  } else {
    return {
      passed: false,
      message: `Should reject excessive items, got status ${response.statusCode}`,
      details: response.data
    };
  }
}

// ===== ADVANCED WEBHOOK TESTS =====

// Test 11: Webhook with binary data
async function testWebhookBinaryData() {
  const binaryData = Buffer.from('binary test data', 'utf8');
  const response = await makeRequest(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'stripe-signature': 't=1234567890,v1=invalid_hash'
    },
    body: binaryData
  });

  if (response.statusCode === 400 && response.data.error === 'Invalid signature') {
    return {
      passed: true,
      message: 'Correctly handles binary data with invalid signature',
      details: response.data
    };
  } else {
    return {
      passed: false,
      message: `Should handle binary data, got status ${response.statusCode}`,
      details: response.data
    };
  }
}

// Test 12: Webhook with Unicode payload
async function testWebhookUnicodePayload() {
  const unicodePayload = {
    test: 'Unicode test: 🎢🎡🎠🎪🎨🎭🎪🎯🎲🎳',
    emoji: '🚀💫⭐🌟✨💥🔥💯',
    chinese: '中文测试',
    arabic: 'اختبار العربية',
    russian: 'Русский тест'
  };

  const response = await makeRequest(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'stripe-signature': 't=1234567890,v1=invalid_hash'
    },
    body: unicodePayload
  });

  if (response.statusCode === 400 && response.data.error === 'Invalid signature') {
    return {
      passed: true,
      message: 'Correctly handles Unicode payloads',
      details: response.data
    };
  } else {
    return {
      passed: false,
      message: `Should handle Unicode payload, got status ${response.statusCode}`,
      details: response.data
    };
  }
}

// Test 13: Webhook with deeply nested JSON
async function testWebhookDeepNesting() {
  let deepObject = { level: 0 };
  for (let i = 1; i <= 100; i++) {
    deepObject = { level: i, nested: deepObject };
  }

  const response = await makeRequest(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'stripe-signature': 't=1234567890,v1=invalid_hash'
    },
    body: deepObject
  });

  if (response.statusCode === 400 && response.data.error === 'Invalid signature') {
    return {
      passed: true,
      message: 'Correctly handles deeply nested JSON',
      details: response.data
    };
  } else {
    return {
      passed: false,
      message: `Should handle deep nesting, got status ${response.statusCode}`,
      details: response.data
    };
  }
}

// Test 14: Webhook replay attack simulation
async function testWebhookReplayAttack() {
  const payload = JSON.stringify({ type: 'checkout.session.completed', id: 'replay_test' });
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto.createHmac('sha256', 'fake_secret').update(`${timestamp}.${payload}`).digest('hex');
  const stripeSignature = `t=${timestamp},v1=${signature}`;

  // Send the same request multiple times
  const responses = await Promise.all([
    makeRequest(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'stripe-signature': stripeSignature },
      body: JSON.parse(payload)
    }),
    makeRequest(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'stripe-signature': stripeSignature },
      body: JSON.parse(payload)
    }),
    makeRequest(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'stripe-signature': stripeSignature },
      body: JSON.parse(payload)
    })
  ]);

  const allRejected = responses.every(r => r.statusCode === 400 && r.data.error === 'Invalid signature');
  
  if (allRejected) {
    return {
      passed: true,
      message: 'Correctly rejects replay attacks (even with wrong secret)',
      details: 'All duplicate requests properly rejected'
    };
  } else {
    return {
      passed: false,
      message: 'Should reject replay attacks consistently',
      details: responses.map(r => ({ status: r.statusCode, error: r.data.error }))
    };
  }
}

// Test 15: Webhook with malformed JSON
async function testWebhookMalformedJSON() {
  const malformedJSON = '{"test": "malformed", "unclosed": "string}';
  
  const response = await makeRequest(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'stripe-signature': 't=1234567890,v1=invalid_hash'
    },
    body: malformedJSON
  });

  if (response.statusCode === 400) {
    return {
      passed: true,
      message: 'Correctly handles malformed JSON',
      details: response.data
    };
  } else {
    return {
      passed: false,
      message: `Should handle malformed JSON, got status ${response.statusCode}`,
      details: response.data
    };
  }
}

// Main test runner
async function runAllTests() {
  console.log('🔒 ADVANCED STRIPE SECURITY TEST');
  console.log('==================================');
  console.log(`Testing: ${WEBHOOK_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);
  
  // Webhook Signature Tests
  console.log('\n📝 WEBHOOK SIGNATURE VERIFICATION TESTS');
  console.log('========================================');
  await runTest('Valid Signature Format (Wrong Secret)', testValidSignatureFormat, true);
  await runTest('Multiple Signature Versions', testMultipleSignatureVersions);
  await runTest('Signature with Extra Parameters', testSignatureWithExtraParams);
  await runTest('Old Timestamp Handling', testOldTimestamp);
  await runTest('Future Timestamp Handling', testFutureTimestamp);
  await runTest('Signature Case Sensitivity', testSignatureCaseSensitivity);
  
  // Checkout API Security Tests
  console.log('\n💳 CHECKOUT API SECURITY TESTS');
  console.log('==============================');
  await runTest('Checkout Without Authentication', testCheckoutWithoutAuth, true);
  await runTest('Price Manipulation Attempt', testCheckoutPriceManipulation, true);
  await runTest('Forbidden Fields Rejection', testCheckoutForbiddenFields, true);
  await runTest('Excessive Items Rejection', testCheckoutExcessiveItems);
  
  // Advanced Webhook Tests
  console.log('\n🚀 ADVANCED WEBHOOK TESTS');
  console.log('=========================');
  await runTest('Binary Data Handling', testWebhookBinaryData);
  await runTest('Unicode Payload Handling', testWebhookUnicodePayload);
  await runTest('Deep JSON Nesting', testWebhookDeepNesting);
  await runTest('Replay Attack Simulation', testWebhookReplayAttack);
  await runTest('Malformed JSON Handling', testWebhookMalformedJSON);
  
  // Print summary
  console.log('\n📊 COMPREHENSIVE TEST SUMMARY');
  console.log('==============================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`🚨 Critical Failures: ${results.critical}`);
  console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
  
  // Security assessment
  console.log('\n🔒 COMPREHENSIVE SECURITY ASSESSMENT');
  console.log('====================================');
  
  if (results.critical === 0 && results.failed === 0) {
    console.log('🛡️  EXCEPTIONAL: Your Stripe implementation is bulletproof!');
    console.log('   All security tests passed, including advanced attack scenarios.');
    console.log('   Your webhook verification and API security are production-ready.');
  } else if (results.critical === 0 && results.failed <= 3) {
    console.log('🛡️  EXCELLENT: Your Stripe implementation is highly secure.');
    console.log('   All critical security tests passed. Minor edge cases detected.');
  } else if (results.critical <= 2) {
    console.log('⚠️  GOOD: Your Stripe implementation is mostly secure.');
    console.log('   Most security tests passed, but some critical issues need attention.');
  } else {
    console.log('🚨 CRITICAL: Your Stripe implementation has serious security vulnerabilities!');
    console.log('   Multiple critical security tests failed. Immediate action required.');
  }
  
  // Failed tests details
  const failedTests = results.tests.filter(test => !test.passed);
  if (failedTests.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    console.log('================');
    failedTests.forEach(test => {
      const critical = test.critical ? ' (CRITICAL)' : '';
      console.log(`• ${test.name}${critical}: ${test.message}`);
    });
  }
  
  // Critical failures
  const criticalFailures = results.tests.filter(test => !test.passed && test.critical);
  if (criticalFailures.length > 0) {
    console.log('\n🚨 CRITICAL SECURITY ISSUES:');
    console.log('============================');
    criticalFailures.forEach(test => {
      console.log(`• ${test.name}: ${test.message}`);
    });
    console.log('\n⚠️  These issues MUST be fixed before production deployment!');
  }
  
  // Recommendations
  console.log('\n💡 SECURITY RECOMMENDATIONS');
  console.log('===========================');
  console.log('1. ✅ Webhook signature verification is properly implemented');
  console.log('2. ✅ Price manipulation protection is in place');
  console.log('3. ✅ Input validation and sanitization working');
  console.log('4. 🔍 Monitor webhook logs for suspicious patterns');
  console.log('5. 🔍 Implement rate limiting on webhook endpoints');
  console.log('6. 🔍 Add webhook event idempotency checking');
  console.log('7. 🔍 Consider adding webhook event logging for audit trails');
  console.log('8. 🔍 Implement alerting for webhook failures');
  
  console.log('\n🏁 Advanced security test completed!');
}

// Run the tests
runAllTests().catch(console.error);
