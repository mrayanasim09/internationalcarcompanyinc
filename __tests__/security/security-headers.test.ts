import { createCSPHeader } from '../../lib/security/csp';
import { createSecurityHeaders } from '../../lib/security/headers';
import { securityConfig, getHSTSHeader } from '../../lib/security/config';

describe('Security Configuration', () => {
  describe('CSP Configuration', () => {
    it('should create valid CSP header with nonce', () => {
      const nonce = 'test-nonce-123';
      const cspHeader = createCSPHeader(nonce);
      
      expect(cspHeader).toContain(`'nonce-${nonce}'`);
      expect(cspHeader).toContain("default-src 'self'");
      expect(cspHeader).toContain("script-src 'self'");
      expect(cspHeader).toContain("object-src 'none'");
      expect(cspHeader).toContain("frame-ancestors 'none'");
    });

    it('should include all required CSP directives', () => {
      const nonce = 'test-nonce-456';
      const cspHeader = createCSPHeader(nonce);
      
      const requiredDirectives = [
        'default-src',
        'script-src',
        'style-src',
        'font-src',
        'img-src',
        'connect-src',
        'frame-src',
        'object-src',
        'base-uri',
        'form-action',
        'frame-ancestors',
        'upgrade-insecure-requests',
        'report-uri',
        'require-trusted-types-for',
        'block-all-mixed-content'
      ];

      requiredDirectives.forEach(directive => {
        expect(cspHeader).toContain(directive);
      });
    });

    it('should include trusted domains for scripts', () => {
      const nonce = 'test-nonce-789';
      const cspHeader = createCSPHeader(nonce);
      
      securityConfig.csp.trustedDomains.scripts.forEach(domain => {
        expect(cspHeader).toContain(domain);
      });
    });
  });

  describe('Security Headers', () => {
    it('should create all required security headers', () => {
      const headers = createSecurityHeaders();
      
      const requiredHeaders = [
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection',
        'Referrer-Policy',
        'Permissions-Policy',
        'Strict-Transport-Security',
        'Cross-Origin-Opener-Policy',
        'Cross-Origin-Resource-Policy',
        'Cross-Origin-Embedder-Policy',
        'X-DNS-Prefetch-Control',
        'X-Permitted-Cross-Domain-Policies'
      ];

      requiredHeaders.forEach(header => {
        expect(headers).toHaveProperty(header);
        expect(headers[header]).toBeTruthy();
      });
    });

    it('should have correct HSTS configuration', () => {
      const hstsHeader = getHSTSHeader();
      
      expect(hstsHeader).toContain('max-age=31536000');
      expect(hstsHeader).toContain('includeSubDomains');
      expect(hstsHeader).toContain('preload');
    });

    it('should have secure X-Frame-Options', () => {
      const headers = createSecurityHeaders();
      expect(headers['X-Frame-Options']).toBe('DENY');
    });

    it('should have secure X-Content-Type-Options', () => {
      const headers = createSecurityHeaders();
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
    });
  });

  describe('Security Configuration', () => {
    it('should have valid CSP report URI', () => {
      expect(securityConfig.csp.reportUri).toBeTruthy();
      expect(securityConfig.csp.reportUri).toMatch(/^\/api\/csp-report$/);
    });

    it('should have trusted domains configured', () => {
      expect(securityConfig.csp.trustedDomains.scripts).toBeInstanceOf(Array);
      expect(securityConfig.csp.trustedDomains.styles).toBeInstanceOf(Array);
      expect(securityConfig.csp.trustedDomains.fonts).toBeInstanceOf(Array);
      expect(securityConfig.csp.trustedDomains.images).toBeInstanceOf(Array);
      expect(securityConfig.csp.trustedDomains.connections).toBeInstanceOf(Array);
      expect(securityConfig.csp.trustedDomains.frames).toBeInstanceOf(Array);
    });

    it('should have secure cookie settings', () => {
      expect(securityConfig.cookies.sameSite).toBe('strict');
      expect(securityConfig.cookies.maxAge).toBe(3600); // 1 hour
    });
  });
});
