#!/usr/bin/env node

/**
 * Generate CSRF Secret
 * This script generates a persistent CSRF secret for the application
 */

import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

console.log('🔐 CSRF Secret Generator')
console.log('========================\n')

// Generate a secure random secret
const csrfSecret = crypto.randomBytes(32).toString('hex')

console.log('Generated CSRF Secret:')
console.log(csrfSecret)
console.log('\n📝 To use this secret:')
console.log('1. Create a .env.local file in your project root')
console.log('2. Add this line:')
console.log(`   CSRF_SECRET=${csrfSecret}`)
console.log('\n3. Restart your development server')

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  console.log('\n⚠️  .env.local already exists!')
  console.log('Please add this line to your existing file:')
  console.log(`CSRF_SECRET=${csrfSecret}`)
} else {
  console.log('\n✅ Creating .env.local file...')
  const envContent = `# CSRF Security
CSRF_SECRET=${csrfSecret}

# Other environment variables can be added here
`
  fs.writeFileSync(envPath, envContent)
  console.log('✅ .env.local created successfully!')
  console.log('Please restart your development server for changes to take effect.')
}

console.log('\n🔒 Security Note:')
console.log('- Keep this secret secure and never commit it to version control')
console.log('- Use different secrets for development, staging, and production')
console.log('- The .env.local file is already in .gitignore')
