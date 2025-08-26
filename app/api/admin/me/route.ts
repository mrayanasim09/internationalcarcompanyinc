/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { jwtManager } from '@/lib/jwt-utils'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

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
      return NextResponse.json({ 
        authenticated: false,
        email: undefined,
        role: undefined,
        permissions: []
      })
    }

    // Verify JWT token
    const tokenValidation = jwtManager.verifyAccessToken(adminToken)

    if (!tokenValidation.isValid || !tokenValidation.payload) {
      return NextResponse.json({ 
        authenticated: false,
        email: undefined,
        role: undefined,
        permissions: []
      })
    }

    const payload = tokenValidation.payload as unknown as TokenPayload

    // Check if token is blacklisted
    if (payload.jti && await jwtManager.isJtiBlacklisted(payload.jti)) {
      return NextResponse.json({ 
        authenticated: false,
        email: undefined,
        role: undefined,
        permissions: []
      })
    }

    // Check if token is expired
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return NextResponse.json({ 
        authenticated: false,
        email: undefined,
        role: undefined,
        permissions: []
      })
    }

    // Get admin user from database
    const { data: adminUser, error: dbError } = await getSupabaseAdmin()
      .from('admin_users')
      .select('*')
      .eq('id', payload.sub)
      .eq('is_active', true)
      .single()

    if (dbError || !adminUser) {
      return NextResponse.json({ 
        authenticated: false,
        email: undefined,
        role: undefined,
        permissions: []
      })
    }

    // Update last login time
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (getSupabaseAdmin() as any)
      .from('admin_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('email', payload.email)

    // Return admin user data in the format expected by AuthProvider
    return NextResponse.json({
      authenticated: true,
      email: (adminUser as any).email,
      role: (adminUser as any).role || 'viewer',
      permissions: (adminUser as any).permissions || [],
      admin: {
        id: (adminUser as any).id,
        email: (adminUser as any).email,
        role: (adminUser as any).role,
        permissions: (adminUser as any).permissions || [],
        is_active: (adminUser as any).is_active || true,
        email_verified: (adminUser as any).email_verified || false,
        created_at: (adminUser as any).created_at,
        updated_at: (adminUser as any).updated_at,
        last_login_at: (adminUser as any).last_login_at,
      },
      token: {
        expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : null,
        sessionId: payload.sessionId
      }
    })

  } catch (error) {
    console.error('Admin me endpoint error:', error)
    return NextResponse.json({ 
      authenticated: false,
      email: undefined,
      role: undefined,
      permissions: []
    })
  }
}


