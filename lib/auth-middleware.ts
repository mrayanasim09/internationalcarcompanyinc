import { NextRequest, NextResponse } from 'next/server'
import { jwtManager } from './jwt-utils'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string
    email: string
    role: string
    permissions: string[]
  }
}

export async function authMiddleware(req: NextRequest): Promise<NextResponse | null> {
  try {
    const token = req.cookies.get('icc_admin_token')?.value
    
    if (!token) {
      return null
    }

    // Verify the token
    const result = jwtManager.verifyAccessToken(token)
    
    if (!result.isValid || !result.payload) {
      // Clear invalid cookies
      const response = NextResponse.next()
      response.cookies.delete('icc_admin_token')
      response.cookies.delete('icc_admin_session')
      return response
    }

    // Check if token is blacklisted
    const jti = (result.payload as { jti?: string }).jti
    if (jti && await jwtManager.isJtiBlacklisted(jti)) {
      const response = NextResponse.next()
      response.cookies.delete('icc_admin_token')
      response.cookies.delete('icc_admin_session')
      return response
    }

    return null
  } catch (error) {
    console.error('Auth middleware error:', error)
    return null
  }
}

// Higher-order function to wrap handlers with authentication
export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      const token = req.cookies.get('icc_admin_token')?.value
      
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Verify the token
      const result = jwtManager.verifyAccessToken(token)
      
      if (!result.isValid || !result.payload) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }

      // Check if token is blacklisted
      const jti = (result.payload as { jti?: string }).jti
      if (jti && await jwtManager.isJtiBlacklisted(jti)) {
        return NextResponse.json({ error: 'Token blacklisted' }, { status: 401 })
      }

      // Add user to request
      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = {
        userId: result.payload.userId,
        email: result.payload.email,
        role: result.payload.role,
        permissions: Object.entries(result.payload.permissions || {})
          .filter(([, allowed]) => Boolean(allowed))
          .map(([key]) => key)
      }

      return handler(authenticatedReq)
    } catch (error) {
      console.error('Auth wrapper error:', error)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }
  }
}

// Higher-order function to wrap handlers with role-based authorization
export function withRole(requiredRole: string) {
  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return withAuth(async (req: AuthenticatedRequest) => {
      const user = req.user!
      
      if (user.role !== requiredRole && user.role !== 'super_admin') {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }
      
      return handler(req)
    })
  }
}

export function withPermission(requiredPermission: string) {
  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return withAuth(async (req: AuthenticatedRequest) => {
      const user = req.user!
      
      if (!user.permissions.includes(requiredPermission) && user.role !== 'super_admin') {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }
      
      return handler(req)
    })
  }
}

export function refreshTokenMiddleware(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      const token = req.cookies.get('icc_admin_token')?.value
      
      if (!token) {
        return handler(req as AuthenticatedRequest)
      }

      const result = jwtManager.verifyAccessToken(token)
      if (result.isValid && result.payload) {
        if (!(await jwtManager.isJtiBlacklisted((result.payload as { jti?: string }).jti))) {
          ;(req as AuthenticatedRequest).user = {
            userId: result.payload.userId,
            email: result.payload.email,
            role: result.payload.role,
            permissions: Object.entries(result.payload.permissions || {})
              .filter(([, allowed]) => Boolean(allowed))
              .map(([key]) => key)
          }
        }
      }
      return handler(req as AuthenticatedRequest)
    } catch (error) {
      console.error('Token refresh error:', error)
      return handler(req as AuthenticatedRequest)
    }
  }
}
