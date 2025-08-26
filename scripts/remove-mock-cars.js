#!/usr/bin/env node

/**
 * Remove Mock Cars from Database
 * This script removes the hardcoded sample cars that shouldn't be in the database
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing required environment variables!')
  console.error('Please create a .env.local file with:')
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

// Mock cars to remove
const mockCars = [
  {
    title: '2021 Honda Civic EX',
    make: 'Honda',
    model: 'Civic',
    year: 2021,
    price: 22500
  },
  {
    title: '2020 Ford F-150 XLT',
    make: 'Ford',
    model: 'F-150',
    year: 2020,
    price: 38500
  },
  {
    title: '2019 Toyota Camry SE',
    make: 'Toyota',
    model: 'Camry',
    year: 2019,
    price: 19800
  }
]

async function removeMockCars() {
  console.log('🔍 Searching for mock cars in database...')
  
  try {
    // First, let's see what cars are in the database
    const { data: allCars, error: fetchError } = await supabase
      .from('cars')
      .select('*')
    
    if (fetchError) {
      console.error('❌ Error fetching cars:', fetchError)
      return
    }
    
    console.log(`📊 Found ${allCars.length} total cars in database`)
    
    // Find mock cars to remove
    const carsToRemove = []
    
    for (const mockCar of mockCars) {
      const matches = allCars.filter(car => 
        car.title === mockCar.title ||
        (car.make === mockCar.make && 
         car.model === mockCar.model && 
         car.year === mockCar.year &&
         Math.abs(car.price - mockCar.price) < 100) // Allow small price differences
      )
      
      if (matches.length > 0) {
        carsToRemove.push(...matches)
        console.log(`🎯 Found mock car: ${mockCar.title}`)
      }
    }
    
    if (carsToRemove.length === 0) {
      console.log('✅ No mock cars found in database')
      return
    }
    
    console.log(`\n🗑️  Found ${carsToRemove.length} mock cars to remove:`)
    carsToRemove.forEach(car => {
      console.log(`   - ${car.title} (ID: ${car.id})`)
    })
    
    // Ask for confirmation
    console.log('\n⚠️  WARNING: This will permanently delete these cars from your database!')
    console.log('Type "DELETE" to confirm:')
    
    // For now, we'll just show what would be deleted
    // In a real scenario, you'd want to add confirmation logic here
    
    console.log('\n🔍 To manually remove these cars:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Navigate to Table Editor > cars')
    console.log('3. Find and delete the cars listed above')
    console.log('4. Or run this script with confirmation logic enabled')
    
    // Show the SQL commands that would be used
    console.log('\n📝 SQL commands to remove these cars:')
    carsToRemove.forEach(car => {
      console.log(`DELETE FROM cars WHERE id = '${car.id}';`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

async function main() {
  console.log('🚗 Mock Car Removal Script')
  console.log('========================\n')
  
  try {
    // Test connection
    const { data, error } = await supabase
      .from('cars')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Database connection failed:', error.message)
      return
    }
    
    console.log('✅ Connected to database successfully\n')
    
    await removeMockCars()
    
  } catch (error) {
    console.error('❌ Script failed:', error.message)
  }
}

// Run the script
main().catch(console.error)
