import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export interface CSRFConfig {
  secret: string
  tokenLength: number
  tokenExpiry: number
  headerName: string
  cookieName: string
  methods: string[]
}

export class CSRFProtection {
  private config: CSRFConfig

  constructor(config?: Partial<CSRFConfig>) {
    this.config = {
      secret: process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex'),
      tokenLength: 32, // 32 bytes = 64 hex characters
      tokenExpiry: 60 * 60 * 1000, // 1 hour
      headerName: 'X-CSRF-Token',
      cookieName: 'csrf-token',
      methods: ['POST', 'PUT', 'DELETE', 'PATCH'],
      ...config
    }
  }

  /**
   * Generate a new CSRF token
   */
  generateToken(): string {
    const bytes = crypto.randomBytes(this.config.tokenLength)
    return bytes.toString('hex')
  }

  /**
   * Generate a signed CSRF token with expiry
   */
  generateSignedToken(): { token: string; signedToken: string; expiry: number } {
    const token = this.generateToken()
    const expiry = Date.now() + this.config.tokenExpiry
    const data = `${token}:${expiry}`
    const signature = this.sign(data)
    const signedToken = `${data}:${signature}`
    
    return { token, signedToken, expiry }
  }

  /**
   * Verify a signed CSRF token
   */
  verifyToken(signedToken: string): { valid: boolean; token?: string; error?: string } {
    try {
      const parts = signedToken.split(':')
      if (parts.length !== 3) {
        return { valid: false, error: 'Invalid token format' }
      }

      const [token, expiryStr, signature] = parts
      const expiry = parseInt(expiryStr, 10)
      const data = `${token}:${expiry}`

      // Check if token has expired
      if (Date.now() > expiry) {
        return { valid: false, error: 'Token expired' }
      }

      // Verify signature
      const expectedSignature = this.sign(data)
      if (signature !== expectedSignature) {
        return { valid: false, error: 'Invalid signature' }
      }

      return { valid: true, token }
    } catch (error) {
      return { valid: false, error: 'Token verification failed' }
    }
  }

  /**
   * Sign data with HMAC
   */
  private sign(data: string): string {
    return crypto
      .createHmac('sha256', this.config.secret)
      .update(data)
      .digest('hex')
  }

  /**
   * Create CSRF middleware
   */
  createMiddleware() {
    return async (request: NextRequest) => {
      // Only check CSRF for specified methods
      if (!this.config.methods.includes(request.method)) {
        return NextResponse.next()
      }

      // Skip CSRF check for API routes that don't need it
      const url = new URL(request.url)
      if (url.pathname.startsWith('/api/webhook') || url.pathname.startsWith('/api/public')) {
        return NextResponse.next()
      }

      const token = request.headers.get(this.config.headerName) || 
                   request.nextUrl.searchParams.get('csrf_token')

      if (!token) {
        return NextResponse.json(
          { error: 'CSRF token missing' },
          { status: 403 }
        )
      }

      const verification = this.verifyToken(token)
      if (!verification.valid) {
        return NextResponse.json(
          { error: 'Invalid CSRF token', details: verification.error },
          { status: 403 }
        )
      }

      return NextResponse.next()
    }
  }

  /**
   * Get CSRF token for forms
   */
  getTokenForForm(): { token: string; signedToken: string } {
    const { token, signedToken } = this.generateSignedToken()
    return { token, signedToken }
  }

  /**
   * Validate form submission
   */
  validateFormSubmission(formData: FormData): { valid: boolean; error?: string } {
    const token = formData.get('csrf_token') as string
    if (!token) {
      return { valid: false, error: 'CSRF token missing' }
    }

    const verification = this.verifyToken(token)
    return {
      valid: verification.valid,
      error: verification.error
    }
  }
}

// Create default CSRF instance
export const csrfProtection = new CSRFProtection()

// Export convenience functions
export const generateCSRFToken = () => csrfProtection.generateToken()
export const generateSignedCSRFToken = () => csrfProtection.generateSignedToken()
export const verifyCSRFToken = (token: string) => csrfProtection.verifyToken(token)
export const createCSRFMiddleware = () => csrfProtection.createMiddleware()
export const getCSRFTokenForForm = () => csrfProtection.getTokenForForm()
export const validateCSRFForm = (formData: FormData) => csrfProtection.validateFormSubmission(formData)

// Backward-compatible shim for legacy imports (csrf.issue/verify)
export const csrf = {
  issue(): string {
    // Generate a simple token for backward compatibility
    const token = csrfProtection.generateToken()
    console.log('DEBUG: Generated CSRF token:', token.substring(0, 20) + '...')
    return token
  },
  verify(request: Request | NextRequest): boolean {
    try {
      // Check for CSRF token in headers (case-insensitive)
      const headers = request.headers
      let csrfToken = ''
      
      // Try different case variations
      for (const [key, value] of headers.entries()) {
        if (key.toLowerCase() === 'x-csrf-token' && value) {
          csrfToken = value
          break
        }
      }
      
      if (!csrfToken) {
        console.log('DEBUG: No CSRF token found in headers')
        return false
      }
      
      console.log('DEBUG: CSRF token found:', csrfToken.substring(0, 20) + '...')
      console.log('DEBUG: CSRF token length:', csrfToken.length)
      console.log('DEBUG: CSRF token format check:', /^[a-f0-9]+$/i.test(csrfToken))
      
      // For backward compatibility, accept simple tokens (64 hex chars for 32 bytes)
      if (csrfToken.length === 64 && /^[a-f0-9]+$/i.test(csrfToken)) {
        console.log('DEBUG: CSRF token format is valid (simple token)')
        return true
      }
      
      // Also try to verify as a signed token
      try {
        const verification = csrfProtection.verifyToken(csrfToken)
        if (verification.valid) {
          console.log('DEBUG: CSRF token verified as signed token')
          return true
        }
      } catch (signedTokenError) {
        console.log('DEBUG: Failed to verify as signed token:', signedTokenError)
      }
      
      console.log('DEBUG: CSRF token format is invalid')
      return false
    } catch (error) {
      console.error('DEBUG: CSRF verification error:', error)
      return false
    }
  }
}


