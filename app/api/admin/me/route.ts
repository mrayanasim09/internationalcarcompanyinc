import { NextRequest, NextResponse } from 'next/server'
import { jwtManager } from '@/lib/jwt-utils'
import { supabaseAdmin } from '@/lib/supabase/admin'

interface AdminUser {
  id: string
  email: string
  role: string
  permissions: string[]
  is_active: boolean
  email_verified: boolean
  created_at: string
  updated_at: string
  created_by?: string
  last_login_at?: string
}

interface TokenPayload {
  sub: string
  email: string
  role: string
  permissions: string[]
  sessionId: string
  jti: string
  iat: number
  exp: number
}

export async function GET(request: NextRequest) {
  try {
    // Get admin token from cookies
    const adminToken = request.cookies.get('icc_admin_token')?.value

    if (!adminToken) {
      return NextResponse.json({ error: 'No admin token provided' }, { status: 401 })
    }

    // Verify JWT token
    const tokenValidation = jwtManager.verifyAccessToken(adminToken)

    if (!tokenValidation.isValid || !tokenValidation.payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const payload = tokenValidation.payload as TokenPayload

    // Check if token is blacklisted
    if (payload.jti && await jwtManager.isTokenBlacklisted(payload.jti)) {
      return NextResponse.json({ error: 'Token has been revoked' }, { status: 401 })
    }

    // Check if token is expired
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return NextResponse.json({ error: 'Token has expired' }, { status: 401 })
    }

    // Get admin user from database
    const { data: adminUser, error: dbError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('id', payload.sub)
      .eq('is_active', true)
      .single()

    if (dbError || !adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 })
    }

    // Update last login
    await supabaseAdmin
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', payload.sub)

    // Return admin user data (excluding sensitive fields)
    const safeAdminUser: Omit<AdminUser, 'password_hash'> = {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      permissions: adminUser.permissions || [],
      is_active: adminUser.is_active,
      email_verified: adminUser.email_verified,
      created_at: adminUser.created_at,
      updated_at: adminUser.updated_at,
      created_by: adminUser.created_by,
      last_login_at: adminUser.last_login_at
    }

    return NextResponse.json({
      success: true,
      admin: safeAdminUser,
      token: {
        expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : null,
        sessionId: payload.sessionId
      }
    })

  } catch (error) {
    console.error('Admin me endpoint error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


