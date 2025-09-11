import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key'

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    console.log('DEBUG: Car API called with ID:', id)
    console.log('DEBUG: Environment check - NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set (' + process.env.NEXT_PUBLIC_SUPABASE_URL + ')' : 'Missing')
    console.log('DEBUG: Environment check - SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set (length: ' + (process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0) + ')' : 'Missing')
    console.log('DEBUG: Environment check - JWT_SECRET:', process.env.JWT_SECRET ? 'Set (length: ' + (process.env.JWT_SECRET?.length || 0) + ')' : 'Missing')
    console.log('DEBUG: Environment check - SESSION_SECRET:', process.env.SESSION_SECRET ? 'Set (length: ' + (process.env.SESSION_SECRET?.length || 0) + ')' : 'Missing')
    console.log('DEBUG: Environment check - ENCRYPTION_KEY:', process.env.ENCRYPTION_KEY ? 'Set (length: ' + (process.env.ENCRYPTION_KEY?.length || 0) + ')' : 'Missing')

    if (!id) {
      console.log('DEBUG: No car ID provided')
      return NextResponse.json({ error: 'Car ID is required' }, { status: 400 })
    }

    // Check if Supabase environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('DEBUG: Missing Supabase environment variables')
      console.error('DEBUG: NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing')
      console.error('DEBUG: SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing')
      return NextResponse.json({ 
        error: 'Database configuration error - Missing Supabase credentials',
        details: 'Please check environment variables in Netlify'
      }, { status: 500 })
    }

    console.log('DEBUG: Fetching car from Supabase...')
    
    // Fetch car data from Supabase
    console.log('DEBUG: Executing Supabase query for car ID:', id)
    const { data: car, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', id)
      .single()

    console.log('DEBUG: Supabase response:', { hasData: !!car, hasError: !!error, errorCode: error?.code })

    if (error) {
      console.error('DEBUG: Error fetching car:', error)
      if (error.code === 'PGRST116') {
        console.log('DEBUG: Car not found in database')
        return NextResponse.json({ error: 'Car not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch car' }, { status: 500 })
    }

    if (!car) {
      console.log('DEBUG: No car data returned from database')
      return NextResponse.json({ error: 'Car not found' }, { status: 404 })
    }

    console.log('DEBUG: Car found:', { id: car.id, title: car.title, approved: car.approved })

    // Only return approved cars for public access
    if (!car.approved) {
      console.log('DEBUG: Car not approved for public access')
      return NextResponse.json({ error: 'Car not found' }, { status: 404 })
    }

    console.log('DEBUG: Returning car data successfully')
    return NextResponse.json(car)
  } catch (error) {
    console.error('DEBUG: Unexpected error in car API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
