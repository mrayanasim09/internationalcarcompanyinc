import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { jwtManager } from '@/lib/jwt-utils'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { csrf } from '@/lib/security/csrf'

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['super_admin', 'admin', 'editor', 'viewer']),
  permissions: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    // CSRF protection
    if (!csrf.verify(request)) {
      return NextResponse.json(
        { error: 'CSRF token validation failed' },
        { status: 403 }
      )
    }

    // JWT validation
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const tokenValidation = jwtManager.verifyAccessToken(token)
    
    if (!tokenValidation.isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check if user has permission to create admin users
    const userRole = (tokenValidation.payload as { role?: string })?.role
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createSchema.parse(body)

    // Check if user already exists
    const supabase = getSupabaseAdmin()
    const { data: existingUser } = await (supabase as any)
      .from('admin_users')
      .select('id')
      .eq('email', validatedData.email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create new admin user
    const { data: newUser, error: insertError } = await (supabase as any)
      .from('admin_users')
      .insert({
        email: validatedData.email,
        password_hash: hashedPassword,
        role: validatedData.role,
        permissions: validatedData.permissions || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id, email, role')
      .single()

    if (insertError) {
      console.error('Error creating admin user:', insertError)
      return NextResponse.json(
        { error: 'Failed to create admin user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Admin user created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error in add-admin route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
