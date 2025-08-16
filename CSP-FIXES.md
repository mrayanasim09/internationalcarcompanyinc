# Content Security Policy (CSP) Security Fixes

## Problem
The website was receiving a **B+ security score (80/100)** due to Content Security Policy (CSP) implementation issues. The main problems were:

- **-20 points penalty** for using `unsafe-inline` and `unsafe-eval` directives
- CSP was implemented unsafely with overly broad sources
- Missing proper nonce-based security

## Solution Implemented

### 1. Nonce-Based CSP Implementation

**Before:**
```javascript
// Unsafe CSP with unsafe-inline
scriptSrc: [
  "'self'",
  "'unsafe-inline'", // ❌ Security risk
  "'unsafe-eval'",   // ❌ Security risk
  // ... other sources
]
```

**After:**
```javascript
// Secure nonce-based CSP
scriptSrc: [
  "'self'",
  "'nonce-${nonce}'", // ✅ Secure nonce-based inline scripts
  // ... other sources
]
```

### 2. Dynamic Nonce Generation

Implemented secure nonce generation using Web Crypto API (Edge Runtime compatible):

```typescript
function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode.apply(null, Array.from(array)))
}
```

### 3. Middleware-Based CSP Headers

Moved CSP generation to middleware for dynamic nonce injection:

```typescript
// Generate nonce for each request
const nonce = generateNonce()
response.headers.set('x-nonce', nonce)

// Generate CSP header with nonce
const cspHeader = generateCSPHeader(nonce)
response.headers.set('Content-Security-Policy', cspHeader)
```

### 4. Complete Security Headers

Implemented comprehensive security headers:

```typescript
// All security headers set in middleware
response.headers.set('Content-Security-Policy', cspHeader)
response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
response.headers.set('X-Frame-Options', 'DENY')
response.headers.set('Cross-Origin-Resource-Policy', 'same-origin')
response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
response.headers.set('X-DNS-Prefetch-Control', 'on')
response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
response.headers.set('X-Content-Type-Options', 'nosniff')
response.headers.set('X-XSS-Protection', '1; mode=block')
response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
```

### 5. Nonce Context Integration

Created nonce context for React components:

```typescript
// components/nonce-context.tsx
export function NonceProvider({ nonce, children }: { nonce?: string; children: React.ReactNode }) {
  return <NonceContext.Provider value={nonce}>{children}</NonceContext.Provider>
}

export function useNonce(): string | undefined {
  return useContext(NonceContext)
}
```

### 6. Layout Integration

Updated layout to use nonce provider and pass nonces to scripts:

```typescript
// app/layout.tsx
const nonce = headers().get('x-nonce') || undefined

return (
  <html lang="en" suppressHydrationWarning>
    <head>
      {nonce ? <meta name="csp-nonce" content={nonce} /> : null}
      <Script
        id="gtag-src"
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-SV90G9ZG56"
        strategy="afterInteractive"
        nonce={nonce} // ✅ Nonce applied to script
      />
    </head>
    <body>
      <NonceProvider nonce={nonce}>
        {/* App content */}
      </NonceProvider>
    </body>
  </html>
)
```

## Security Improvements

### 1. Eliminated Unsafe Directives
- ❌ Removed `unsafe-inline` from script-src
- ❌ Removed `unsafe-eval` from script-src
- ✅ Implemented nonce-based inline script execution

### 2. Enhanced HSTS Configuration
- ✅ Set max-age to 1 year (31536000 seconds)
- ✅ Enabled includeSubDomains
- ✅ Enabled preload for browser inclusion

### 3. Comprehensive Security Headers
- ✅ Content Security Policy with nonces
- ✅ Strict Transport Security with preload
- ✅ X-Frame-Options for clickjacking protection
- ✅ X-Content-Type-Options for MIME sniffing protection
- ✅ Cross-Origin policies for resource isolation
- ✅ Permissions Policy for feature restrictions

### 4. Edge Runtime Compatibility
- ✅ Replaced Node.js crypto with Web Crypto API
- ✅ Middleware runs in Edge Runtime
- ✅ No Node.js dependencies in middleware

## Expected Security Score Improvement

**Before:**
- CSP: -20 points (Failed - unsafe-inline/unsafe-eval)
- Overall Score: 80/100 (B+)

**After:**
- CSP: 0+ points (Passed - nonce-based implementation)
- HSTS: 0+ points (Passed - preload enabled)
- All Security Headers: Passed
- Expected Overall Score: 100/100 (A+)

## Testing

### 1. CSP Test Page
Created `/test-csp` page to verify:
- Nonce generation and availability
- Security headers presence
- CSP directive correctness

### 2. Build Verification
- ✅ TypeScript compilation passes
- ✅ Next.js build successful
- ✅ No Edge Runtime warnings
- ✅ All security headers properly set

### 3. Security Headers Validation
Use security testing tools to verify:
- https://securityheaders.com
- https://observatory.mozilla.org
- Browser developer tools

## Monitoring

### 1. CSP Violation Reporting
- Development: CSP violations logged to console
- Production: CSP violations sent to `/api/csp-report`
- Monitor for policy violations and adjust as needed

### 2. Security Headers Monitoring
- Regular security header validation
- Automated testing in CI/CD pipeline
- Periodic security audits

## Best Practices Implemented

1. **Nonce Generation**: Cryptographically secure random nonces
2. **Dynamic CSP**: Per-request CSP generation with unique nonces
3. **Comprehensive Coverage**: All CSP directives implemented
4. **Edge Runtime**: Cloud-native deployment compatibility
5. **Monitoring**: CSP violation reporting and logging
6. **Documentation**: Clear implementation documentation

## Files Modified

1. `middleware.ts` - CSP generation and security headers
2. `next.config.mjs` - Removed static CSP configuration
3. `app/layout.tsx` - Nonce provider integration
4. `components/nonce-context.tsx` - Nonce context for React
5. `hooks/use-csp-nonce.ts` - Nonce access hook
6. `app/test-csp/page.tsx` - CSP testing page

## Deployment Notes

1. **Environment Variables**: No additional environment variables required
2. **Build Process**: No changes to build process
3. **Runtime**: Edge Runtime compatible
4. **Monitoring**: CSP violation reporting enabled
5. **Rollback**: Can easily revert to previous configuration if needed

## Security Score Verification

After deployment, verify the security score improvement:

1. Run security scan on https://observatory.mozilla.org
2. Check https://securityheaders.com
3. Verify CSP headers in browser developer tools
4. Monitor CSP violation reports

Expected result: **A+ security score (100/100)** with all CSP tests passing.
