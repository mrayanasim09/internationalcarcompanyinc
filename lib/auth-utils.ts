
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { jwtManager } from './jwt-utils'

export interface AdminAuth {
  userId: string
  email: string
  role: string
  permissions: any
  sessionId?: string
}

// For API routes - read cookies from request
export async function getAdminAuthFromRequest(request: NextRequest): Promise<AdminAuth | null> {
  console.log('getAdminAuthFromRequest: Starting authentication check...')
  
  // Log all cookies for debugging
  const allCookies = request.cookies.getAll()
  console.log('getAdminAuthFromRequest: All cookies:', allCookies.map(c => ({ name: c.name, value: c.value?.substring(0, 20) + '...' })))
  
  const token = request.cookies.get('icc_admin_token')?.value
  console.log('getAdminAuthFromRequest: Token found:', !!token, 'Token length:', token?.length || 0)
  
  if (!token) {
    console.log('getAdminAuthFromRequest: No token found, returning null')
    return null
  }

  try {
    const result = jwtManager.verifyAccessToken(token)
    
    if (result.isValid && result.payload) {
      return {
        userId: result.payload.userId,
        email: result.payload.email,
        role: result.payload.role,
        permissions: result.payload.permissions,
        sessionId: result.payload.sessionId
      }
    }
    
    // If access token is invalid, try refresh token
    const refresh = request.cookies.get('icc_admin_refresh')?.value
    if (refresh) {
      const refreshed = jwtManager.refreshAccessToken(refresh)
      if (refreshed && refreshed.accessToken) {
        // Decode the new access token to get user info
        const decodedToken = jwtManager.decodeToken(refreshed.accessToken)
        if (decodedToken) {
          return {
            userId: decodedToken.userId,
            email: decodedToken.email,
            role: decodedToken.role,
            permissions: decodedToken.permissions,
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
        permissions: result.payload.permissions,
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
            permissions: decodedToken.permissions,
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