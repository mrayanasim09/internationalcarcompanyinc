import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { authManager } from '@/lib/auth-utils'
import { csrf } from '@/lib/security/csrf'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const createUserSchema = z.object({
  email: z.string().email('Invalid email address').max(100),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  role: z.enum(['viewer', 'admin', 'super_admin']).default('viewer'),
  permissions: z.record(z.boolean()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Verify CSRF token
    if (!csrf.verify(request)) {
      console.error('CSRF verification failed for user creation')
      return NextResponse.json({ 
        error: 'CSRF verification failed. Please refresh the page and try again.',
        details: 'Invalid or missing CSRF token'
      }, { status: 403 })
    }

    // Verify user authentication and permissions
    const user = await authManager.requireAdmin()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    if (user.role !== 'super_admin') {
      return NextResponse.json({ 
        error: 'Insufficient permissions',
        details: 'Only super admins can create new users'
      }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const parsed = createUserSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input data', 
          details: parsed.error.errors 
        },
        { status: 400 }
      )
    }

    const { email, password, role, permissions } = parsed.data

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (existingUser) {
      return NextResponse.json({ 
        error: 'User already exists',
        details: 'An admin user with this email already exists'
      }, { status: 409 })
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 12)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabaseAdmin as any)
      .from('admin_users')
      .insert({
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        role,
        permissions,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error creating user:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: data.id,
        email: data.email,
        role: data.role,
        is_active: data.is_active,
        created_at: data.created_at
      }
    })

  } catch (err) {
    console.error('User creation error:', err)
    const message = (err as Error).message || 'Failed to create user'
    const status = message.includes('Authentication') ? 401 : 
                   message.includes('CSRF') ? 403 : 500
    
    return NextResponse.json({ 
      error: message,
      details: 'Please check your input and try again'
    }, { status })
  }
}


