#!/usr/bin/env node

/**
 * Test simple code generation to ensure it's working properly
 */

console.log('🔧 Simple Code Generation Test');
console.log('==============================\n');

// Mock the simple code generation function (same as in model)
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

// Test the generation
console.log('🧪 Testing Simple Code Generation:');
console.log('==================================');

for (let i = 0; i < 5; i++) {
  const code = generateSimpleCode()
  console.log(`${i + 1}. Generated: ${code}`)
  
  // Validate format
  const isValid = /^LP-[BCDFGHJKLMNPQRSTVWXZ]{3}[23456789]{3}$/.test(code)
  console.log(`   Format: ${isValid ? '✅ Valid' : '❌ Invalid'}`)
  console.log('')
}

console.log('🔍 Format Validation:');
console.log('=====================');
console.log('✅ Must start with "LP-"');
console.log('✅ Followed by 3 consonants (no vowels)');
console.log('✅ Ending with 3 numbers (no 0 or 1)');
console.log('✅ Total length: 9 characters');

console.log('\n🚨 Common Issues & Solutions:');
console.log('==============================');
console.log('❌ "Generating..." stuck → Check webhook saves ticket twice');
console.log('❌ No simple code → Ensure generateSimpleCode() called after save');
console.log('❌ Duplicate codes → Check unique index on simpleCode field');

console.log('\n📋 Next Steps:');
console.log('===============');
console.log('1. Restart your Next.js server (npm run dev)');
console.log('2. Purchase a new ticket to test generation');
console.log('3. Check MongoDB for simpleCode field');
console.log('4. Verify webhook logs show "Generating simple code"');
