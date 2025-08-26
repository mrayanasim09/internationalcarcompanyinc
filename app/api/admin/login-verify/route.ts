import { NextRequest, NextResponse } from 'next/server'
import { csrf } from '@/lib/security/csrf'
import { z } from 'zod'
import { jwtManager } from '@/lib/jwt-utils'
import type { AdminPermissions, AdminRole } from '@/lib/types'
import { ROLE_PERMISSIONS } from '@/lib/types'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createRateLimitMiddleware, rateLimiters } from '@/lib/security/rate-limiter'

// Using Supabase (service role)

// Firestore date conversion removed

const verifySchema = z.object({
  email: z.string().email('Invalid email address').max(100),
  code: z.string().length(6, 'Verification code must be 6 digits'),
  deviceId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    console.log('DEBUG: login-verify started')
    
    if (!csrf.verify(request)) {
      console.log('DEBUG: CSRF verification failed')
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
    }
    
    console.log('DEBUG: CSRF verification passed')
    
    // Rate limit 2FA attempts
    const guard = createRateLimitMiddleware(rateLimiters.twoFA)
    const blocked = await guard(request)
    if (blocked) return blocked
    
    const body = await request.json()
    console.log('DEBUG: Request body:', { email: body.email, hasCode: !!body.code })
    
    const parsed = verifySchema.safeParse(body)
    if (!parsed.success) {
      console.log('DEBUG: Schema validation failed:', parsed.error.errors)
      return NextResponse.json(
        { error: 'Invalid input data', details: parsed.error.errors },
        { status: 400 }
      )
    }

    const email = parsed.data.email.toLowerCase().trim()
    const codeInput = parsed.data.code
    const code = String(codeInput).trim().replace(/\D/g, '').padStart(6, '0')
    const deviceId = parsed.data.deviceId

    console.log('DEBUG: Looking up user:', email)

    // In case of duplicate emails, prefer the most recently updated/issued code
    const { data: candidates, error: findErr } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .order('verification_code_expires_at', { ascending: false })
      .order('updated_at', { ascending: false })
      .limit(5)
      
    if (findErr) {
      console.error('DEBUG: Supabase find user error:', findErr)
      if (process.env.NODE_ENV !== 'production') {
        console.error('Supabase find user error:', findErr)
      }
      return NextResponse.json({ error: 'Verification failed', code: 'SUPABASE_FIND', details: findErr.message }, { status: 500 })
    }
    
    console.log('DEBUG: Found candidates:', candidates?.length || 0)
    
    if (!candidates || candidates.length === 0) {
      console.log('DEBUG: No candidates found')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    // Define the expected shape of the row for type safety
    type AdminUserRow = {
      id: string
      email: string
      role?: string
      permissions?: AdminPermissions | null
      verification_code?: string | null
      verification_code_expires_at?: string | null
      trusted_devices?: string[]
      updated_at?: string | null
    }

    // Pick a row that actually has a code, otherwise fall back to the most recent row
    const list = (Array.isArray(candidates) ? (candidates as AdminUserRow[]) : [])
    const selected = list.find((u) => Boolean(u.verification_code)) ?? list[0]
    const userData = selected as {
      id: string
      email: string
      role?: string
      permissions?: AdminPermissions | null
      verification_code?: string | null
      verification_code_expires_at?: string | null
      trusted_devices?: string[]
    }
    // Normalize stored code to string and pad to 6 digits to handle numeric storage stripping leading zeros
    const storedCodeRaw = userData.verification_code as unknown
    const storedCode = (storedCodeRaw === null || storedCodeRaw === undefined)
      ? null
      : String(storedCodeRaw).trim().replace(/\D/g, '').padStart(6, '0')
    const expiry = userData.verification_code_expires_at ? new Date(userData.verification_code_expires_at) : null

    // Debug logging (development only)
    console.log('Debug verification:', {
      email,
      hasCode: Boolean(storedCode),
      storedCode: storedCode,
      inputCode: code,
      codesMatch: storedCode === code,
      expiry: expiry?.toISOString(),
      now: new Date().toISOString(),
      isExpired: expiry ? Date.now() > expiry.getTime() : false
    })

    if (!storedCode) {
      // If user already has a valid, verified token cookie, treat as success to avoid dead-end UX
      try {
        const existingToken = request.cookies.get('icc_admin_token')?.value
        if (existingToken) {
          const parts = existingToken.split('.')
          if (parts.length >= 2) {
            let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
            const pad = base64.length % 4
            if (pad) base64 += '='.repeat(4 - pad)
            const payloadJson = Buffer.from(base64, 'base64').toString('utf-8')
            const payload = JSON.parse(payloadJson) as { exp?: number; twoFactorVerified?: boolean }
            const notExpired = !!payload.exp && Math.floor(Date.now() / 1000) <= payload.exp
            if (notExpired && payload.twoFactorVerified) {
              return NextResponse.json({ success: true })
            }
          }
        }
      } catch {}
      return NextResponse.json({ error: 'No verification code. Please request a new one.' }, { status: 400 })
    }

    if (expiry && Date.now() > expiry.getTime()) {
      return NextResponse.json({ error: 'Verification code expired.' }, { status: 400 })
    }

    if (storedCode !== code) {
      return NextResponse.json({ error: 'Invalid verification code.' }, { status: 400 })
    }

    // Mark verified and update lastLogin
    const ua = request.headers.get('user-agent') || 'unknown'
    const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown'
    const base = `${ua}::${ip}`
    let hash = 0
    for (let i = 0; i < base.length; i++) {
      hash = ((hash << 5) - hash) + base.charCodeAt(i)
    }
    const raw = deviceId && deviceId.length >= 8 ? deviceId : `fp_${Math.abs(hash)}`

    const trustedDevices = Array.isArray(userData.trusted_devices) ? userData.trusted_devices : []
    const updatedTrusted = Array.from(new Set([raw, ...trustedDevices])).slice(0, 10)

    console.log('DEBUG: Updating user:', userData.id)
    console.log('DEBUG: Update data:', {
      email_verified: true,
      verification_code: null,
      verification_code_expires_at: null,
      last_login: new Date().toISOString(),
      login_attempts: 0,
      lockout_until: null,
      trusted_devices: updatedTrusted,
      updated_at: new Date().toISOString(),
    })

    const { error: upErr } = await supabaseAdmin
      .from('admin_users')
      .update({
        email_verified: true,
        verification_code: null,
        verification_code_expires_at: null,
        last_login: new Date().toISOString(),
        login_attempts: 0,
        lockout_until: null,
        trusted_devices: updatedTrusted,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userData.id)
      
    if (upErr) {
      console.error('DEBUG: Supabase verify update error:', upErr)
      if (process.env.NODE_ENV !== 'production') {
        console.error('Supabase verify update error:', upErr)
      }
      return NextResponse.json({ error: 'Verification failed', code: 'SUPABASE_UPDATE', details: upErr.message }, { status: 500 })
    }
    
    console.log('DEBUG: User update successful')

    const role = (userData.role as string) || 'viewer'
    const defaultPerms = ROLE_PERMISSIONS[role as AdminRole]
    const permissions: AdminPermissions = (userData.permissions as AdminPermissions) || defaultPerms

    console.log('DEBUG: Creating JWT tokens for role:', role)

    // payload info is captured in token creation below

    const tokenResult = jwtManager.createTokenPair({
      userId: userData.id,
      email: email,
      role: role,
      permissions,
      twoFactorVerified: true,
    })
    
    const { accessToken, refreshToken, sessionId } = tokenResult
    
    console.log('DEBUG: JWT tokens created successfully, sessionId:', sessionId)

    const response = NextResponse.json({ success: true })
    const isHttps = (request.headers.get('x-forwarded-proto') || new URL(request.url).protocol).toString().includes('https')
    const hostname = new URL(request.url).hostname
    
    // Cookie domain logic for production
    let cookieDomain: string | undefined = undefined
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      cookieDomain = undefined // Don't set domain for localhost
    } else if (hostname === 'internationalcarcompanyinc.com') {
      cookieDomain = '.internationalcarcompanyinc.com' // Set domain for production
    }
    
    console.log('DEBUG: Setting cookies for domain:', cookieDomain, 'hostname:', hostname, 'isHttps:', isHttps)
    console.log('DEBUG: Access token length:', accessToken.length)
    console.log('DEBUG: Refresh token length:', refreshToken.length)
    
    response.cookies.set('icc_admin_token', accessToken, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      domain: cookieDomain,
      maxAge: 60 * 60, // 1 hour
      path: '/',
    })
    response.cookies.set('icc_admin_refresh', refreshToken, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      domain: cookieDomain,
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })
    // Set a short-lived flag for client to reliably detect success and redirect
    response.cookies.set('icc_admin_verified', '1', {
      httpOnly: false,
      secure: isHttps,
      sameSite: 'lax',
      domain: cookieDomain,
      maxAge: 5 * 60,
      path: '/',
    })

    // Reset rate limiter on success
    await rateLimiters.twoFA.recordSuccess(request)
    
    console.log('DEBUG: login-verify completed successfully')
    return response
  } catch (error) {
    console.error('DEBUG: login-verify caught error:', error)
    if (process.env.NODE_ENV !== 'production') {
      console.error('login-verify error:', error)
    }
    const err = error as unknown as { message?: string; code?: string }
    return NextResponse.json({ error: 'Verification failed', code: 'UNHANDLED', details: err?.message || err?.code || 'Unknown error' }, { status: 500 })
  }
}


