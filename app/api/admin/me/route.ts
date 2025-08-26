import { NextRequest, NextResponse } from 'next/server'
import { jwtManager } from '@/lib/jwt-utils'
import jwt from 'jsonwebtoken'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

type JWTPayload = {
  userId?: string
  email?: string
  role?: string
  permissions?: any
  exp?: number
  iat?: number
  jti?: string
  sessionId?: string
  twoFactorVerified?: boolean
}

export async function GET(request: NextRequest) {
  console.log('DEBUG: /api/admin/me called')
  console.log('DEBUG: Environment check - JWT_SECRET:', process.env.JWT_SECRET ? 'Set (length: ' + (process.env.JWT_SECRET?.length || 0) + ')' : 'Missing')
  console.log('DEBUG: Environment check - SESSION_SECRET:', process.env.SESSION_SECRET ? 'Set (length: ' + (process.env.SESSION_SECRET?.length || 0) + ')' : 'Missing')
  try {
    // If access token present and valid, return user data
    const accessToken = request.cookies.get('icc_admin_token')?.value
    console.log('DEBUG: Access token present:', !!accessToken)
    console.log('DEBUG: Access token length:', accessToken?.length || 0)
    
    if (accessToken) {
      let payload: any
      try {
        payload = jwtManager.verifyAccessToken(accessToken)
        if (!payload.isValid) {
          throw new Error('Token verification failed')
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.log('DEBUG: JWT verification failed, trying manual verification:', error)
        }
        
        // Try manual verification with the same secret
        try {
          const secret = process.env.JWT_SECRET || ''
          
          const manualPayload = jwt.verify(accessToken, secret, {
            issuer: 'international-car-company-inc',
            audience: 'car-dealership-users',
          }) as JWTPayload
          
          // Return the manually verified payload
          const response = NextResponse.json({ 
            authenticated: true, 
            email: manualPayload.email, 
            role: manualPayload.role, 
            permissions: manualPayload.permissions 
          })
          return response
        } catch (verifyError) {
          
          // Try refresh token
          const refreshToken = request.cookies.get('icc_admin_refresh')?.value
          if (refreshToken) {
            try {
              const refreshed = jwtManager.refreshAccessToken(refreshToken)
              if (refreshed && refreshed.accessToken) {
                // Decode the new access token to get user info
                const decodedToken = jwtManager.decodeToken(refreshed.accessToken)
                if (decodedToken) {
                  // Set new cookies
                  const response = NextResponse.json({
                    user: {
                      id: decodedToken.userId,
                      email: decodedToken.email,
                      role: decodedToken.role,
                      permissions: decodedToken.permissions
                    },
                    permissions: decodedToken.permissions
                  })
                  // Use environment variable for domain or calculate based on hostname
                  let cookieDomain = process.env.COOKIE_DOMAIN
                  if (!cookieDomain) {
                    const hostname = request.headers.get('host') || 'localhost'
                    if (hostname === 'internationalcarcompanyinc.com') {
                      cookieDomain = '.internationalcarcompanyinc.com'
                    }
                  }
                  
                  response.cookies.set('icc_admin_token', refreshed.accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 15 * 60, // 15 minutes
                    domain: cookieDomain,
                    path: '/',
                  })
                  
                  if (refreshed.newRefreshToken) {
                    response.cookies.set('icc_admin_refresh', refreshed.newRefreshToken, {
                      httpOnly: true,
                      secure: process.env.NODE_ENV === 'production',
                      sameSite: 'strict',
                      maxAge: 7 * 24 * 60 * 60, // 7 days
                      domain: cookieDomain,
                      path: '/',
                    })
                  }
                  
                  return response
                }
              }
            } catch (refreshError) {
              console.log('DEBUG: Refresh token failed:', refreshError)
            }
          }
          
          return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }
      }

      if (payload.isValid && payload.payload) {
        const { email, role, permissions } = payload.payload
        console.log('DEBUG: Returning authenticated user:', { email, role })
        const response = NextResponse.json({ authenticated: true, email, role, permissions })
        return response
      }
    }

    // Fallback: try to refresh using refresh token
    const refreshToken = request.cookies.get('icc_admin_refresh')?.value
    
    if (refreshToken) {
      const refreshResult = jwtManager.verifyRefreshToken(refreshToken)
      
      if (refreshResult.isValid && refreshResult.payload) {
        const { email, role, permissions } = refreshResult.payload
        const refreshed = jwtManager.refreshAccessToken(refreshToken)
        
        if (refreshed) {
          const response = NextResponse.json({ authenticated: true, email, role, permissions })
          // Use environment variable for domain or calculate based on hostname
          let cookieDomain = process.env.COOKIE_DOMAIN
          if (!cookieDomain) {
            const hostname = request.headers.get('host') || 'localhost'
            if (hostname === 'internationalcarcompanyinc.com') {
              cookieDomain = '.internationalcarcompanyinc.com'
            }
          }
          
          const isHttps = (request.headers.get('x-forwarded-proto') || new URL(request.url).protocol).toString().includes('https')
          response.cookies.set('icc_admin_token', refreshed.accessToken, {
            httpOnly: true,
            secure: isHttps,
            sameSite: 'lax',
            domain: cookieDomain,
            maxAge: 60 * 60,
            path: '/',
          })
          if (refreshed.newRefreshToken) {
            response.cookies.set('icc_admin_refresh', refreshed.newRefreshToken, {
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
    const response = NextResponse.json({ authenticated: false }, { status: 200 })
    return response
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 200 })
  }
}


