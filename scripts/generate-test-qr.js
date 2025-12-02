#!/usr/bin/env node

/**
 * Generate test QR codes for both old and new formats
 * Usage: node scripts/generate-test-qr.js [old|new]
 */

const crypto = require('crypto');

const format = process.argv[2] || 'new';

if (format === 'old') {
  // Generate old format QR code
  const ticketData = {
    ticketId: "68ada559e717636911bffc92", // Use your example ticket ID
    userId: "68ac85c7c944fbe6ab19a675",
    type: "ride",
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
  };
  
  const qrData = Buffer.from(JSON.stringify(ticketData)).toString("base64");
  const secret = process.env.NEXTAUTH_SECRET || "fallback-secret";
  const signature = crypto.createHmac("sha256", secret).update(qrData).digest("hex");
  const qrCode = `${qrData}.${signature}`;
  
  console.log('🎫 Old Format QR Code Generated');
  console.log('==============================\n');
  console.log('Ticket Data:', JSON.stringify(ticketData, null, 2));
  console.log('\nQR Code:');
  console.log(qrCode);
  
} else {
  // Generate new format QR code
  const ticketData = {
    qrId: `QR${Date.now().toString().slice(-8)}${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
    ticketId: "68ada559e717636911bffc92",
    userId: "68ac85c7c944fbe6ab19a675",
    orderId: "68afcaeeb60063ada1b4c33a",
    type: "package",
    itemId: "68af374c052ba1a4308851ff",
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    maxUsage: 5,
    currentUsage: 0,
    status: "valid",
    purchasePrice: 25.99,
    currency: "eur",
    version: 1,
    timestamp: Date.now(),
    security: crypto.randomBytes(8).toString('hex'),
    checksum: crypto.createHash('md5').update('test').digest('hex').substring(0, 8)
  };
  
  const qrData = Buffer.from(JSON.stringify(ticketData)).toString("base64");
  const secret = process.env.NEXTAUTH_SECRET || "fallback-secret";
  const signature = crypto.createHmac("sha256", secret).update(qrData).digest("hex");
  const qrCode = `${qrData}.${signature}`;
  
  console.log('🎫 New Format QR Code Generated');
  console.log('==============================\n');
  console.log('Ticket Data Keys:', Object.keys(ticketData));
  console.log('\nQR Code:');
  console.log(qrCode);
}

console.log('\n📱 How to Test:');
console.log('===============');
console.log('1. Copy the QR code above');
console.log('2. Go to /checker in your browser');
console.log('3. Login with admin/checker role');
console.log('4. Use "Manual QR Code Entry"');
console.log('5. Paste and validate');
