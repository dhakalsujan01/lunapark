#!/usr/bin/env node

/**
 * Script to help update Stripe webhook endpoint when using ngrok
 * Usage: node scripts/update-stripe-webhook.js https://your-ngrok-url.ngrok-free.app
 */

const process = require('process');

function updateWebhookInstructions(ngrokUrl) {
  console.log('🔗 STRIPE WEBHOOK UPDATE INSTRUCTIONS');
  console.log('=====================================\n');
  
  console.log('1. Go to Stripe Dashboard:');
  console.log('   https://dashboard.stripe.com/webhooks\n');
  
  console.log('2. Find your webhook endpoint and click "Edit"');
  console.log('   OR create a new endpoint\n');
  
  console.log('3. Update the endpoint URL to:');
  console.log(`   ${ngrokUrl}/api/webhooks/stripe\n`);
  
  console.log('4. Ensure these events are selected:');
  console.log('   ✓ checkout.session.completed');
  console.log('   ✓ payment_intent.succeeded');
  console.log('   ✓ payment_intent.payment_failed\n');
  
  console.log('5. Copy the webhook secret and update your .env:');
  console.log('   STRIPE_WEBHOOK_SECRET=whsec_...\n');
  
  console.log('6. Also update your .env with:');
  console.log(`   NEXTAUTH_URL=${ngrokUrl}\n`);
  
  console.log('7. Restart your Next.js app after updating .env\n');
  
  console.log('🧪 TEST YOUR WEBHOOK:');
  console.log('===================');
  console.log('1. Make a test purchase on your site');
  console.log('2. Check webhook logs in Stripe Dashboard');
  console.log('3. Check your app console for webhook processing logs\n');
}

// Get ngrok URL from command line argument
const ngrokUrl = process.argv[2];

if (!ngrokUrl) {
  console.error('❌ Please provide your ngrok URL');
  console.log('Usage: node scripts/update-stripe-webhook.js https://your-ngrok-url.ngrok-free.app');
  process.exit(1);
}

// Validate URL format
if (!ngrokUrl.startsWith('https://') || !ngrokUrl.includes('.ngrok')) {
  console.error('❌ Invalid ngrok URL format');
  console.log('Expected format: https://xxxxxx.ngrok-free.app');
  process.exit(1);
}

updateWebhookInstructions(ngrokUrl);
