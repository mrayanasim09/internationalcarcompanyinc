import { NextRequest, NextResponse } from 'next/server'
import NodeCache from 'node-cache'
import { createStore } from './session-store'

// In-memory cache for rate limiting (in production, use Redis)
const cache = new NodeCache({ stdTTL: 3600 }) // 1 hour TTL
let storePromise: Promise<import('./session-store').KeyValueStore> | null = null
async function getStore() {
  if (!storePromise) storePromise = createStore()
  return storePromise
}

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxAttempts: number // Maximum attempts in the window
  blockDurationMs?: number // How long to block after exceeding limit
  skipOnSuccess?: boolean // Reset counter on successful attempts
}

interface RateLimitEntry {
  count: number
  firstAttempt: number
  blocked?: boolean
  blockedUntil?: number
}

export class RateLimiter {
  public config: RateLimitConfig
  private whitelistedIPs: Set<string>

  constructor(config: RateLimitConfig) {
    this.config = config
    // Add IP whitelisting for admin routes
    this.whitelistedIPs = new Set([
      '127.0.0.1',
      '::1',
      // Add your admin IPs here
      ...(process.env.ADMIN_IP_WHITELIST?.split(',') || [])
    ])
  }

  private getClientId(request: NextRequest): string {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Check if IP is whitelisted
    if (this.whitelistedIPs.has(ip)) {
      return `whitelisted-${ip}`
    }
    
    return `${ip}-${Buffer.from(userAgent).toString('base64').slice(0, 20)}`
  }

  // Check if request should be allowed
  async isAllowed(request: NextRequest, identifier?: string): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
    blocked?: boolean
  }> {
    const clientId = identifier || this.getClientId(request)
    
    // Allow whitelisted IPs
    if (clientId.startsWith('whitelisted-')) {
      return {
        allowed: true,
        remaining: this.config.maxAttempts,
        resetTime: Date.now() + this.config.windowMs
      }
    }
    
    const now = Date.now()
    
    const key = `rate_limit:${clientId}`
    const useRedis = process.env.USE_REDIS === '1' && !!process.env.REDIS_URL
    const store = useRedis ? await getStore() : null
    
    // If Redis is not available, use stricter in-memory limits
    const effectiveConfig = useRedis ? this.config : {
      ...this.config,
      maxAttempts: Math.floor(this.config.maxAttempts * 0.5), // Reduce limits when Redis unavailable
      windowMs: Math.floor(this.config.windowMs * 0.8)
    }
    
    let entry: RateLimitEntry = (useRedis ? await store!.get<RateLimitEntry>(key) : cache.get(key)) || {
      count: 0,
      firstAttempt: now
    }

    // Check if currently blocked
    if (entry.blocked && entry.blockedUntil && now < entry.blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockedUntil,
        blocked: true
      }
    }

    // Reset if window has passed
    if (now - entry.firstAttempt > effectiveConfig.windowMs) {
      entry = {
        count: 1,
        firstAttempt: now,
        blocked: false
      }
    } else {
      entry.count++
    }

    // Check if limit exceeded
    if (entry.count > effectiveConfig.maxAttempts) {
      entry.blocked = true
      entry.blockedUntil = now + (effectiveConfig.blockDurationMs || effectiveConfig.windowMs)
      
      if (useRedis) await store!.set(key, entry, Math.ceil((effectiveConfig.blockDurationMs || effectiveConfig.windowMs) / 1000))
      else cache.set(key, entry, Math.ceil((effectiveConfig.blockDurationMs || effectiveConfig.windowMs) / 1000))
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockedUntil,
        blocked: true
      }
    }

    // Update cache
    if (useRedis) await store!.set(key, entry, Math.ceil(effectiveConfig.windowMs / 1000))
    else cache.set(key, entry, Math.ceil(effectiveConfig.windowMs / 1000))

    return {
      allowed: true,
      remaining: effectiveConfig.maxAttempts - entry.count,
      resetTime: entry.firstAttempt + effectiveConfig.windowMs
    }
  }

  // Record successful attempt (reset counter if configured)
  async recordSuccess(request: NextRequest, identifier?: string): Promise<void> {
    if (!this.config.skipOnSuccess) return

    const clientId = identifier || this.getClientId(request)
    const key = `rate_limit:${clientId}`
    const useRedis = process.env.USE_REDIS === '1' && !!process.env.REDIS_URL
    if (useRedis) {
      const store = await getStore()
      await store.del(key)
    } else {
      cache.del(key)
    }
  }

  // Manual block for security events
  async blockClient(request: NextRequest, durationMs: number, identifier?: string): Promise<void> {
    const clientId = identifier || this.getClientId(request)
    const now = Date.now()
    
    const entry: RateLimitEntry = {
      count: this.config.maxAttempts + 1,
      firstAttempt: now,
      blocked: true,
      blockedUntil: now + durationMs
    }

    const useRedis = process.env.USE_REDIS === '1' && !!process.env.REDIS_URL
    const key = `rate_limit:${clientId}`
    if (useRedis) {
      const store = await getStore()
      await store.set(key, entry, Math.ceil(durationMs / 1000))
    } else {
      cache.set(key, entry, Math.ceil(durationMs / 1000))
    }
  }

  // Get current status without incrementing
  async getStatus(request: NextRequest, identifier?: string): Promise<{
    count: number
    remaining: number
    resetTime: number
    blocked: boolean
  }> {
    const clientId = identifier || this.getClientId(request)
    const key = `rate_limit:${clientId}`
    const useRedis = process.env.USE_REDIS === '1' && !!process.env.REDIS_URL
    const store = useRedis ? await getStore() : null
    const entry: RateLimitEntry = (useRedis ? await store!.get<RateLimitEntry>(key) : cache.get(key)) || {
      count: 0,
      firstAttempt: Date.now()
    }

    const now = Date.now()
    const isBlocked = entry.blocked && entry.blockedUntil && now < entry.blockedUntil

    return {
      count: entry.count,
      remaining: Math.max(0, this.config.maxAttempts - entry.count),
      resetTime: entry.firstAttempt + this.config.windowMs,
      blocked: isBlocked || false
    }
  }

  // Reset rate limit for a specific client
  async resetLimit(clientId: string): Promise<void> {
    const key = `rate_limit:${clientId}`
    const useRedis = process.env.USE_REDIS === '1' && !!process.env.REDIS_URL
    const store = useRedis ? await getStore() : null
    
    if (useRedis && store) {
      await store.del(key)
    } else {
      cache.del(key)
    }
  }


}

