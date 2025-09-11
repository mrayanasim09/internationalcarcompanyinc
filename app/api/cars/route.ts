import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key'

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    console.log('DEBUG: Cars list API called')
    console.log('DEBUG: Environment check - NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing')
    console.log('DEBUG: Environment check - SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set (length: ' + (process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0) + ')' : 'Missing')

    // Check if Supabase environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('DEBUG: Missing Supabase environment variables')
      return NextResponse.json({ 
        error: 'Database configuration error - Missing Supabase credentials',
        details: 'Please check environment variables in Netlify'
      }, { status: 500 })
    }

    console.log('DEBUG: Fetching cars from Supabase...')
    
    // Fetch all cars from Supabase
    const { data: cars, error } = await supabase
      .from('cars')
      .select('id, title, make, model, year, approved, created_at')
      .order('created_at', { ascending: false })

    console.log('DEBUG: Supabase response:', { hasData: !!cars, hasError: !!error, errorCode: error?.code, carCount: cars?.length || 0 })

    if (error) {
      console.error('DEBUG: Error fetching cars:', error)
      return NextResponse.json({ error: 'Failed to fetch cars', details: error.message }, { status: 500 })
    }

    if (!cars) {
      console.log('DEBUG: No cars found in database')
      return NextResponse.json({ cars: [] })
    }

    console.log('DEBUG: Found cars:', cars.length)
    return NextResponse.json({ cars })
  } catch (error) {
    console.error('DEBUG: Unexpected error in cars list API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
