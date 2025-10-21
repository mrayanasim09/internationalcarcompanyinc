#!/usr/bin/env node

/**
 * Initialize Display Order for Cars
 * This script initializes display_order values for existing cars
 * Note: The display_order column must be added manually in Supabase dashboard first
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🚗 Initializing Display Order for Cars\n')

console.log('📋 Environment Variables:')
console.log('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
console.log('   SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✅ Set' : '❌ Missing')

if (!supabaseUrl || !serviceRoleKey) {
  console.error('\n❌ Missing required environment variables!')
  process.exit(1)
}

// Create Supabase client
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function initializeDisplayOrder() {
  console.log('\n🔧 Initializing display_order for existing cars...')
  
  try {
    // First, check if display_order column exists
    const { data: testData, error: testError } = await supabase
      .from('cars')
      .select('display_order')
      .limit(1)
    
    if (testError && testError.code === '42703') {
      console.error('❌ display_order column does not exist!')
      console.log('\n📋 Please add the display_order column manually in your Supabase dashboard:')
      console.log('   1. Go to your Supabase dashboard')
      console.log('   2. Navigate to Table Editor > cars')
      console.log('   3. Add a new column:')
      console.log('      - Name: display_order')
      console.log('      - Type: int4 (integer)')
      console.log('      - Default value: 0')
      console.log('   4. Save the changes')
      console.log('   5. Run this script again')
      return false
    }
    
    if (testError) {
      console.error('❌ Error checking display_order column:', testError.message)
      return false
    }
    
    console.log('✅ display_order column exists')
    
    // Get all cars ordered by listed_at DESC
    const { data: cars, error: fetchError } = await supabase
      .from('cars')
      .select('id, listed_at, display_order')
      .order('listed_at', { ascending: false })
    
    if (fetchError) {
      console.error('❌ Failed to fetch cars:', fetchError.message)
      return false
    }
    
    if (!cars || cars.length === 0) {
      console.log('ℹ️  No cars found to initialize')
      return true
    }
    
    console.log(`📊 Found ${cars.length} cars to initialize`)
    
    // Update each car with sequential display_order
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < cars.length; i++) {
      const { error: updateError } = await supabase
        .from('cars')
        .update({ display_order: i + 1 })
        .eq('id', cars[i].id)
      
      if (updateError) {
        console.error(`❌ Failed to update car ${cars[i].id}:`, updateError.message)
        errorCount++
      } else {
        successCount++
      }
    }
    
    console.log(`✅ Successfully updated ${successCount} cars`)
    if (errorCount > 0) {
      console.log(`⚠️  Failed to update ${errorCount} cars`)
    }
    
    return true
    
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
    
    // Initialize display order
    const success = await initializeDisplayOrder()
    
    if (success) {
      console.log('\n🎉 Display order initialization completed successfully!')
      console.log('\n📋 Next steps:')
      console.log('   1. Go to your admin dashboard')
      console.log('   2. You should now see drag handles (⋮⋮) in the car table')
      console.log('   3. Drag cars up and down to reorder them')
      console.log('   4. The new order will be reflected on your website')
    } else {
      console.error('\n❌ Failed to initialize display order')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('\n❌ Script failed:', error.message)
    process.exit(1)
  }
}

main()
