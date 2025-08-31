#!/usr/bin/env node

/**
 * Add Status Column to Cars Table
 * This script adds a status column to the cars table if it doesn't exist
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

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
  process.exit(1)
}

// Create Supabase client
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function addStatusColumn() {
  console.log('\n🔧 Adding status column to cars table...')
  
  try {
    // Check if status column already exists
    const { data: existingColumns, error: checkError } = await supabase
      .from('cars')
      .select('status')
      .limit(1)
    
    if (checkError && checkError.code === '42703') {
      // Column doesn't exist, add it
      console.log('📝 Status column does not exist, adding it...')
      
      const { error: alterError } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE cars 
          ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available' 
          CHECK (status IN ('available', 'sold', 'reserved', 'maintenance'))
        `
      })
      
      if (alterError) {
        console.error('❌ Failed to add status column:', alterError.message)
        return false
      }
      
      console.log('✅ Status column added successfully')
      
      // Update existing cars to have 'available' status
      const { error: updateError } = await supabase
        .from('cars')
        .update({ status: 'available' })
        .is('status', null)
      
      if (updateError) {
        console.warn('⚠️ Warning: Could not update existing cars:', updateError.message)
      } else {
        console.log('✅ Updated existing cars with default status')
      }
      
      return true
    } else if (checkError) {
      console.error('❌ Error checking status column:', checkError.message)
      return false
    } else {
      console.log('✅ Status column already exists')
      return true
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    return false
  }
}

async function main() {
  console.log('🚗 Adding Status Column to Cars Table\n')
  
  try {
    // Test connection
    console.log('🔌 Testing Supabase connection...')
    const { data, error } = await supabase
      .from('cars')
      .select('id')
      .limit(1)
    
    if (error && error.code !== 'PGRST116') {
      console.error('❌ Failed to connect to Supabase:', error.message)
      process.exit(1)
    }
    
    console.log('✅ Connected to Supabase successfully\n')
    
    // Add status column
    const success = await addStatusColumn()
    
    if (success) {
      console.log('\n🎉 Status column setup completed successfully!')
      console.log('\n📋 The cars table now has a status field with values:')
      console.log('   - available (default)')
      console.log('   - sold')
      console.log('   - reserved')
      console.log('   - maintenance')
    } else {
      console.error('\n❌ Failed to setup status column')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('\n❌ Script failed:', error.message)
    process.exit(1)
  }
}

main()
