#!/usr/bin/env node

/**
 * Simple test script to verify QR code validation works properly
 * This simulates what happens when a QR code is scanned
 */

const crypto = require('crypto');

// Mock ticket data (similar to what's generated in the ticket model)
const mockTicketData = {
  qrId: "QR12345678ABCDEF123456",
  ticketId: "507f1f77bcf86cd799439011", // Mock ObjectId
  userId: "507f1f77bcf86cd799439012",
  orderId: "507f1f77bcf86cd799439013",
  type: "package",
  itemId: "507f1f77bcf86cd799439014",
  validFrom: new Date().toISOString(),
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
  maxUsage: 5,
  currentUsage: 0,
  status: "valid",
  purchasePrice: 25.99,
  currency: "eur",
  version: 1,
  timestamp: Date.now(),
  security: crypto.randomBytes(8).toString('hex'),
  checksum: crypto.createHash('md5').update('test-data').digest('hex').substring(0, 8)
};

function generateTestQRCode() {
  console.log('🧪 Testing QR Code Generation and Validation');
  console.log('=============================================\n');

  // Step 1: Generate QR code data (same as in Ticket model)
  const qrData = Buffer.from(JSON.stringify(mockTicketData)).toString("base64");
  const secret = process.env.NEXTAUTH_SECRET || "fallback-secret";
  const signature = crypto.createHmac("sha256", secret).update(qrData).digest("hex");
  
  const fullQRCode = `${qrData}.${signature}`;
  
  console.log('📊 Generated QR Code:');
  console.log('=====================');
  console.log(`QR Data Length: ${qrData.length} characters`);
  console.log(`Signature Length: ${signature.length} characters`);
  console.log(`Full QR Code Length: ${fullQRCode.length} characters`);
  console.log(`Full QR Code (first 100 chars): ${fullQRCode.substring(0, 100)}...`);
  console.log('');

  // Step 2: Parse QR code (same as in validation API)
  console.log('🔍 Testing QR Code Parsing:');
  console.log('===========================');
  
  const [parsedQrData, parsedSignature] = fullQRCode.split(".");
  
  if (!parsedQrData || !parsedSignature) {
    console.error('❌ Failed to parse QR code - missing data or signature');
    return;
  }
  
  console.log('✅ QR code parsed successfully');
  console.log(`Parsed data length: ${parsedQrData.length}`);
  console.log(`Parsed signature length: ${parsedSignature.length}`);
  
  // Step 3: Decode QR data
  try {
    const decodedData = JSON.parse(Buffer.from(parsedQrData, "base64").toString());
    console.log('✅ QR data decoded successfully');
    console.log('Decoded ticket data:');
    console.log(`- QR ID: ${decodedData.qrId}`);
    console.log(`- Ticket ID: ${decodedData.ticketId}`);
    console.log(`- Type: ${decodedData.type}`);
    console.log(`- Status: ${decodedData.status}`);
    console.log(`- Price: €${decodedData.purchasePrice}`);
    console.log(`- Valid until: ${new Date(decodedData.validUntil).toLocaleDateString()}`);
    console.log('');
  } catch (error) {
    console.error('❌ Failed to decode QR data:', error.message);
    return;
  }
  
  // Step 4: Validate signature
  console.log('🔐 Testing Signature Validation:');
  console.log('================================');
  
  const expectedSignature = crypto.createHmac("sha256", secret).update(parsedQrData).digest("hex");
  const isValidSignature = parsedSignature === expectedSignature;
  
  if (isValidSignature) {
    console.log('✅ Signature validation passed');
  } else {
    console.log('❌ Signature validation failed');
    console.log(`Expected: ${expectedSignature.substring(0, 20)}...`);
    console.log(`Received: ${parsedSignature.substring(0, 20)}...`);
  }
  
  console.log('\n🎉 QR Code Test Summary:');
  console.log('========================');
  console.log(`✅ QR Code Generation: PASSED`);
  console.log(`✅ QR Code Parsing: PASSED`);
  console.log(`✅ Data Decoding: PASSED`);
  console.log(`${isValidSignature ? '✅' : '❌'} Signature Validation: ${isValidSignature ? 'PASSED' : 'FAILED'}`);
  
  console.log('\n📱 Test QR Code for Manual Entry:');
  console.log('==================================');
  console.log('Copy this QR code to test in your checker:');
  console.log(fullQRCode);
  console.log('\n📝 Instructions:');
  console.log('1. Go to /checker in your browser');
  console.log('2. Use "Manual QR Code Entry"');
  console.log('3. Paste the QR code above');
  console.log('4. Click Validate');
}

generateTestQRCode();
