import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createCSPHeader } from './lib/security/csp'
import { applySecurityHeaders } from './lib/security/headers'

// Helper function to safely get and validate JWT token
function getValidJWTToken(request: NextRequest): string | null {
  const jwtToken = request.cookies.get('icc_admin_token')?.value
  if (jwtToken && typeof jwtToken === 'string' && jwtToken.length > 0) {
    const trimmedToken = jwtToken.trim()
    if (trimmedToken.length > 0) {
      return trimmedToken
    }
  }
  return null
}
 
// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  try {
    // Generate a per-request nonce using Web Crypto (Edge runtime safe)
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
    const nonce = btoa(binary)
    
    // Get the pathname of the request
    const path = request.nextUrl.pathname

    // Special-case: admin login page should load without CSP/nonce stream interference
    // but still needs a CSRF token cookie before form POSTs.
    if (path === '/admin/login') {
      const response = NextResponse.next()
      const hasCsrfLogin = request.cookies.get('csrf_token')?.value
      if (!hasCsrfLogin) {
        const csrfBytes = new Uint8Array(16)
        crypto.getRandomValues(csrfBytes)
        let raw = ''
        for (let i = 0; i < csrfBytes.length; i++) {
          raw += String.fromCharCode(csrfBytes[i])
        }
        const csrfToken = btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
        response.cookies.set('csrf_token', csrfToken, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 60 * 60,
        })
      }
      return response
    }

    // Auto-redirect authenticated users away from login
    if (path === '/admin/login') {
      const trimmedToken = getValidJWTToken(request)
      if (trimmedToken) {
        try {
          const parts = trimmedToken.split('.')
          if (parts.length >= 2) {
            let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
            const pad = base64.length % 4
            if (pad) base64 += '='.repeat(4 - pad)
            const payloadJson = atob(base64)
            const payload = JSON.parse(payloadJson) as { exp?: number; twoFactorVerified?: boolean }
            if (payload.exp && Math.floor(Date.now() / 1000) <= payload.exp && payload.twoFactorVerified) {
              return NextResponse.redirect(new URL('/admin/dashboard', request.url))
            }
          }
        } catch (e) {
          // Token invalid, continue with login
        }
      }
    }

    // Check if the path starts with /admin
    if (path.startsWith('/admin') && path !== '/admin/login') {
      // Prefer new JWT cookie
      const trimmedToken = getValidJWTToken(request)
      if (!trimmedToken) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
      // Lightweight decode to check expiry and 2FA in Edge runtime (no signature verification here)
      try {
        const parts = trimmedToken.split('.')
        if (parts.length < 2) throw new Error('bad token')
        let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
        const pad = base64.length % 4
        if (pad) base64 += '='.repeat(4 - pad)
        const payloadJson = atob(base64)
        const payload = JSON.parse(payloadJson) as { exp?: number; twoFactorVerified?: boolean }
        if (!payload.exp || Math.floor(Date.now() / 1000) > payload.exp) {
          return NextResponse.redirect(new URL('/admin/login', request.url))
        }
        // If verification flag cookie is present, allow one-time pass even if token payload lacks the 2FA bit yet
        const hasVerifiedFlag = request.cookies.get('icc_admin_verified')?.value === '1'
        if (!payload.twoFactorVerified && !hasVerifiedFlag) {
          return NextResponse.redirect(new URL('/admin/login', request.url))
        }
      } catch (e) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    }

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-nonce', nonce)
    const response = NextResponse.next({ request: { headers: requestHeaders } })
    
    // Ensure CSRF token cookie exists for admin pages and admin API routes (double submit pattern)
    const adminPath = request.nextUrl.pathname
    const isAdminArea = adminPath.startsWith('/admin') || adminPath.startsWith('/api/admin')
    const hasCsrf = request.cookies.get('csrf_token')?.value
    if (!hasCsrf && isAdminArea) {
      const csrfBytes = new Uint8Array(16)
      crypto.getRandomValues(csrfBytes)
      // URL-safe base64 without padding, avoid spread on Uint8Array for downlevel targets
      let raw = ''
      for (let i = 0; i < csrfBytes.length; i++) {
        raw += String.fromCharCode(csrfBytes[i])
      }
      const csrfToken = btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
      response.cookies.set('csrf_token', csrfToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60,
      })
    }

    // Set nonce header for all routes
    response.headers.set('x-nonce', nonce)

    // Apply comprehensive CSP using the configuration file
    const cspHeader = createCSPHeader(nonce)
    response.headers.set('Content-Security-Policy', cspHeader)

    // Apply all security headers
    applySecurityHeaders(response)

    return response
  } catch (e) {
    // Fallback: do not block the request if middleware fails
    console.error('Middleware error:', e)
    return NextResponse.next()
  }
}
 
// See "Matching Paths" below to learn more
export const config = {
  // Apply to all routes for comprehensive security
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/ (all Next.js internal assets)
     * - static/ (any static asset path that may be emitted by the runtime)
     * - favicon.ico (favicon file)
     * - public folder files and common static asset extensions
     */
    '/((?!api|_next/|static/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)',
  ],
}

