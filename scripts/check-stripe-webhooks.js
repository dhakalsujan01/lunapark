#!/usr/bin/env node

/**
 * Script to check Stripe webhook configuration via Stripe API
 * Usage: node scripts/check-stripe-webhooks.js
 * 
 * Note: This requires STRIPE_SECRET_KEY to be set in your environment
 */

const https = require('https');

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

async function getStripeWebhooks() {
  return new Promise((resolve, reject) => {
    if (!process.env.STRIPE_SECRET_KEY) {
      reject(new Error('STRIPE_SECRET_KEY not found in environment variables'));
      return;
    }

    const auth = Buffer.from(process.env.STRIPE_SECRET_KEY + ':').toString('base64');
    
    const options = {
      hostname: 'api.stripe.com',
      port: 443,
      path: '/v1/webhook_endpoints',
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          reject(new Error('Failed to parse Stripe API response'));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function checkStripeWebhookConfiguration() {
  log('\n🔍 CHECKING STRIPE WEBHOOK CONFIGURATION', 'bright');
  log('=========================================', 'bright');
  
  try {
    log('\n📋 ENVIRONMENT CHECK:', 'cyan');
    log(`STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? 'Set' : 'Not set'}`, 
        process.env.STRIPE_SECRET_KEY ? 'green' : 'red');
    log(`STRIPE_WEBHOOK_SECRET: ${process.env.STRIPE_WEBHOOK_SECRET ? 'Set' : 'Not set'}`, 
        process.env.STRIPE_WEBHOOK_SECRET ? 'green' : 'red');
    log(`NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'Not set'}`, 'yellow');
    
    if (!process.env.STRIPE_SECRET_KEY) {
      log('\n❌ STRIPE_SECRET_KEY not found. Cannot check webhook configuration.', 'red');
      log('Please set STRIPE_SECRET_KEY in your environment variables.', 'yellow');
      return;
    }
    
    log('\n🌐 FETCHING WEBHOOK ENDPOINTS FROM STRIPE...', 'cyan');
    const webhooks = await getStripeWebhooks();
    
    if (webhooks.data && webhooks.data.length > 0) {
      log(`\n✅ Found ${webhooks.data.length} webhook endpoint(s):`, 'green');
      
      webhooks.data.forEach((webhook, index) => {
        log(`\n📌 Webhook ${index + 1}:`, 'bright');
        log(`   ID: ${webhook.id}`, 'blue');
        log(`   URL: ${webhook.url}`, 'blue');
        log(`   Status: ${webhook.status}`, webhook.status === 'enabled' ? 'green' : 'yellow');
        log(`   Created: ${new Date(webhook.created * 1000).toLocaleString()}`, 'blue');
        
        if (webhook.enabled_events && webhook.enabled_events.length > 0) {
          log(`   Events: ${webhook.enabled_events.join(', ')}`, 'blue');
        }
        
        // Check if this matches your expected URL
        const expectedUrl = process.env.NEXTAUTH_URL ? 
          `${process.env.NEXTAUTH_URL}/api/webhooks/stripe` : 
          'http://localhost:3000/api/webhooks/stripe';
        
        if (webhook.url === expectedUrl) {
          log(`   ✅ Matches expected URL`, 'green');
        } else {
          log(`   ⚠️  Does not match expected URL: ${expectedUrl}`, 'yellow');
        }
      });
    } else {
      log('\n❌ No webhook endpoints found in your Stripe account.', 'red');
      log('You need to create a webhook endpoint in Stripe Dashboard.', 'yellow');
    }
    
    log('\n📝 NEXT STEPS:', 'bright');
    log('1. If no webhooks found: Create one at https://dashboard.stripe.com/webhooks', 'yellow');
    log('2. If URL doesn\'t match: Update the webhook endpoint URL', 'yellow');
    log('3. If using localhost: Set up ngrok or similar tunnel service', 'yellow');
    log('4. Copy the webhook secret and set STRIPE_WEBHOOK_SECRET', 'yellow');
    
  } catch (error) {
    log(`\n❌ Error checking webhook configuration: ${error.message}`, 'red');
    log('Make sure STRIPE_SECRET_KEY is set correctly.', 'yellow');
  }
}

// Run the check
checkStripeWebhookConfiguration().catch(console.error);
