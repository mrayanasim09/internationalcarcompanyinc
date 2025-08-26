import { NextResponse } from 'next/server'
import { authManager } from '@/lib/auth-utils'
import { cookies } from 'next/headers'
import { jwtManager } from '@/lib/jwt-utils'
import jwt from 'jsonwebtoken'

export async function POST() {
  try {
    // Call the auth manager logout
    await authManager.logoutAdmin()

    // Create response
    const response = NextResponse.json({ success: true })

    // Clear all admin cookies
    response.cookies.set('icc_admin_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })

    response.cookies.set('icc_admin_refresh', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })

    // Clear verification flag
    response.cookies.set('icc_admin_verified', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })

    // Also try to blacklist the tokens if we can extract them
    try {
      const accessToken = cookies().get('icc_admin_token')?.value
      if (accessToken) {
        const decoded = jwt.decode(accessToken) as { exp?: number } | null
        if (decoded?.exp) {
          await jwtManager.blacklistToken(accessToken, decoded.exp)
        }
      }
      
      const refreshToken = cookies().get('icc_admin_refresh')?.value
      if (refreshToken) {
        const decoded = jwt.decode(refreshToken) as { exp?: number } | null
        if (decoded?.exp) {
          await jwtManager.blacklistToken(refreshToken, decoded.exp)
        }
      }
    } catch (error) {
      console.error('Error blacklisting tokens during logout:', error)
    }

    // Clear cookies again in case the above failed
    response.cookies.set('icc_admin_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })

    response.cookies.set('icc_admin_refresh', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })

    return response

  } catch (error) {
    console.error('Logout API error:', error)
    
    // Even if logout fails, clear the cookie
    const response = NextResponse.json({ success: true })
    // Clean up any old am_tycoons cookies that might exist
    response.cookies.set('am_tycoons_admin_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })
    response.cookies.set('am_tycoons_admin_refresh', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    return response
  }
}

// Prevent other HTTP methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
} 