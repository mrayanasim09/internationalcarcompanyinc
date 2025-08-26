
import { cookies } from 'next/headers'
import { jwtManager } from './jwt-utils'

interface AdminAuth {
  userId: string
  email: string
  role: string
  permissions: string[]
  sessionId: string
}

export async function getAdminAuthFromRequest(): Promise<AdminAuth | null> {
  try {
    const cookieStore = await cookies()
    
    const token = cookieStore.get('icc_admin_token')?.value
    
    if (!token) {
      return null
    }

    const validation = jwtManager.verifyAccessToken(token)
    
    if (!validation.isValid || !validation.payload) {
      return null
    }

    const payload = validation.payload
    
    return {
      userId: payload.userId || '',
      email: payload.email || '',
      role: payload.role || 'viewer',
      permissions: payload.permissions ? Object.entries(payload.permissions).map(([key, value]) => `${key}:${value}`) : [],
      sessionId: payload.sessionId || '',
    }
  } catch {
    return null
  }
}

// For server components - read cookies from headers
export async function getAdminAuth(): Promise<AdminAuth | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('icc_admin_token')?.value
  
  if (!token) {
    return null
  }

  try {
    const result = jwtManager.verifyAccessToken(token)
    
    if (result.isValid && result.payload) {
      return {
        userId: result.payload.userId,
        email: result.payload.email,
        role: result.payload.role,
        permissions: result.payload.permissions ? Object.entries(result.payload.permissions).map(([key, value]) => `${key}:${value}`) : [],
        sessionId: result.payload.sessionId
      }
    }
    
    // If access token is invalid, try refresh token
    const refresh = cookieStore.get('icc_admin_refresh')?.value
    if (refresh) {
      const refreshed = jwtManager.refreshAccessToken(refresh)
      if (refreshed && refreshed.accessToken) {
        // Decode the new access token to get user info
        const decodedToken = jwtManager.decodeToken(refreshed.accessToken)
        if (decodedToken) {
          // Set new cookies
          cookieStore.set('icc_admin_token', refreshed.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60, // 15 minutes
          })
          
          if (refreshed.newRefreshToken) {
            cookieStore.set('icc_admin_refresh', refreshed.newRefreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              maxAge: 7 * 24 * 60 * 60, // 7 days
            })
          }
          
          return {
            userId: decodedToken.userId,
            email: decodedToken.email,
            role: decodedToken.role,
            permissions: decodedToken.permissions ? Object.entries(decodedToken.permissions).map(([key, value]) => `${key}:${value}`) : [],
            sessionId: decodedToken.sessionId
          }
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

export async function requireAdmin(): Promise<AdminAuth> {
  const admin = await getCurrentAdmin()
  if (!admin) {
    throw new Error('Authentication required')
  }
  return admin
}

export async function getCurrentAdmin(): Promise<AdminAuth | null> {
  return getAdminAuth()
}

export async function logoutAdmin(): Promise<void> {
  // Stateless JWT; cookie is cleared in API route
  return
}

export const authManager = {
  getCurrentAdmin,
  requireAdmin,
  logoutAdmin,
  getAdminAuthFromRequest,
}