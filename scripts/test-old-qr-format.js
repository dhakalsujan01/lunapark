#!/usr/bin/env node

const crypto = require('crypto');

// Your example QR code
const oldQrCode = 'eyJ0aWNrZXRJZCI6IjY4YWRhNTU5ZTcxNzYzNjkxMWJmZmM5MiIsInVzZXJJZCI6IjY4YWM4NWM3Yzk0NGZiZTZhYjE5YTY3NSIsInR5cGUiOiJyaWRlIiwidmFsaWRVbnRpbCI6IjIwMjUtMDktMjVUMTI6MTU6MjEuNzkwWiJ9.66891321b9ce616cf79c1521c4061327ff0b61a42f6f5656d067a9ad412c7099';

console.log('🧪 Testing Old QR Code Format Compatibility');
console.log('==========================================\n');

// Parse the QR code
const [qrData, providedSignature] = oldQrCode.split('.');
const decodedData = JSON.parse(Buffer.from(qrData, 'base64').toString());

console.log('📊 Old QR Code Data:');
console.log('====================');
console.log('Ticket ID:', decodedData.ticketId);
console.log('User ID:', decodedData.userId);
console.log('Type:', decodedData.type);
console.log('Valid Until:', decodedData.validUntil);
console.log('');

// Test signature validation with current secret
const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret';
const expectedSignature = crypto.createHmac('sha256', secret).update(qrData).digest('hex');

console.log('🔐 Signature Validation:');
console.log('========================');
console.log('Provided signature:', providedSignature.substring(0, 20) + '...');
console.log('Expected signature:', expectedSignature.substring(0, 20) + '...');
console.log('Signatures match:', providedSignature === expectedSignature);
console.log('');

// Generate a new valid QR code with current secret for testing
const newValidQr = qrData + '.' + expectedSignature;

console.log('✅ Test Results:');
console.log('===============');
if (providedSignature === expectedSignature) {
  console.log('✅ Old QR code is VALID with current secret');
  console.log('✅ Can be used directly in checker');
} else {
  console.log('❌ Old QR code signature is INVALID with current secret');
  console.log('📝 This means the secret has changed since this ticket was created');
  console.log('');
  console.log('🔧 Updated QR code with current secret:');
  console.log('=====================================');
  console.log(newValidQr);
}

console.log('');
console.log('📱 How to Test:');
console.log('===============');
console.log('1. Go to /checker in your browser');
console.log('2. Login with admin/checker role');
console.log('3. Use "Manual QR Code Entry"');
console.log('4. Paste this QR code:');
console.log(providedSignature === expectedSignature ? oldQrCode : newValidQr);
console.log('5. Click Validate');
console.log('');
console.log('📋 Expected Behavior:');
console.log('=====================');
console.log('- Should find ticket by ID:', decodedData.ticketId);
console.log('- Should validate signature');
console.log('- Should check ticket status and validity');
console.log('- Should mark ticket as used if valid');
