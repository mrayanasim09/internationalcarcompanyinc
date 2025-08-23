// Security configuration for admin portal
export const config = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '30m',
  },
  
  // Password Hashing
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  },
  
  // Admin Credentials (in production, use database)
  admin: {
    email: process.env.ADMIN_EMAIL!,
    passwordHash: process.env.ADMIN_PASSWORD_HASH!,
  },
  
  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET!,
    cookieSecret: process.env.COOKIE_SECRET!,
    maxAge: 30 * 60 * 1000, // 30 minutes
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5'),
  },
  
  // Email Verification Configuration
  emailVerification: {
    enabled: true,
    codeExpiry: 10 * 60 * 1000, // 10 minutes
    maxAttempts: 3,
  },
  
  // Environment
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
}
