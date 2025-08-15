#!/usr/bin/env node

const crypto = require('crypto');

console.log('🔐 Secure Secret Generator for International Car Company Inc.\n');

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
console.log('2. Generate new Supabase credentials from Supabase Dashboard');
console.log('3. Generate new Resend API key from Resend Dashboard');
console.log('4. Generate new reCAPTCHA keys from Google reCAPTCHA');
console.log('5. Generate new JWT secret (32+ characters)');
console.log('6. Generate new session and encryption keys');
console.log('7. Set up admin email and password');
console.log('8. Configure rate limiting settings');
console.log('9. Set up IP whitelisting for admin access');

console.log('');
console.log('🔗 Useful Links:');
console.log('• Supabase Dashboard: https://app.supabase.com');
console.log('• Resend Dashboard: https://resend.com');
console.log('• Google reCAPTCHA: https://www.google.com/recaptcha/admin');
console.log('• JWT Secret Generator: https://generate-secret.vercel.app/32');
console.log('• Password Generator: https://passwordsgenerator.net/');

console.log('✅ Remember to revoke old credentials immediately!');
