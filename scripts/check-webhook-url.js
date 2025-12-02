#!/usr/bin/env node

/**
 * Script to check which webhook URL is currently configured
 * Usage: node scripts/check-webhook-url.js
 */

const https = require('https');
const http = require('http');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkWebhookEndpoint(url) {
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const req = client.request(url, { method: 'GET' }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          headers: res.headers,
          accessible: res.statusCode < 400
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        url,
        status: 'ERROR',
        error: error.message,
        accessible: false
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        error: 'Request timeout',
        accessible: false
      });
    });
    
    req.end();
  });
}

async function checkStripeWebhookConfiguration() {
  log('\n🔍 CHECKING WEBHOOK ENDPOINT CONFIGURATION', 'bright');
  log('==========================================', 'bright');
  
  // Common webhook URL patterns to check
  const possibleUrls = [
    'http://localhost:3000/api/webhooks/stripe',
    'https://localhost:3000/api/webhooks/stripe',
    'https://luna-park.vercel.app/api/webhooks/stripe',
    // Add your custom domain here if you have one
  ];
  
  // Check environment variables
  log('\n📋 ENVIRONMENT VARIABLES:', 'cyan');
  log(`NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'Not set'}`, 'yellow');
  log(`STRIPE_WEBHOOK_SECRET: ${process.env.STRIPE_WEBHOOK_SECRET ? 'Set' : 'Not set'}`, 'yellow');
  
  if (process.env.NEXTAUTH_URL) {
    const webhookUrl = `${process.env.NEXTAUTH_URL}/api/webhooks/stripe`;
    possibleUrls.unshift(webhookUrl);
  }
  
  log('\n🌐 CHECKING WEBHOOK ENDPOINTS:', 'cyan');
  
  for (const url of possibleUrls) {
    log(`\nTesting: ${url}`, 'blue');
    const result = await checkWebhookEndpoint(url);
    
    if (result.accessible) {
      log(`✅ Status: ${result.status} - Accessible`, 'green');
      if (result.headers['content-type']) {
        log(`   Content-Type: ${result.headers['content-type']}`, 'green');
      }
    } else {
      log(`❌ Status: ${result.status} - Not accessible`, 'red');
      if (result.error) {
        log(`   Error: ${result.error}`, 'red');
      }
    }
  }
  
  log('\n📝 INSTRUCTIONS:', 'bright');
  log('1. Go to Stripe Dashboard: https://dashboard.stripe.com/webhooks', 'yellow');
  log('2. Check which endpoint URL is configured', 'yellow');
  log('3. Make sure it matches one of the accessible URLs above', 'yellow');
  log('4. If using localhost, you need ngrok or similar tunnel service', 'yellow');
  
  log('\n🔧 SETUP NGROK (if needed):', 'bright');
  log('1. Install: npm install -g ngrok', 'yellow');
  log('2. Run: ngrok http 3000', 'yellow');
  log('3. Copy the HTTPS URL and update Stripe webhook endpoint', 'yellow');
}

// Run the check
checkStripeWebhookConfiguration().catch(console.error);
