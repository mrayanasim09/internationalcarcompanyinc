import { NextRequest, NextResponse } from 'next/server'
import { authManager } from '@/lib/auth-utils'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const user = await authManager.getAdminAuthFromRequest()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching reviews:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      )
    }

    return NextResponse.json({ reviews: reviews || [] })
  } catch (error) {
    console.error('GET reviews error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authManager.getAdminAuthFromRequest()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { carId, rating, comment, reviewerName, reviewerEmail } = body

    if (!carId || !rating || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        car_id: carId,
        rating,
        comment,
        reviewer_name: reviewerName,
        reviewer_email: reviewerEmail,
        created_at: new Date().toISOString(),
        approved: false
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating review:', error)
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      )
    }

    return NextResponse.json({ review })
  } catch (error) {
    console.error('POST review error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await authManager.getAdminAuthFromRequest()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, approved } = body

    if (id === undefined || approved === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()
    const { data: review, error } = await supabase
      .from('reviews')
      .update({
        approved,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating review:', error)
      return NextResponse.json(
        { error: 'Failed to update review' },
        { status: 500 }
      )
    }

    return NextResponse.json({ review })
  } catch (error) {
    console.error('PUT review error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!csrf.verify(request)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
    }
    const user = await authManager.getAdminAuthFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!user.permissions?.canDeleteReviews && user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
    const { error } = await supabaseAdmin.from('reviews').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = (err as Error).message || 'Failed to delete review'
    const status = message.includes('Authentication') ? 401 : 500
    return NextResponse.json({ error: message }, { status })
  }
}


