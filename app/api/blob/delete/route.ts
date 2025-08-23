import { NextRequest, NextResponse } from 'next/server'
import { authManager } from '@/lib/auth-utils'
import { deleteImageFromStorage } from '@/lib/supabase-storage'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    await authManager.requireAdmin()

    const body = await request.json()
    const url: string | undefined = body?.url || body?.imageUrl

    if (!url) {
      return NextResponse.json({ error: 'Blob URL is required' }, { status: 400 })
    }

    // Delete from Supabase Storage
    await deleteImageFromStorage(url)

    return NextResponse.json({ 
      success: true, 
      message: 'Image deleted successfully from Supabase Storage'
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const status = message.includes('Authentication') ? 401 : 500
    return NextResponse.json({ 
      error: 'Failed to delete image', 
      details: message 
    }, { status })
  }
}
