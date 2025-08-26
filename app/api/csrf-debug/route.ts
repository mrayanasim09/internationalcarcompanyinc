import { NextRequest, NextResponse } from 'next/server'
import { csrf } from '@/lib/security/csrf'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // Generate a new CSRF token
    const token = csrf.issue()
    
    // Create response with CSRF token
    const response = NextResponse.json({ 
      success: true, 
      message: 'CSRF token generated successfully',
      token: token 
    })
    
    // Set CSRF token as a cookie
    response.cookies.set('csrf_token', token, {
      httpOnly: false, // Allow JavaScript access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/'
    })
    
    return response
  } catch (error) {
    console.error('CSRF token generation failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate CSRF token' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const headerRaw = request.headers.get('x-csrf-token') || ''
    const cookieRaw = request.cookies.get('csrf_token')?.value || ''
    const ok = csrf.verify(request)
    return NextResponse.json({
      ok,
      headerRaw,
      cookieRaw,
      same: Boolean(headerRaw) && Boolean(cookieRaw) && headerRaw === cookieRaw,
    })
  } catch {
    return NextResponse.json({ error: 'debug failed' }, { status: 500 })
  }
}
