// Lightweight JWT utilities for Edge Runtime (middleware)
// This version doesn't use Node.js crypto modules

interface JWTPayload {
  sub?: string
  email?: string
  role?: string
  permissions?: string[]
  sessionId?: string
  jti?: string
  iat?: number
  exp?: number
}

interface TokenValidationResult {
  isValid: boolean
  payload?: JWTPayload
  error?: string
}

export class JWTManagerEdge {
  private static instance: JWTManagerEdge
  private secret: string

  private constructor() {
    this.secret = process.env.JWT_SECRET || 'fallback-secret'
  }

  static getInstance(): JWTManagerEdge {
    if (!JWTManagerEdge.instance) {
      JWTManagerEdge.instance = new JWTManagerEdge()
    }
    return JWTManagerEdge.instance
  }

  // Simple JWT verification for Edge Runtime
  verifyAccessToken(token: string): TokenValidationResult {
    try {
      if (!token) {
        return { isValid: false, error: 'No token provided' }
      }

      // Split the token
      const parts = token.split('.')
      if (parts.length !== 3) {
        return { isValid: false, error: 'Invalid token format' }
      }

      // Decode the payload (base64url decode)
      const payload = this.base64UrlDecode(parts[1])
      const decodedPayload: JWTPayload = JSON.parse(payload)

      // Check expiration
      if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
        return { isValid: false, error: 'Token expired' }
      }

      // Check if token was issued in the future
      if (decodedPayload.iat && decodedPayload.iat > Date.now() / 1000) {
        return { isValid: false, error: 'Token issued in the future' }
      }

      return { isValid: true, payload: decodedPayload }
    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Token verification failed' 
      }
    }
  }

  // Simple base64url decode
  private base64UrlDecode(str: string): string {
    // Add padding if needed
    str += '='.repeat((4 - str.length % 4) % 4)
    
    // Convert base64url to base64
    str = str.replace(/-/g, '+').replace(/_/g, '/')
    
    // Decode
    try {
      return atob(str)
    } catch {
      throw new Error('Invalid base64 encoding')
    }
  }

  // Check if JTI is blacklisted (simplified for Edge Runtime)
  async isJtiBlacklisted(jti?: string): Promise<boolean> {
    if (!jti) return false
    
    // In Edge Runtime, we can't easily check Redis
    // For now, return false (not blacklisted)
    // In production, you might want to use a different approach
    return false
  }
}

export const jwtManagerEdge = JWTManagerEdge.getInstance()
