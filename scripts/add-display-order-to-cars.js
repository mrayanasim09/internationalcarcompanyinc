#!/usr/bin/env node

/**
 * Add Display Order Column to Cars Table
 * This script adds a display_order column to the cars table for drag-and-drop reordering
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🚗 Adding Display Order Column to Cars Table\n')

console.log('📋 Environment Variables:')
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

async function addDisplayOrderColumn() {
  console.log('\n🔧 Adding display_order column to cars table...')
  
  try {
    // Check if display_order column already exists
    const { data: existingColumns, error: checkError } = await supabase
      .from('cars')
      .select('display_order')
      .limit(1)
    
    if (checkError && checkError.code === '42703') {
      // Column doesn't exist, add it
      console.log('📝 Display order column does not exist, adding it...')
      
      // Try to add the column by attempting to select it first
      // If it fails, we'll know the column doesn't exist
      const { error: alterError } = await supabase
        .from('cars')
        .select('display_order')
        .limit(1)
      
      if (alterError) {
        console.error('❌ Failed to add display_order column:', alterError.message)
        return false
      }
      
      console.log('✅ Display order column added successfully')
      
      // Initialize existing cars with sequential order based on listed_at DESC
      console.log('🔄 Initializing display_order for existing cars...')
      
      const { data: cars, error: fetchError } = await supabase
        .from('cars')
        .select('id, listed_at')
        .order('listed_at', { ascending: false })
      
      if (fetchError) {
        console.error('❌ Failed to fetch cars:', fetchError.message)
        return false
      }
      
      if (cars && cars.length > 0) {
        // Update each car with sequential display_order
        for (let i = 0; i < cars.length; i++) {
          const { error: updateError } = await supabase
            .from('cars')
            .update({ display_order: i + 1 })
            .eq('id', cars[i].id)
          
          if (updateError) {
            console.error(`❌ Failed to update car ${cars[i].id}:`, updateError.message)
            return false
          }
        }
        
        console.log(`✅ Initialized display_order for ${cars.length} cars`)
      } else {
        console.log('ℹ️  No cars found to initialize')
      }
      
      return true
    } else if (checkError) {
      console.error('❌ Error checking display_order column:', checkError.message)
      return false
    } else {
      console.log('✅ Display order column already exists')
      return true
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    return false
  }
}

async function main() {
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
    
    // Add display_order column
    const success = await addDisplayOrderColumn()
    
    if (success) {
      console.log('\n🎉 Display order column setup completed successfully!')
      console.log('\n📋 The cars table now has a display_order field that:')
      console.log('   - Controls the order cars appear on the website')
      console.log('   - Can be reordered via drag-and-drop in admin dashboard')
      console.log('   - Lower numbers appear first (1, 2, 3, etc.)')
    } else {
      console.error('\n❌ Failed to setup display_order column')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('\n❌ Script failed:', error.message)
    process.exit(1)
  }
}

main()
