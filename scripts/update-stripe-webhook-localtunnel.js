#!/usr/bin/env node

/**
 * Script to help update Stripe webhook endpoint when using LocalTunnel
 * Usage: node scripts/update-stripe-webhook-localtunnel.js https://your-subdomain.loca.lt
 */

const process = require('process');

function updateWebhookInstructions(localTunnelUrl) {
  console.log('🌐 STRIPE WEBHOOK UPDATE INSTRUCTIONS (LocalTunnel)');
  console.log('================================================\n');
  
  console.log('✅ LocalTunnel URL detected:', localTunnelUrl);
  console.log('');
  
  console.log('1. Go to Stripe Dashboard:');
  console.log('   https://dashboard.stripe.com/webhooks\n');
  
  console.log('2. Find your webhook endpoint and click "Edit"');
  console.log('   OR create a new endpoint\n');
  
  console.log('3. Update the endpoint URL to:');
  console.log(`   ${localTunnelUrl}/api/webhooks/stripe\n`);
  
  console.log('4. Ensure these events are selected:');
  console.log('   ✓ checkout.session.completed');
  console.log('   ✓ payment_intent.succeeded');
  console.log('   ✓ payment_intent.payment_failed\n');
  
  console.log('5. Copy the webhook secret and update your .env:');
  console.log('   STRIPE_WEBHOOK_SECRET=whsec_...\n');
  
  console.log('6. Also update your .env with:');
  console.log(`   NEXTAUTH_URL=${localTunnelUrl}\n`);
  
  console.log('7. Restart your Next.js app after updating .env:');
  console.log('   npm run dev\n');
  
  console.log('🔧 LOCALTUNNEL NOTES:');
  console.log('====================');
  console.log('• LocalTunnel URLs are more stable than ngrok free tier');
  console.log('• Your subdomain might stay the same across sessions');
  console.log('• If you get a new URL, repeat this process');
  console.log('• Keep LocalTunnel running while testing\n');
  
  console.log('🧪 TEST YOUR WEBHOOK:');
  console.log('===================');
  console.log('1. Make a test purchase on your site');
  console.log('2. Check webhook logs in Stripe Dashboard');
  console.log('3. Check your app console for webhook processing logs');
  console.log('4. Look for these success messages:');
  console.log('   - "Creating ticket for [type]: [id] - Price: €[amount]"');
  console.log('   - "Generated QR code for ticket [id]"');
  console.log('   - "Generated [count] tickets for order [id]"\n');
}

// Get LocalTunnel URL from command line argument
const ltUrl = process.argv[2];

if (!ltUrl) {
  console.error('❌ Please provide your LocalTunnel URL');
  console.log('Usage: node scripts/update-stripe-webhook-localtunnel.js https://your-subdomain.loca.lt');
  console.log('');
  console.log('Example with your current URL:');
  console.log('node scripts/update-stripe-webhook-localtunnel.js https://ripe-pears-stick.loca.lt');
  process.exit(1);
}

// Validate URL format
if (!ltUrl.startsWith('https://') || !ltUrl.includes('.loca.lt')) {
  console.error('❌ Invalid LocalTunnel URL format');
  console.log('Expected format: https://subdomain.loca.lt');
  console.log('Your URL should end with .loca.lt');
  process.exit(1);
}

updateWebhookInstructions(ltUrl);
