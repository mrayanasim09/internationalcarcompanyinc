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
    'style-src': [
      "'self'",
      `'nonce-${nonce}'`,
      ...csp.trustedDomains.styles,
      "'unsafe-inline'" // Temporarily allow for compatibility
    ],
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
