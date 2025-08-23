#!/usr/bin/env node

/**
 * Debug Car Sources
 * This script helps identify where cars are coming from in the application
 */

console.log('🔍 Car Sources Debug Script')
console.log('==========================\n')

// Check featured cars component
console.log('1. Checking featured cars component paths...')
console.log('   - /components/featured-cars-ssr.tsx (server-side)')
console.log('   - /components/featured-cars.tsx (client-side)')

// Check API endpoints
console.log('\n2. Checking API endpoints...')
console.log('   - /api/admin/cars (admin endpoint)')
console.log('   - Database connection: components fetch from Supabase')

// Check for any cached data
console.log('\n3. Possible sources of mock data:')
console.log('   - Browser cache (check DevTools > Application > Storage)')
console.log('   - Service Worker cache (check /sw.js)')
console.log('   - Local Storage')
console.log('   - Session Storage')

// Check environment
console.log('\n4. Environment to check:')
console.log('   - Database: Only 1 car should be in Supabase')
console.log('   - Website: 3 cars showing (2 are coming from somewhere)')

console.log('\n📝 Next steps:')
console.log('1. Clear browser cache completely')
console.log('2. Check if Service Worker is caching old data')
console.log('3. Verify Supabase connection is working')
console.log('4. Check if local/session storage has cached cars')

console.log('\n🧪 Quick test commands:')
console.log('- localStorage.clear() (in browser console)')
console.log('- sessionStorage.clear() (in browser console)')
console.log('- Hard refresh: Ctrl+Shift+R (PC) or Cmd+Shift+R (Mac)')
