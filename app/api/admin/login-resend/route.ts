import { NextRequest, NextResponse } from 'next/server'
import { csrf } from '@/lib/security/csrf'
import { z } from 'zod'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { createRateLimitMiddleware, rateLimiters } from '@/lib/security/rate-limiter'

const schema = z.object({
  email: z.string().email('Invalid email address').max(100),
})

function generateCode(): string {
  const array = new Uint8Array(6)
  crypto.getRandomValues(array)
  return Array.from(array, b => b % 10).join('')
}

const guard = createRateLimitMiddleware(rateLimiters.twoFA)

export async function POST(request: NextRequest) {
  try {
    // Validate CSRF token
    if (!csrf.verify(request)) {
      console.error('CSRF verification failed for login-resend')
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
    }

    // Check rate limiting
    const blocked = await guard(request)
    if (blocked) return blocked

    // Parse and validate request body
    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error('Failed to parse request body:', error)
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      console.error('Schema validation failed:', parsed.error.errors)
      return NextResponse.json(
        { error: 'Invalid input data', details: parsed.error.errors },
        { status: 400 }
      )
    }

    const email = parsed.data.email.toLowerCase().trim()
    console.log(`Processing login-resend request for email: ${email}`)

    // Initialize Supabase admin client
    let supabaseAdmin
    try {
      supabaseAdmin = getSupabaseAdmin()
    } catch (error) {
      console.error('Failed to initialize Supabase admin client:', error)
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    // Find user in database
    const { data: users, error: findErr } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .limit(1)

    if (findErr) {
      console.error('Supabase find user error:', findErr)
      return NextResponse.json({ error: 'Resend failed' }, { status: 500 })
    }

    if (!users || users.length === 0) {
      console.log(`User not found for email: ${email}`)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = users[0] as { id: string }
    console.log(`Found user with ID: ${userData.id}`)

    // Generate verification code
    const code = generateCode()
    const expiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Update user with new verification code
    const { error: upErr } = await supabaseAdmin
      .from('admin_users')
      .update({
        verification_code: code,
        verification_code_expires_at: expiry.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userData.id)

    if (upErr) {
      console.error('Supabase update code error:', upErr)
      return NextResponse.json({ error: 'Resend failed' }, { status: 500 })
    }

    console.log(`Verification code updated for user: ${userData.id}`)

    // Send verification email
    const origin = new URL(request.url).origin
    const emailResponse = await fetch(`${origin}/api/send-verification-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, type: 'verification' }),
    })

    if (!emailResponse.ok) {
      const emailError = await emailResponse.text()
      console.error('Email sending failed:', emailError)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    console.log(`Verification email sent successfully to: ${email}`)
    return NextResponse.json({ success: true, message: 'Verification code resent' })

  } catch (error) {
    console.error('login-resend error:', error)
    return NextResponse.json({ error: 'Resend failed' }, { status: 500 })
  }
}


