import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Log the debug data for monitoring
    console.log('Debug data received:', data)
    
    // Return success response
    return NextResponse.json({ success: true, message: 'Debug data received' })
  } catch (error) {
    console.error('Error processing debug data:', error)
    return NextResponse.json(
      { success: false, error: 'Invalid request data' },
      { status: 400 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Debug endpoint is working',
    timestamp: new Date().toISOString()
  })
}
