import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Generate a secure nonce for CSP using Web Crypto API (Edge Runtime compatible)
function generateNonce(): string {
  // Use Web Crypto API instead of Node.js crypto
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode.apply(null, Array.from(array)))
}

// CSP Configuration - Updated to use nonces instead of unsafe directives
const cspConfig = {
  // Default source restrictions
  defaultSrc: ["'self'"],
  
  // Script sources - use nonces for inline scripts instead of unsafe-inline
  scriptSrc: [
    "'self'",
    "'nonce-${nonce}'", // Will be replaced with actual nonce
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://www.gstatic.com",
    "https://unpkg.com" // Allow web-vitals script
  ],
  
  // Script source elements - specifically for script tags
  scriptSrcElem: [
    "'self'",
    "'nonce-${nonce}'", // Will be replaced with actual nonce
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://www.gstatic.com",
    "https://unpkg.com"
  ],
  
  // Style sources - use nonces for inline styles instead of unsafe-inline
  styleSrc: [
    "'self'",
    "'nonce-${nonce}'", // Will be replaced with actual nonce
    "https://fonts.googleapis.com"
  ],
  
  // Font sources - allow Google Fonts
  fontSrc: [
    "'self'",
    "https://fonts.gstatic.com",
    "data:"
  ],
  
  // Image sources - allow various image sources
  imgSrc: [
    "'self'",
    "data:",
    "https:",
    "blob:",
    "https://*.supabase.co"
  ],
  
  // Media sources
  mediaSrc: ["'self'"],
  
  // Connect sources - allow external connections for analytics
  connectSrc: [
    "'self'",
    "https://www.google-analytics.com",
    "https://region1.google-analytics.com",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://www.google.com",
    "https://maps.googleapis.com",
    "https://www.googletagmanager.com"
  ],
  
  // Object sources - block potentially dangerous objects
  objectSrc: ["'none'"],
  
  // Base URI - restrict base tag usage
  baseUri: ["'self'"],
  
  // Form actions - restrict form submissions
  formAction: ["'self'"],
  
  // Frame ancestors - prevent clickjacking
  frameAncestors: ["'none'"],
  
  // Upgrade insecure requests
  upgradeInsecureRequests: true,
  
  // Block mixed content
  blockAllMixedContent: true
}

function generateCSPHeader(nonce: string): string {
  // Replace nonce placeholder with actual nonce
  const replaceNonce = (directive: string) => {
    return directive.replace(/\$\{nonce\}/g, nonce)
  }
  
  const directives = [
    `default-src ${cspConfig.defaultSrc.join(' ')}`,
    `script-src ${replaceNonce(cspConfig.scriptSrc.join(' '))}`,
    `script-src-elem ${replaceNonce(cspConfig.scriptSrcElem.join(' '))}`,
    `style-src ${replaceNonce(cspConfig.styleSrc.join(' '))}`,
    `font-src ${cspConfig.fontSrc.join(' ')}`,
    `img-src ${cspConfig.imgSrc.join(' ')}`,
    `media-src ${cspConfig.mediaSrc.join(' ')}`,
    `connect-src ${cspConfig.connectSrc.join(' ')}`,
    `object-src ${cspConfig.objectSrc.join(' ')}`,
    `base-uri ${cspConfig.baseUri.join(' ')}`,
    `form-action ${cspConfig.formAction.join(' ')}`,
    `frame-ancestors ${cspConfig.frameAncestors.join(' ')}`,
    'upgrade-insecure-requests',
    'block-all-mixed-content'
  ]
  
  // Add CSP report-uri for monitoring violations
  if (process.env.NODE_ENV === 'development') {
    directives.push(`report-uri /api/csp-report`)
  }
  
  return directives.join('; ')
}

// Simplified middleware to fix connection issues
export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Generate nonce for CSP
  const nonce = generateNonce()
  
  // Add nonce to response headers for use in CSP
  response.headers.set('x-nonce', nonce)
  
  // Generate and set CSP header with nonce
  const cspHeader = generateCSPHeader(nonce)
  response.headers.set('Content-Security-Policy', cspHeader)
  
  // Set other security headers
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin')
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Set HSTS header with preload and includeSubDomains
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  
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
  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

