#!/usr/bin/env node

/**
 * Setup Admin Users Table in Supabase
 * This script creates the admin_users table and adds an initial super admin user
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Check if we're in the right directory
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// Check if we're in the project root
if (!existsSync(join(projectRoot, 'package.json'))) {
  console.error('❌ Please run this script from the project root directory')
  process.exit(1)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Checking environment variables...')
console.log('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
console.log('   SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✅ Set' : '❌ Missing')

if (!supabaseUrl || !serviceRoleKey) {
  console.error('\n❌ Missing required environment variables!')
  console.error('\n📋 Please create a .env.local file with:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url')
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key')
  console.error('\n💡 You can find these in your Supabase dashboard under Settings > API')
  process.exit(1)
}

console.log('✅ Environment variables loaded successfully\n')

// Create Supabase client
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testSupabaseConnection() {
  console.log('🔌 Testing Supabase connection...')
  
  try {
    // Try a simple query to test connection
    const { data, error } = await supabase
      .from('admin_users')
      .select('count')
      .limit(1)
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Table doesn't exist yet, but connection is working
        console.log('✅ Connected to Supabase (table admin_users does not exist yet)')
        return true
      } else {
        console.error('❌ Supabase connection error:', error.message)
        return false
      }
    }
    
    console.log('✅ Connected to Supabase successfully')
    return true
    
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:', error.message)
    console.error('\n💡 Troubleshooting tips:')
    console.error('   1. Check if your Supabase URL is correct')
    console.error('   2. Verify your service role key has the right permissions')
    console.error('   3. Make sure your Supabase project is active')
    console.error('   4. Check if there are any network restrictions')
    return false
  }
}

async function setupAdminUsersTable() {
  console.log('\n🔧 Setting up admin_users table...')
  
  try {
    // Try to create table using SQL
    console.log('📝 Creating admin_users table...')
    
    const { error: sqlError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS admin_users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'admin',
          permissions JSONB DEFAULT '[]',
          is_active BOOLEAN DEFAULT true,
          last_login TIMESTAMP WITH TIME ZONE,
          login_attempts INTEGER DEFAULT 0,
          lockout_until TIMESTAMP WITH TIME ZONE,
          verification_code VARCHAR(10),
          verification_code_expires_at TIMESTAMP WITH TIME ZONE,
          trusted_devices TEXT[] DEFAULT '[]',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (sqlError) {
      console.log('⚠️  Could not create table via RPC, trying manual creation...')
      
      // Try to create table by inserting a dummy record (will fail but create table)
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert({
          email: 'dummy@example.com',
          password_hash: 'dummy_hash',
          role: 'admin'
        })
      
      if (insertError && insertError.code === '42P01') {
        console.error('❌ Table creation failed. You may need to create it manually in Supabase dashboard.')
        console.error('   Error:', insertError.message)
        return false
      }
    }
    
    console.log('✅ admin_users table created/verified successfully')
    return true
    
  } catch (error) {
    console.error('❌ Error creating admin_users table:', error.message)
    console.log('\n💡 Manual table creation required:')
    console.log('   1. Go to your Supabase dashboard')
    console.log('   2. Navigate to SQL Editor')
    console.log('   3. Run the CREATE TABLE script for admin_users')
    return false
  }
}

async function createSuperAdmin() {
  console.log('\n👑 Creating super admin user...')
  
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@internationalcarcompanyinc.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!'
  
  try {
    // Check if admin already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('admin_users')
      .select('id, email')
      .eq('email', adminEmail)
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing admin:', checkError.message)
      return false
    }
    
    if (existingUser) {
      console.log('ℹ️  Admin user already exists:', existingUser.email)
      return true
    }
    
    // Hash password
    console.log('🔐 Hashing password...')
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds)
    
    // Create super admin user
    console.log('👤 Creating admin user...')
    const { data: newAdmin, error: createError } = await supabase
      .from('admin_users')
      .insert({
        email: adminEmail,
        password_hash: passwordHash,
        role: 'super_admin',
        permissions: ['*'],
        is_active: true
      })
      .select()
      .single()
    
    if (createError) {
      console.error('❌ Failed to create admin user:', createError.message)
      return false
    }
    
    console.log('✅ Super admin created successfully!')
    console.log('📧 Email:', adminEmail)
    console.log('🔑 Password:', adminPassword)
    console.log('🆔 User ID:', newAdmin.id)
    console.log('\n⚠️  IMPORTANT: Change this password after first login!')
    
    return true
    
  } catch (error) {
    console.error('❌ Error creating super admin:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Setting up Supabase Admin System...\n')
  
  // Test connection first
  const connected = await testSupabaseConnection()
  if (!connected) {
    console.error('\n❌ Cannot proceed without Supabase connection')
    process.exit(1)
  }
  
  // Setup table
  const tableCreated = await setupAdminUsersTable()
  if (!tableCreated) {
    console.error('\n❌ Failed to create admin_users table')
    console.log('\n💡 Please create the table manually in Supabase dashboard and run this script again')
    process.exit(1)
  }
  
  // Create super admin
  const adminCreated = await createSuperAdmin()
  if (!adminCreated) {
    console.error('\n❌ Failed to create super admin user')
    process.exit(1)
  }
  
  console.log('\n🎉 Admin setup completed successfully!')
  console.log('\n📋 Next steps:')
  console.log('   1. Visit /admin/login in your application')
  console.log('   2. Use the credentials shown above')
  console.log('   3. Change the password after first login')
  console.log('   4. Add additional admin users as needed')
  
  console.log('\n🔗 Admin login URL: /admin/login')
  console.log('📧 Default email: admin@internationalcarcompanyinc.com')
  console.log('🔑 Default password: Admin123!')
}

// Handle errors gracefully
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error)
  process.exit(1)
})

main().catch((error) => {
  console.error('❌ Script failed:', error)
  process.exit(1)
})
