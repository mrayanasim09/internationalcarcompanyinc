export interface SecurityConfig {
  csp: {
    reportUri: string;
    trustedDomains: {
      scripts: string[];
      styles: string[];
      fonts: string[];
      images: string[];
      connections: string[];
      frames: string[];
    };
  };
  headers: {
    hsts: {
      maxAge: number;
      includeSubDomains: boolean;
      preload: boolean;
    };
    cors: {
      allowOrigin: string;
      allowMethods: string[];
      allowHeaders: string[];
    };
  };
  cookies: {
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    httpOnly: boolean;
    maxAge: number;
    path: string;
    domain?: string;
  };
}

export const securityConfig: SecurityConfig = {
  csp: {
    reportUri: process.env.CSP_REPORT_URI || '/api/csp-report',
    trustedDomains: {
      scripts: [
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
        'https://www.gstatic.com',
        'https://unpkg.com'
      ],
      styles: [
        'https://fonts.googleapis.com'
      ],
      fonts: [
        'https://fonts.gstatic.com'
      ],
      images: [
        'https://*.supabase.co',
        'https://www.google-analytics.com',
        'https://region1.google-analytics.com',
        'https://maps.gstatic.com',
        'https://*.googleusercontent.com',
        'https://www.google.com'
      ],
      connections: [
        'https://www.google-analytics.com',
        'https://region1.google-analytics.com',
        'https://*.supabase.co',
        'https://www.google.com',
        'https://maps.googleapis.com',
        'https://www.googletagmanager.com'
      ],
      frames: [
        'https://www.google.com',
        'https://*.google.com',
        'https://*.google.com/maps',
        'https://*.google.com/maps/embed'
      ]
    }
  },
  headers: {
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    cors: {
      allowOrigin: process.env.ALLOWED_ORIGIN || 'https://internationalcarcompanyinc.com',
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token']
    }
  },
  cookies: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    httpOnly: true, // Set to true for sensitive cookies
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
    domain: process.env.COOKIE_DOMAIN || undefined
  }
};

// Enhanced cookie security functions
export const getSecureCookieOptions = (cookieName: string, isAdmin: boolean = false) => {
  const baseOptions = {
    secure: securityConfig.cookies.secure,
    sameSite: securityConfig.cookies.sameSite as 'strict' | 'lax' | 'none',
    httpOnly: isAdmin ? true : securityConfig.cookies.httpOnly, // Admin cookies always httpOnly
    maxAge: securityConfig.cookies.maxAge,
    path: securityConfig.cookies.path,
    domain: securityConfig.cookies.domain
  }

  // Additional security for admin cookies
  if (isAdmin) {
    return {
      ...baseOptions,
      httpOnly: true,
      secure: true,
      sameSite: 'strict' as const
    }
  }

  return baseOptions
}

export const getHSTSHeader = (): string => {
  const { hsts } = securityConfig.headers;
  let header = `max-age=${hsts.maxAge}`;
  
  if (hsts.includeSubDomains) {
    header += '; includeSubDomains';
  }
  
  if (hsts.preload) {
    header += '; preload';
  }
  
  return header;
};

export const getCSPHeader = (nonce: string): string => {
  const { trustedDomains } = securityConfig.csp;
  
  return [
    `default-src 'none'`,
    `script-src 'self' 'nonce-${nonce}' ${trustedDomains.scripts.join(' ')}`,
    `script-src-elem 'self' 'nonce-${nonce}' ${trustedDomains.scripts.join(' ')}`,
    `script-src-attr 'none'`,
    `style-src 'self' 'unsafe-inline' ${trustedDomains.styles.join(' ')}`,
    `style-src-elem 'self' 'unsafe-inline' ${trustedDomains.styles.join(' ')}`,
    `style-src-attr 'unsafe-inline'`,
    `font-src 'self' ${trustedDomains.fonts.join(' ')}`,
    `img-src 'self' ${trustedDomains.images.join(' ')}`,
    `media-src 'self'`,
    `connect-src 'self' ${trustedDomains.connections.join(' ')}`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    'upgrade-insecure-requests',
    'block-all-mixed-content'
  ].join('; ');
};