// Helper function to create rate limit middleware
export function createRateLimitMiddleware(limiter: RateLimiter) {
  return async (request: NextRequest) => {
    const result = await limiter.isAllowed(request)
    
    if (!result.allowed) {
      const response = NextResponse.json(
        { 
          error: 'Too many requests',
          message: result.blocked 
            ? 'You have been temporarily blocked due to too many failed attempts. Please wait before trying again.'
            : 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
          blocked: result.blocked,
          remainingTime: Math.ceil((result.resetTime - Date.now()) / 1000)
        },
        { status: result.blocked ? 429 : 429 }
      )

      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', limiter.config.maxAttempts.toString())
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString())
      
      if (result.blocked) {
        response.headers.set('X-RateLimit-Blocked', 'true')
      }

      return response
    }

    return null // Allow request to proceed
  }
}

// Predefined rate limiters for different endpoints
export const rateLimiters = {
  // Very strict for admin login attempts
  adminLogin: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 3,
    blockDurationMs: 60 * 60 * 1000, // 1 hour block
    skipOnSuccess: true
  }),

  // Reasonable for 2FA attempts (admin login verification)
  twoFA: new RateLimiter({
    windowMs: 10 * 60 * 1000, // 10 minutes
    maxAttempts: 10, // Allow more attempts for legitimate users
    blockDurationMs: 15 * 60 * 1000, // 15 minutes block (reduced from 30)
    skipOnSuccess: true
  }),

  // General API rate limiting
  api: new RateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    maxAttempts: 60,
    blockDurationMs: 5 * 60 * 1000 // 5 minutes block
  }),

  // Contact form submissions
  contactForm: new RateLimiter({
    windowMs: 10 * 60 * 1000, // 10 minutes
    maxAttempts: 3,
    blockDurationMs: 30 * 60 * 1000 // 30 minutes block
  }),

  // Password reset attempts
  passwordReset: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxAttempts: 3,
    blockDurationMs: 24 * 60 * 60 * 1000 // 24 hours block
  })
}
