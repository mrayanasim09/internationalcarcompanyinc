import { securityConfig, getHSTSHeader } from './config';

export interface SecurityHeaders {
  [key: string]: string;
}

export const createSecurityHeaders = (): SecurityHeaders => {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
    'Strict-Transport-Security': getHSTSHeader(),
    // Keep COOP, but relax COEP/CORP to avoid breaking third-party resources and streaming
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    // Disable COEP; enabling it requires all cross-origin resources to send CORP/COEP headers
    // which commonly breaks fonts, analytics and Next.js RSC streaming
    // See: https://developer.mozilla.org/docs/Web/Security/COEP
    // Do not set Cross-Origin-Embedder-Policy
    'X-DNS-Prefetch-Control': 'on',
    'X-Permitted-Cross-Domain-Policies': 'none',
    // Additional production security headers
    'X-Download-Options': 'noopen',
    'X-Robots-Tag': 'index, follow',
    'X-Requested-With': 'XMLHttpRequest'
  };
};

export const applySecurityHeaders = (response: Response): void => {
  const headers = createSecurityHeaders();
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
};
