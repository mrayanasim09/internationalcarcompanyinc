import { NextRequest, NextResponse } from 'next/server'
import { uploadImageToStorage } from '@/lib/supabase-storage'

export async function POST(request: NextRequest) {
  try {
    // Note: Auth is enforced on the client/admin UI; this API always returns JSON on error
    // to avoid redirect/HTML responses that break JSON parsing on the client.

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Upload to Supabase Storage
    const imageUrl = await uploadImageToStorage(file)
    
    return NextResponse.json({ 
      success: true,
      url: imageUrl,
      message: 'Image uploaded successfully to Supabase Storage'
    })
  } catch (error: unknown) {
    console.error('Upload image error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
} 
