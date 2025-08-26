import { NextRequest, NextResponse } from 'next/server'
import { csrf } from '@/lib/security/csrf'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/admin'
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
      console.error('login-resend: CSRF verification failed')
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
    }

    // Check rate limiting
    const blocked = await guard(request)
    if (blocked) return blocked

    // Parse and validate request body
    let body: any
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('login-resend: Failed to parse request body:', parseError)
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      console.error('login-resend: Validation failed:', parsed.error.errors)
      return NextResponse.json(
        { error: 'Invalid input data', details: parsed.error.errors },
        { status: 400 }
      )
    }

    const email = parsed.data.email.toLowerCase().trim()
    console.log(`login-resend: Processing request for email: ${email}`)

    // Check if Supabase admin client is properly configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('login-resend: SUPABASE_SERVICE_ROLE_KEY is not configured')
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 })
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('login-resend: NEXT_PUBLIC_SUPABASE_URL is not configured')
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 })
    }

    // Find user in database
    console.log('login-resend: Searching for user in database...')
    const { data: users, error: findErr } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .limit(1)

    if (findErr) {
      console.error('login-resend: Database query error:', findErr)
      return NextResponse.json({ error: 'Resend failed - database error' }, { status: 500 })
    }

    if (!users || users.length === 0) {
      console.log(`login-resend: User not found for email: ${email}`)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = users[0] as { id: string }
    console.log(`login-resend: User found with ID: ${userData.id}`)

    // Generate verification code
    const code = generateCode()
    const expiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    console.log(`login-resend: Generated code: ${code}, expires at: ${expiry.toISOString()}`)

    // Update user with new verification code
    console.log('login-resend: Updating user verification code...')
    const { error: upErr } = await supabaseAdmin
      .from('admin_users')
      .update({
        verification_code: code,
        verification_code_expires_at: expiry.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userData.id)

    if (upErr) {
      console.error('login-resend: Database update error:', upErr)
      return NextResponse.json({ error: 'Resend failed - update error' }, { status: 500 })
    }

    console.log('login-resend: Verification code updated successfully')

    // Send verification email
    console.log('login-resend: Attempting to send verification email...')
    const origin = new URL(request.url).origin
    const emailEndpoint = `${origin}/api/send-verification-email`
    
    try {
      const res = await fetch(emailEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, type: 'verification' }),
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error('login-resend: Email service error:', res.status, errorText)
        return NextResponse.json({ 
          error: 'Verification code generated but email delivery failed',
          details: 'Please contact support if this persists'
        }, { status: 500 })
      }

      console.log('login-resend: Email sent successfully')
      return NextResponse.json({ 
        success: true, 
        message: 'Verification code resent successfully' 
      })

    } catch (emailError) {
      console.error('login-resend: Email service request failed:', emailError)
      return NextResponse.json({ 
        error: 'Verification code generated but email delivery failed',
        details: 'Please contact support if this persists'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('login-resend: Unexpected error:', error)
    
    // Provide more specific error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        return NextResponse.json({ 
          error: 'Service temporarily unavailable - external service error',
          details: 'Please try again later'
        }, { status: 503 })
      }
      
      if (error.message.includes('Supabase') || error.message.includes('database')) {
        return NextResponse.json({ 
          error: 'Service temporarily unavailable - database error',
          details: 'Please try again later'
        }, { status: 503 })
      }
    }
    
    return NextResponse.json({ 
      error: 'An unexpected error occurred',
      details: 'Please try again later or contact support'
    }, { status: 500 })
  }
}


