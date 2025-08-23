import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    console.log('DEBUG: Testing database connection...')
    
    // Test basic connection
    const { data: testData, error: testError } = await supabaseAdmin
      .from('cars')
      .select('id, title')
      .limit(1)
    
    if (testError) {
      console.error('DEBUG: Database connection test failed:', testError)
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        error: testError.message,
        code: testError.code,
        details: testError.details
      }, { status: 500 })
    }
    
    console.log('DEBUG: Database connection successful, test data:', testData)
    
    // Test permissions
    const { data: countData, error: countError } = await supabaseAdmin
      .from('cars')
      .select('id', { count: 'exact' })
    
    if (countError) {
      console.error('DEBUG: Count query failed:', countError)
      return NextResponse.json({
        status: 'partial',
        message: 'Connection works but count query failed',
        connection: 'success',
        count: 'failed',
        error: countError.message
      }, { status: 200 })
    }
    
    console.log('DEBUG: Count query successful, total cars:', countData?.length || 0)
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection and permissions working',
      connection: 'success',
      count: 'success',
      totalCars: countData?.length || 0,
      testData: testData
    })
    
  } catch (error) {
    console.error('DEBUG: Unexpected error in test-db:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Unexpected error occurred',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
