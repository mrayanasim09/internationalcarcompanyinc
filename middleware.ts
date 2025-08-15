import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simplified middleware to fix connection issues
export function middleware(request: NextRequest) {
  // Only apply middleware to admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Basic admin route protection
    const jwtToken = request.cookies.get('icc_admin_token')?.value
    const verifiedFlag = request.cookies.get('icc_admin_verified')?.value
    
    console.log('DEBUG: Middleware processing:', {
      pathname: request.nextUrl.pathname,
      hasJWT: !!jwtToken,
      hasVerifiedFlag: verifiedFlag,
      cookies: request.cookies.getAll().map(c => c.name)
    })
    
    // If accessing admin routes without token, redirect to login
    if (!jwtToken && request.nextUrl.pathname !== '/admin/login') {
      console.log('DEBUG: No JWT token, redirecting to login')
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    // If accessing login with valid token and verified flag, redirect to dashboard
    if (jwtToken && verifiedFlag === '1' && request.nextUrl.pathname === '/admin/login') {
      console.log('DEBUG: Valid JWT and verified flag, redirecting to dashboard')
      try {
        // Simple token validation
        const parts = jwtToken.split('.')
        if (parts.length >= 2) {
          let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
          const pad = base64.length % 4
          if (pad) base64 += '='.repeat(4 - pad)
          const payloadJson = atob(base64)
          const payload = JSON.parse(payloadJson) as { exp?: number }
          if (payload.exp && Math.floor(Date.now() / 1000) <= payload.exp) {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url))
          }
        }
      } catch (e) {
        console.log('DEBUG: Token validation failed:', e)
        // Token invalid, continue with login
      }
    }
    
    // If accessing dashboard without verified flag, redirect to login
    if (jwtToken && !verifiedFlag && request.nextUrl.pathname === '/admin/dashboard') {
      console.log('DEBUG: JWT exists but no verified flag, redirecting to login')
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }
  
  // For all other routes, just continue
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
}

