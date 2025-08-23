// Debug Cookie Issues
// Run this in your browser console on the admin login page

console.log('🍪 Cookie Debug Script')
console.log('======================\n')

// Check all cookies
console.log('📋 All Cookies:')
console.log(document.cookie)

// Check specific admin cookies
const adminCookies = {
  verified: document.cookie.includes('icc_admin_verified=1'),
  token: document.cookie.includes('icc_admin_token'),
  refresh: document.cookie.includes('icc_admin_refresh')
}

console.log('\n🔐 Admin Cookie Status:')
console.log('icc_admin_verified:', adminCookies.verified)
console.log('icc_admin_token:', adminCookies.token)
console.log('icc_admin_refresh:', adminCookies.refresh)

// Test /api/admin/me endpoint
console.log('\n🧪 Testing /api/admin/me endpoint...')
fetch('/api/admin/me', { credentials: 'include' })
  .then(res => {
    console.log('Response status:', res.status)
    console.log('Response headers:', Object.fromEntries(res.headers.entries()))
    return res.json()
  })
  .then(data => {
    console.log('Response data:', data)
  })
  .catch(error => {
    console.error('Error:', error)
  })

// Check if we're on the right domain
console.log('\n🌐 Domain Info:')
console.log('Current domain:', window.location.hostname)
console.log('Protocol:', window.location.protocol)
console.log('Full URL:', window.location.href)

console.log('\n💡 Next Steps:')
console.log('1. Check if cookies are being set by the server')
console.log('2. Verify domain settings in cookie headers')
console.log('3. Check if there are any CORS or security issues')
