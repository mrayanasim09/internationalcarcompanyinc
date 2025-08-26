import { securityConfig } from '@/lib/security/config'

describe('Security Headers', () => {
  it('should have proper CSP configuration', () => {
    expect(securityConfig.csp.reportUri).toBeTruthy()
    expect(securityConfig.csp.reportUri).toMatch(/^\/api\/csp-report$/)
  })

  it('should have proper trusted domains configuration', () => {
    expect(securityConfig.csp.trustedDomains.scripts).toBeInstanceOf(Array)
    expect(securityConfig.csp.trustedDomains.styles).toBeInstanceOf(Array)
    expect(securityConfig.csp.trustedDomains.fonts).toBeInstanceOf(Array)
    expect(securityConfig.csp.trustedDomains.images).toBeInstanceOf(Array)
    expect(securityConfig.csp.trustedDomains.connections).toBeInstanceOf(Array)
    expect(securityConfig.csp.trustedDomains.frames).toBeInstanceOf(Array)
  })

  it('should have proper HSTS configuration', () => {
    expect(securityConfig.headers.hsts.maxAge).toBe(31536000)
    expect(securityConfig.headers.hsts.includeSubDomains).toBe(true)
    expect(securityConfig.headers.hsts.preload).toBe(true)
  })

  it('should have proper CORS configuration', () => {
    expect(securityConfig.headers.cors.allowOrigin).toBeTruthy()
    expect(securityConfig.headers.cors.allowMethods).toBeInstanceOf(Array)
    expect(securityConfig.headers.cors.allowHeaders).toBeInstanceOf(Array)
  })

  it('should have proper cookie configuration', () => {
    expect(securityConfig.cookies.sameSite).toBe('strict')
    expect(securityConfig.cookies.maxAge).toBe(60 * 60 * 24 * 7) // 7 days
    expect(securityConfig.cookies.secure).toBeDefined()
    expect(securityConfig.cookies.httpOnly).toBeDefined()
  })
})
