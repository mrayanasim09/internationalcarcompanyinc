#!/usr/bin/env node

/**
 * Script to add verification_code columns to admin_users table
 * Usage: node scripts/setup-verification-columns.js
 */

const fs = require('fs');
const path = require('path');

async function setupVerificationColumns() {
  try {
    console.log('🔧 Setting up verification columns for admin_users table...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'add-verification-columns.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 SQL script loaded successfully');
    console.log('\n📋 SQL to execute:');
    console.log('='.repeat(50));
    console.log(sql);
    console.log('='.repeat(50));
    
    console.log('\n⚠️  IMPORTANT:');
    console.log('1. Copy the SQL above');
    console.log('2. Go to your Supabase dashboard');
    console.log('3. Navigate to SQL Editor');
    console.log('4. Paste and execute the SQL');
    console.log('5. Verify the columns were added successfully');
    
    console.log('\n✅ Setup instructions provided');
    
  } catch (error) {
    console.error('❌ Error setting up verification columns:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  setupVerificationColumns();
}

module.exports = { setupVerificationColumns };
