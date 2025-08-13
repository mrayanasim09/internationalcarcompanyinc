import { NextRequest, NextResponse } from 'next/server'
import { authManager } from '@/lib/auth-utils'

// Disable caching for this API route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Check authentication
    await authManager.requireAdmin()
    
    const config = {
      firebase: {
        configured: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
      },
      netlify: {
        siteId: process.env.NETLIFY_SITE_ID,
        deployUrl: process.env.DEPLOY_URL,
      },
      auth: {
        nextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nextAuthUrl: process.env.NEXTAUTH_URL,
      },
      admin: {
        emails: process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.ADMIN_EMAILS,
      },
      storage: {
        supabaseUrlSet: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        bucket: process.env.SUPABASE_STORAGE_BUCKET || 'car-images',
      },
    }
    
    return NextResponse.json(config)
  } catch (error: unknown) {
    console.error('Debug route error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    if (errorMessage.includes('Authentication required')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (errorMessage.includes('Insufficient permissions')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    return NextResponse.json(
      { error: 'Debug access failed' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    // Accept anonymous RUM events (no auth).
    console.log('RUM', body)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Debug POST error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { error: 'Debug operation failed' },
      { status: 500 }
    )
  }
}

