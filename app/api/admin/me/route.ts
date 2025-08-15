import { NextRequest, NextResponse } from 'next/server'
import { jwtManager } from '@/lib/jwt-utils'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    console.log('DEBUG: /me endpoint called')
    console.log('DEBUG: JWT_SECRET configured:', !!process.env.JWT_SECRET)
    console.log('DEBUG: SESSION_SECRET configured:', !!process.env.SESSION_SECRET)
    console.log('DEBUG: JWT_SECRET length:', process.env.JWT_SECRET?.length || 0)
    console.log('DEBUG: SESSION_SECRET length:', process.env.SESSION_SECRET?.length || 0)
    
    // Check what cookies we're receiving
    const allCookies = request.cookies.getAll()
    console.log('DEBUG: All cookies received:', allCookies.map(c => ({ name: c.name, value: c.value ? 'present' : 'missing' })))
    
    // If access token present and valid, return user data
    const accessToken = request.cookies.get('am_tycoons_admin_token')?.value
    console.log('DEBUG: Access token present:', !!accessToken)
    console.log('DEBUG: Access token length:', accessToken?.length || 0)
    
    if (accessToken) {
      // Decode token first to see what's in it
      const decoded = jwtManager.decodeToken(accessToken)
      console.log('DEBUG: Decoded token payload:', decoded)
      
      const result = jwtManager.verifyAccessToken(accessToken)
      console.log('DEBUG: Token verification result:', { isValid: result.isValid, hasPayload: !!result.payload, error: result.error })
      
      if (result.isValid && result.payload) {
        const { email, role, permissions } = result.payload
        console.log('DEBUG: Returning authenticated user:', { email, role })
        return NextResponse.json({ authenticated: true, email, role, permissions })
      }
      // Add more debugging for failed verification
      if (!result.isValid) {
        console.log('DEBUG: Token verification failed with error:', result.error)
        console.log('DEBUG: Attempting to verify with different method...')
        
        // Try to decode the token manually to see what's in it
        try {
          const manualDecode = jwt.decode(accessToken)
          console.log('DEBUG: Manual JWT decode result:', manualDecode)
          
          // Try manual verification with the same secret
          try {
            const manualVerify = jwt.verify(accessToken, process.env.JWT_SECRET || '', {
              issuer: 'am-tycoons-inc',
              audience: 'car-dealership-users'
            })
            console.log('DEBUG: Manual JWT verification successful:', manualVerify)
          } catch (verifyError) {
            console.log('DEBUG: Manual JWT verification failed:', verifyError)
          }
        } catch (e) {
          console.log('DEBUG: Manual JWT decode failed:', e)
        }
      }
    }

    // Fallback: try to refresh using refresh token
    const refreshToken = request.cookies.get('am_tycoons_admin_refresh')?.value
    console.log('DEBUG: Refresh token present:', !!refreshToken)
    
    if (refreshToken) {
      const refreshResult = jwtManager.verifyRefreshToken(refreshToken)
      console.log('DEBUG: Refresh token verification result:', { isValid: refreshResult.isValid, hasPayload: !!refreshResult.payload })
      
      if (refreshResult.isValid && refreshResult.payload) {
        const { email, role, permissions } = refreshResult.payload
        const refreshed = jwtManager.refreshAccessToken(refreshToken)
        console.log('DEBUG: Token refresh result:', { success: !!refreshed })
        
        if (refreshed) {
          const response = NextResponse.json({ authenticated: true, email, role, permissions })
          const isHttps = (request.headers.get('x-forwarded-proto') || new URL(request.url).protocol).toString().includes('https')
          const hostname = new URL(request.url).hostname
          
          // Fix domain calculation for multi-part domains
          let cookieDomain: string | undefined = ''
          if (hostname === 'localhost' || hostname === '127.0.0.1') {
            cookieDomain = undefined // Don't set domain for localhost
          } else if (hostname.includes('.')) {
            // For production domains, use the full domain
            cookieDomain = hostname
          }
          
          response.cookies.set('am_tycoons_admin_token', refreshed.accessToken, {
            httpOnly: true,
            secure: isHttps,
            sameSite: 'lax',
            domain: cookieDomain,
            maxAge: 60 * 60,
            path: '/',
          })
          if (refreshed.newRefreshToken) {
            response.cookies.set('am_tycoons_admin_refresh', refreshed.newRefreshToken, {
              httpOnly: true,
              secure: isHttps,
              sameSite: 'lax',
              domain: cookieDomain,
              maxAge: 7 * 24 * 60 * 60,
              path: '/',
            })
          }
          return response
        }
      }
    }

    // Not authenticated
    console.log('DEBUG: No valid tokens found, returning unauthenticated')
    return NextResponse.json({ authenticated: false }, { status: 200 })
  } catch (error) {
    console.error('DEBUG: /me endpoint error:', error)
    return NextResponse.json({ authenticated: false }, { status: 200 })
  }
}


