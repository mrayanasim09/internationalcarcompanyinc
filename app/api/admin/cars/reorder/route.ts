import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { authManager } from '@/lib/auth-utils'
import { csrf } from '@/lib/security/csrf'
import { createRateLimitMiddleware, rateLimiters } from '@/lib/security/rate-limiter'

// Input validation schema
const reorderSchema = z.object({
  cars: z.array(z.object({
    id: z.string().min(1, 'Car ID is required'),
    displayOrder: z.number().int().min(0, 'Display order must be non-negative')
  })).min(1, 'At least one car is required')
})

type ReorderInput = z.infer<typeof reorderSchema>

const guard = createRateLimitMiddleware(rateLimiters.api)

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await guard(request)
    if (rateLimitResult) {
      return rateLimitResult
    }

    // CSRF protection
    const csrfResult = await csrf(request)
    if (csrfResult) {
      return csrfResult
    }

    // Authentication
    const authResult = await authManager.authenticate(request)
    if (authResult) {
      return authResult
    }

    const user = authManager.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = reorderSchema.parse(body)

    // Check if user has permission to reorder cars
    if (!user.permissions.canEditCars) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Update cars with new display order
    const updatePromises = validatedData.cars.map(car => 
      supabaseAdmin
        .from('cars')
        .update({ display_order: car.displayOrder })
        .eq('id', car.id)
    )

    const results = await Promise.all(updatePromises)
    
    // Check if any updates failed
    const failedUpdates = results.filter(result => result.error)
    if (failedUpdates.length > 0) {
      console.error('Failed to update car display order:', failedUpdates)
      return NextResponse.json({ error: 'Failed to update car order' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Car order updated successfully' 
    })

  } catch (error: unknown) {
    console.error('POST /api/admin/cars/reorder error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: error.errors 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
