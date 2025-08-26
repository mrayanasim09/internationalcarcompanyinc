import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtManagerEdge } from '@/lib/jwt-utils-edge'
import { logger } from '@/lib/config/debug'

// Secure CSP Configuration - Balanced security and functionality
const cspConfig = {
  // Default source - restrict to same origin and trusted sources
  defaultSrc: ["'self'"],
  
  // Script sources - allow same origin, inline scripts, and trusted CDNs
  scriptSrc: [
    "'self'",
    "'unsafe-inline'",
    "'nonce-{NONCE}'",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://www.gstatic.com",
    "https://unpkg.com"
  ],
  
  // Script source elements - same as script-src
  scriptSrcElem: [
    "'self'",
    "'unsafe-inline'",
    "'nonce-{NONCE}'",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://www.gstatic.com",
    "https://unpkg.com"
  ],
  
  // Script source attributes - restrict to same origin only
  scriptSrcAttr: ["'self'"],
  
  // Style sources - allow same origin, inline styles, and trusted CDNs
  styleSrc: [
    "'self'",
    "'unsafe-inline'",
    "https://fonts.googleapis.com",
    "https://unpkg.com"
  ],
  
  // Style source elements - same as style-src
  styleSrcElem: [
    "'self'",
    "'unsafe-inline'",
    "https://fonts.googleapis.com",
    "https://unpkg.com"
  ],
  
  // Style attributes - allow inline styles
  styleSrcAttr: ["'self'", "'unsafe-inline'"],

  // Font sources - allow same origin and trusted CDNs
  fontSrc: [
    "'self'",
    "https://fonts.gstatic.com",
    "https://unpkg.com"
  ],
  
  // Image sources - allow same origin, data URIs, and trusted sources
  imgSrc: [
    "'self'",
    "data:",
    "blob:",
    "https://*.supabase.co",
    "https://www.google-analytics.com",
    "https://region1.google-analytics.com",
    "https://maps.gstatic.com",
    "https://*.googleusercontent.com",
    "https://www.google.com"
  ],
  
  // Media sources - allow same origin and data URIs
  mediaSrc: ["'self'", "data:", "blob:"],
  
  // Connect sources - allow same origin and trusted APIs
  connectSrc: [
    "'self'",
    "https://*.supabase.co",
    "https://www.google-analytics.com",
    "https://region1.google-analytics.com",
    "https://www.google.com",
    "https://maps.googleapis.com",
    "https://www.googletagmanager.com"
  ],
  
  // Object sources - block all for security
  objectSrc: ["'none'"],
  
  // Base URI - restrict to same origin
  baseUri: ["'self'"],
  
  // Form actions - allow same origin
  formAction: ["'self'"],
  
  // Frame ancestors - block all for security
  frameAncestors: ["'none'"],
  
  // Worker sources - allow same origin and data URIs
  workerSrc: ["'self'", "data:", "blob:"],
  
  // Manifest sources - allow same origin
  manifestSrc: ["'self'"],
  
  // Prefetch sources - allow same origin
  prefetchSrc: ["'self'"],
  
  // Upgrade insecure requests
  upgradeInsecureRequests: true,
  
  // Block mixed content
  blockAllMixedContent: true
}

// Generate cryptographically secure nonce
function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode.apply(null, Array.from(array)))
}

// Generate CSP header with nonce
function generateCSPHeader(nonce: string): string {
  const directives = [
    `default-src ${cspConfig.defaultSrc.join(' ')}`,
    `script-src ${cspConfig.scriptSrc.map(src => src.replace('{NONCE}', nonce)).join(' ')}`,
    `script-src-elem ${cspConfig.scriptSrcElem.map(src => src.replace('{NONCE}', nonce)).join(' ')}`,
    `script-src-attr ${cspConfig.scriptSrcAttr.join(' ')}`,
    `style-src ${cspConfig.styleSrc.map(src => src.replace('{NONCE}', nonce)).join(' ')}`,
    `style-src-elem ${cspConfig.styleSrcElem.map(src => src.replace('{NONCE}', nonce)).join(' ')}`,
    `style-src-attr ${cspConfig.styleSrcAttr.join(' ')}`,
    `font-src ${cspConfig.fontSrc.join(' ')}`,
    `img-src ${cspConfig.imgSrc.join(' ')}`,
    `media-src ${cspConfig.mediaSrc.join(' ')}`,
    `connect-src ${cspConfig.connectSrc.join(' ')}`,
    `object-src ${cspConfig.objectSrc.join(' ')}`,
    `base-uri ${cspConfig.baseUri.join(' ')}`,
    `form-action ${cspConfig.formAction.join(' ')}`,
    `frame-ancestors ${cspConfig.frameAncestors.join(' ')}`,
    `worker-src ${cspConfig.workerSrc.join(' ')}`,
    `manifest-src ${cspConfig.manifestSrc.join(' ')}`,
    `prefetch-src ${cspConfig.prefetchSrc.join(' ')}`
  ]
  
  // Add CSP report-uri for monitoring violations
  if (process.env.NODE_ENV === 'development') {
    directives.push(`report-uri /api/csp-report`)
  }
  
  return directives.join('; ')
}

// Secure middleware implementation
export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Generate unique nonce for this request
  const nonce = generateNonce()
  
  // Set nonce header for components to access
  response.headers.set('x-nonce', nonce)
  
  // Generate and set secure CSP header
  const cspHeader = generateCSPHeader(nonce)
  
  // Debug logging (disabled in production)
  if (process.env.NODE_ENV !== 'production') {
    logger.debug('Middleware', 'CSP Header generated', {
      pathname: request.nextUrl.pathname,
      nonce: nonce,
      cspHeader: cspHeader,
      timestamp: new Date().toISOString()
    })
  }
  
  // Re-enable CSP with secure but permissive configuration
  response.headers.set('Content-Security-Policy', cspHeader)
  
  // Set secure security headers
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin')
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  // X-XSS-Protection is obsolete; do not set
  
  // Set secure HSTS header
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  
  // Debug: Log headers (disabled in production)
  if (process.env.NODE_ENV !== 'production') {
    // Debug logging for admin routes
    logger.debug('Middleware', 'Headers Set', {
      pathname: request.nextUrl.pathname,
      nonce: nonce,
      csp: response.headers.get('Content-Security-Policy'),
      referrer: request.headers.get('referer'),
      timestamp: new Date().toISOString()
    })
  }
  
  // Enhanced admin route protection with proper JWT validation
  if (request.nextUrl.pathname.startsWith('/admin')) {
    try {
      // Skip protection for login page and public admin routes
      if (request.nextUrl.pathname.includes('/login') || 
          request.nextUrl.pathname.includes('/public') ||
          request.nextUrl.pathname.includes('/api/')) {
        return response
      }
      
      // Get admin token from cookies
      const adminToken = request.cookies.get('icc_admin_token')?.value
      
      if (!adminToken) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
      
      // Validate JWT token
      const tokenValidation = jwtManagerEdge.verifyAccessToken(adminToken)
      
      if (!tokenValidation.isValid || !tokenValidation.payload) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
      
      // Check if token is blacklisted
      const jti = (tokenValidation.payload as any).jti
      if (jti && await jwtManagerEdge.isTokenBlacklisted(jti)) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
      
      // Check if token is expired
      const exp = (tokenValidation.payload as any).exp
      if (exp && Date.now() >= exp * 1000) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
      
      // Continue with the request
      return response
    } catch (error) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }
  
  return response
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

