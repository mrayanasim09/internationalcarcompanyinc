import { NextRequest, NextResponse } from 'next/server'
import { csrf } from '@/lib/security/csrf'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    // Validate CSRF token
    if (!csrf.verify(request)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
    }

    // Get admin users (only safe fields)
    const { data: users, error } = await supabaseAdmin
      .from('admin_users')
      .select('id, email, created_at, updated_at, two_factor_enabled')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('list-users: Database query error:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      count: users?.length || 0,
      users: users || []
    })

  } catch (error) {
    console.error('list-users: Unexpected error:', error)
    return NextResponse.json({ 
      error: 'An unexpected error occurred' 
    }, { status: 500 })
  }
}
