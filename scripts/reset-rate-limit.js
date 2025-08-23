#!/usr/bin/env node

/**
 * Reset Rate Limit Script
 * This script helps reset rate limits when testing admin login
 */

console.log('🔄 Rate Limit Reset Helper')
console.log('==========================\n')

console.log('📝 To reset your rate limit, you have a few options:\n')

console.log('1. 🔄 Wait for automatic reset:')
console.log('   - Current 2FA limit: 10 attempts per 10 minutes')
console.log('   - Block duration: 15 minutes (reduced from 30)')
console.log('   - You can wait for the block to expire\n')

console.log('2. 🚀 Deploy the updated rate limiter:')
console.log('   - The rate limits have been updated to be more reasonable')
console.log('   - 2FA: 10 attempts per 10 minutes (was 3 per 5 minutes)')
console.log('   - Block duration: 15 minutes (was 30 minutes)\n')

console.log('3. 🧪 Test the reset endpoint (after deployment):')
console.log('   - POST to /api/admin/reset-rate-limit')
console.log('   - Body: { "clientId": "your-ip-address", "type": "twoFA" }\n')

console.log('📊 Current Rate Limit Status:')
console.log('   - You hit the limit of 3 attempts')
console.log('   - New limit will be 10 attempts')
console.log('   - Block expires in ~15 minutes\n')

console.log('🚀 Next Steps:')
console.log('1. Deploy the updated rate limiter code')
console.log('2. Wait for the current block to expire (or use reset endpoint)')
console.log('3. Try admin login again with the new, higher limits')

console.log('\n💡 Tip: The rate limits are now much more reasonable for legitimate users!')
