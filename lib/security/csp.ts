import { securityConfig } from './config';

export interface CSPDirectives {
  [key: string]: string[];
}

export const createCSPDirectives = (nonce: string): CSPDirectives => {
  const { csp } = securityConfig;
  
  return {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      `'nonce-${nonce}'`,
      ...csp.trustedDomains.scripts
    ],
    // Allow styles from self and trusted CDNs. Do NOT include a nonce here,
    // because if a nonce or hash is present, browsers will ignore 'unsafe-inline'.
    // Next.js and some UI libs emit inline <style> and style attributes without a nonce.
    'style-src': [
      "'self'",
      ...csp.trustedDomains.styles,
      "'unsafe-inline'"
    ],
    // Explicitly allow inline style attributes (CSP Level 3) for UI libraries
    'style-src-attr': [
      "'unsafe-inline'"
    ],
    // Do not set style-src-elem separately; keep behavior governed by style-src above
    'font-src': [
      "'self'",
      ...csp.trustedDomains.fonts,
      'data:'
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      ...csp.trustedDomains.images
    ],
    'connect-src': [
      "'self'",
      ...csp.trustedDomains.connections
    ],
    'frame-src': [
      "'self'",
      ...csp.trustedDomains.frames
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': [],
    'report-uri': [csp.reportUri],
    'require-trusted-types-for': ["'script'"],
    'block-all-mixed-content': []
  };
};

export const formatCSPHeader = (directives: CSPDirectives): string => {
  return Object.entries(directives)
    .map(([key, values]) => {
      if (values.length === 0) {
        return key;
      }
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
};

export const createCSPHeader = (nonce: string): string => {
  const directives = createCSPDirectives(nonce);
  return formatCSPHeader(directives);
};
