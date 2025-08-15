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
  };
}

export const securityConfig: SecurityConfig = {
  csp: {
    reportUri: process.env.CSP_REPORT_URI || '/api/csp-report',
    trustedDomains: {
      scripts: [
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
        'https://apis.google.com',
        'https://www.google.com',
        'https://www.gstatic.com',
        'https://region1.google-analytics.com',
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
        'wss://*.supabase.co',
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
      allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }
  },
  cookies: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    httpOnly: false, // Set to true for sensitive cookies
    maxAge: 60 * 60 // 1 hour
  }
};

export const getHSTSHeader = (): string => {
  const { hsts } = securityConfig.headers;
  const directives = [`max-age=${hsts.maxAge}`];
  
  if (hsts.includeSubDomains) {
    directives.push('includeSubDomains');
  }
  
  if (hsts.preload) {
    directives.push('preload');
  }
  
  return directives.join('; ');
};
