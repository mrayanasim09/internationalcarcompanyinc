#!/usr/bin/env node

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

console.log('🔧 Website Setup Script for International Car Company Inc\n');

// Generate secure secrets
const generateSecureString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

const nextAuthSecret = crypto.randomBytes(32).toString('base64');
const jwtSecret = generateSecureString(32);
const sessionSecret = generateSecureString(32);
const encryptionKey = generateSecureString(32);

// Create .env.local content
const envContent = `# =========================
# 🔐 Authentication & Security
# =========================
NEXTAUTH_SECRET=${nextAuthSecret}
JWT_SECRET=${jwtSecret}
SESSION_SECRET=${sessionSecret}
ENCRYPTION_KEY=${encryptionKey}
NEXTAUTH_URL=http://localhost:3000

# =========================
# 👤 Admin Configuration
# =========================
SUPER_ADMIN_EMAIL=admin@internationalcarcompanyinc.com
DEFAULT_ADMIN_PASSWORD=Admin123!
NEXT_PUBLIC_ADMIN_EMAILS=admin@internationalcarcompanyinc.com

# =========================
# 📧 Email Configuration (Resend)
# =========================
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_1234567890abcdef
FROM_EMAIL=noreply@internationalcarcompanyinc.com

# =========================
# 🗄️ Database Configuration (Supabase)
# =========================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
DATABASE_URL=https://your-project.supabase.co
DATABASE_API_KEY=your-supabase-anon-key
SUPABASE_STORAGE_BUCKET=car-images

# =========================
# 🔒 Security & Rate Limiting
# =========================
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000
CORS_ORIGIN=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,https://internationalcarcompanyinc.com

# =========================


# =========================
# 📊 Analytics & Monitoring
# =========================
NEXT_PUBLIC_GA_ID=G-SV90G9ZG56

# =========================
# 🚀 Development Settings
# =========================
SKIP_ENV_VALIDATION=true
NODE_ENV=development
`;

// Check if .env.local already exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists. Backing up to .env.local.backup');
  fs.copyFileSync(envPath, envPath + '.backup');
}

// Write .env.local file
try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file with basic configuration');
} catch (error) {
  console.error('❌ Failed to create .env.local file:', error.message);
  console.log('\n📝 Please create .env.local manually with the following content:');
  console.log(envContent);
}

console.log('\n📋 NEXT STEPS TO COMPLETE SETUP:');
console.log('1. Update Supabase configuration:');
console.log('   - Go to https://app.supabase.com');
console.log('   - Create a new project or use existing one');
console.log('   - Copy your project URL and anon key');
console.log('   - Update NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
console.log('');
console.log('2. Set up email service (Resend):');
console.log('   - Go to https://resend.com');
console.log('   - Create an account and get your API key');
console.log('   - Update EMAIL_API_KEY in .env.local');
console.log('');

console.log('');
console.log('4. Start the development server:');
console.log('   npm run dev');
console.log('');
console.log('5. Access the website:');
console.log('   http://localhost:3000');
console.log('');
console.log('🔗 Useful Links:');
console.log('• Supabase Dashboard: https://app.supabase.com');
console.log('• Resend Dashboard: https://resend.com');
console.log('');
console.log('');
console.log('⚠️  IMPORTANT:');
console.log('• Never commit .env.local to version control');
console.log('• Use different secrets for production');
console.log('• Update all placeholder values with real credentials');
console.log('');
console.log('✅ Setup script completed!');
