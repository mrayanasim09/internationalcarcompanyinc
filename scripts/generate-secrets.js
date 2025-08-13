#!/usr/bin/env node

const crypto = require('crypto');

console.log('🔐 Secure Secret Generator for AM Tycoons Inc.\n');

console.log('⚠️  SECURITY WARNING:');
console.log('• Never share these secrets in plain text');
console.log('• Use different secrets for development and production');
console.log('• Store them securely in your .env.local file');
console.log('• Never commit .env.local to version control\n');

// Generate NextAuth secret
const nextAuthSecret = crypto.randomBytes(32).toString('base64');

// Generate a secure random string for other secrets
const generateSecureString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

console.log('📋 GENERATED SECRETS:\n');

console.log('# =========================');
console.log('# 🔐 NextAuth Secret');
console.log('# =========================');
console.log(`NEXTAUTH_SECRET=${nextAuthSecret}\n`);

console.log('# =========================');
console.log('# 🔒 Additional Security');
console.log('# =========================');
console.log(`JWT_SECRET=${generateSecureString(32)}`);
console.log(`SESSION_SECRET=${generateSecureString(32)}`);
console.log(`COOKIE_SECRET=${generateSecureString(32)}`);
console.log(`TOTP_SECRET=${generateSecureString(32)}\n`);

console.log('📝 NEXT STEPS:');
console.log('1. Copy these secrets to your .env.local file');
console.log('2. Generate new Firebase API key from Firebase Console');
console.log('3. Generate new Cloudinary credentials from Cloudinary Dashboard');
console.log('4. Update all environment variables with new credentials');
console.log('5. Test the application with new credentials');
console.log('6. Deploy with secure environment variables\n');

console.log('🔗 USEFUL LINKS:');
console.log('• Firebase Console: https://console.firebase.google.com');
console.log('• Cloudinary Dashboard: https://cloudinary.com/console');
console.log('• Netlify Environment Variables: https://docs.netlify.com/environment-variables/overview/\n');

console.log('✅ Remember to revoke old credentials immediately!');
