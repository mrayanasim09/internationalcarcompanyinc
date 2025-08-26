// Environment configuration with validation for production
export const env = {
  // Debug & Development
  debug: {
    enabled: process.env.NODE_ENV === 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
    categories: {
      auth: process.env.NODE_ENV === 'development',
      api: process.env.NODE_ENV === 'development',
      admin: process.env.NODE_ENV === 'development',
      performance: process.env.NODE_ENV === 'development',
    }
  },
  // Authentication & Security
  auth: {
    nextAuthSecret: process.env.NEXTAUTH_SECRET!,
    nextAuthUrl: process.env.NEXTAUTH_URL!,
    jwtSecret: process.env.JWT_SECRET!,
    sessionSecret: process.env.SESSION_SECRET!,
    encryptionKey: process.env.ENCRYPTION_KEY!,
  },
  // Admin Configuration
  admin: {
    emails: process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.ADMIN_EMAILS,
    superAdminEmail: process.env.SUPER_ADMIN_EMAIL!,
    defaultPassword: process.env.DEFAULT_ADMIN_PASSWORD!,
  },
  // Storage (Supabase)
  storage: {
    bucket: process.env.SUPABASE_STORAGE_BUCKET || 'car-images',
  },
  // Push Notifications (disabled)
  push: {
    vapidPublicKey: undefined,
    vapidPrivateKey: undefined,
    vapidSubject: undefined,
  },
  // Database & Storage
  database: {
    url: process.env.DATABASE_URL,
    apiKey: process.env.DATABASE_API_KEY,
  },
  // External Services
  services: {
    email: {
      provider: process.env.EMAIL_PROVIDER || 'resend',
      apiKey: process.env.EMAIL_API_KEY!,
      fromEmail: process.env.FROM_EMAIL!,
    },

  },
  // Security & Rate Limiting
  security: {
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
    corsOrigin: process.env.CORS_ORIGIN || 'https://your-site.netlify.app',
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [],
    adminIpWhitelist: process.env.ADMIN_IP_WHITELIST?.split(',') || [],
  },
  // Monitoring & Analytics
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN,
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID,
  },
} as const

// Environment validation function
export function validateEnvironment() {
  // Skip validation during build or if explicitly disabled
  if (process.env.SKIP_ENV_VALIDATION === 'true' || process.env.NODE_ENV !== 'production' || typeof window !== 'undefined') {
    return
  }

  const requiredEnvVars = [
    'JWT_SECRET',
    'SESSION_SECRET',
    'ENCRYPTION_KEY',
    'SUPER_ADMIN_EMAIL',
    'DEFAULT_ADMIN_PASSWORD',
    'EMAIL_API_KEY',
    'FROM_EMAIL',
  ]
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
  }
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long')
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (process.env.SUPER_ADMIN_EMAIL && !emailRegex.test(process.env.SUPER_ADMIN_EMAIL)) {
    throw new Error('SUPER_ADMIN_EMAIL must be a valid email address')
  }
  if (process.env.DEFAULT_ADMIN_PASSWORD && process.env.DEFAULT_ADMIN_PASSWORD.length < 8) {
    throw new Error('DEFAULT_ADMIN_PASSWORD must be at least 8 characters long')
  }
  console.log('✅ Environment validation passed')
}

export default env
