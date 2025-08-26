import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  try {
    console.log('DEBUG: Testing car update functionality...')
    
    // Test data structure
    const testUpdateData = {
      title: 'Test Car Update',
      make: 'Test',
      model: 'Model',
      year: 2024,
      mileage: 1000,
      price: 25000,
      location: 'Test Location',
      description: 'Test description',
      approved: true,
      isInventory: true,
      isFeatured: false,
      phone: '123-456-7890',
      whatsapp: '123-456-7890'
    }
    
    console.log('DEBUG: Test update data:', JSON.stringify(testUpdateData, null, 2))
    
    // Test database connection first
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: testData, error: testError } = await (supabaseAdmin as any)
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
    
    if (!testData || testData.length === 0) {
      return NextResponse.json({
        status: 'error',
        message: 'No cars found in database to test update'
      }, { status: 404 })
    }
    
    const testCarId = testData[0].id
    console.log('DEBUG: Testing update on car ID:', testCarId)
    
    // Test update with minimal data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updated, error: updateError } = await (supabaseAdmin as any)
      .from('cars')
      .update({
        title: 'Test Car Update - ' + new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', testCarId)
      .select('id, title, updated_at')
    
    if (updateError) {
      console.error('DEBUG: Update test failed:', updateError)
      return NextResponse.json({
        status: 'error',
        message: 'Car update test failed',
        error: updateError.message,
        code: updateError.code,
        details: updateError.details
      }, { status: 500 })
    }
    
    console.log('DEBUG: Update test successful:', updated)
    
    return NextResponse.json({
      status: 'success',
      message: 'Car update functionality working',
      testCarId,
      updatedData: updated
    })
    
  } catch (error) {
    console.error('DEBUG: Unexpected error in test-car-update:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Unexpected error occurred',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
