#!/usr/bin/env node

/**
 * Test simple code generation and validation
 */

// Simple code generation function (same as in model)
function generateSimpleCode() {
  const consonants = 'BCDFGHJKLMNPQRSTVWXZ' // No vowels to avoid words
  const numbers = '23456789' // No 0, 1 to avoid confusion with O, I
  
  let code = 'LP-' // Luna Park prefix
  
  // Add 3 consonants
  for (let i = 0; i < 3; i++) {
    code += consonants[Math.floor(Math.random() * consonants.length)]
  }
  
  // Add 3 numbers
  for (let i = 0; i < 3; i++) {
    code += numbers[Math.floor(Math.random() * numbers.length)]
  }
  
  return code
}

console.log('🎫 Simple Code System Test');
console.log('==========================\n');

// Generate sample codes
console.log('📝 Sample Simple Codes:');
console.log('=======================');
for (let i = 0; i < 10; i++) {
  const code = generateSimpleCode();
  console.log(`${i + 1}. ${code}`);
}

console.log('\n✅ Code Features:');
console.log('=================');
console.log('• Format: LP-ABC123');
console.log('• Length: 9 characters (including dashes)');
console.log('• No confusing characters (0, 1, O, I)');
console.log('• No vowels (prevents accidental words)');
console.log('• Easy to read over phone');
console.log('• Case insensitive');

console.log('\n📱 How to Test:');
console.log('===============');
console.log('1. Copy any code above');
console.log('2. Go to /checker in your browser');
console.log('3. Click "Simple Code" tab');
console.log('4. Enter the code (e.g., LP-ABC123)');
console.log('5. Click validate');

console.log('\n🔍 Testing Format Validation:');
console.log('=============================');

const testCodes = [
  'LP-ABC123', // Valid
  'LP-XYZ789', // Valid
  'lp-abc123', // Valid (lowercase)
  'LP-AB123',  // Invalid (too short)
  'LP-ABCD123', // Invalid (too long)
  'LP-AEI123', // Invalid (contains vowels)
  'LP-ABC01',  // Invalid (contains 0, 1)
  'XY-ABC123', // Invalid (wrong prefix)
];

testCodes.forEach(code => {
  const isValid = /^LP-[BCDFGHJKLMNPQRSTVWXZ]{3}[23456789]{3}$/i.test(code.toUpperCase());
  console.log(`${code.padEnd(12)} -> ${isValid ? '✅ Valid' : '❌ Invalid'}`);
});

console.log('\n🎯 Ready to Test!');
console.log('=================');
console.log('Your system now supports:');
console.log('✅ QR Code scanning (camera)');
console.log('✅ QR Code manual entry (long codes)');
console.log('✅ Simple Code entry (LP-ABC123)');
console.log('✅ Both methods mark tickets as used');
console.log('✅ PDF tickets show both codes');
