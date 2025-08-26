import { NextRequest, NextResponse } from 'next/server'
import { csrf } from '@/lib/security/csrf'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    requestMethod: request.method,
    requestUrl: request.url,
    headers: {},
    environment: {},
    csrf: {},
    supabase: {},
    errors: []
  }

  try {
    // Log request headers
    for (const [key, value] of request.headers.entries()) {
      if (key.toLowerCase().includes('csrf') || key.toLowerCase().includes('cookie')) {
        debugInfo.headers[key] = value
      }
    }

    // Check environment variables
    debugInfo.environment = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'configured' : 'missing'
    }

    // Test CSRF verification
    try {
      const csrfResult = csrf.verify(request)
      debugInfo.csrf = {
        verificationResult: csrfResult,
        tokenFound: !!request.headers.get('x-csrf-token'),
        cookieFound: !!request.cookies.get('csrf_token')?.value
      }
    } catch (csrfError) {
      debugInfo.csrf.error = csrfError instanceof Error ? csrfError.message : 'Unknown CSRF error'
      debugInfo.errors.push(`CSRF verification failed: ${debugInfo.csrf.error}`)
    }

    // Test Supabase connection
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const { data, error } = await supabaseAdmin
          .from('admin_users')
          .select('count')
          .limit(1)

        debugInfo.supabase = {
          connected: !error,
          error: error?.message || null,
          data: data
        }

        if (error) {
          debugInfo.errors.push(`Supabase connection failed: ${error.message}`)
        }
      } else {
        debugInfo.supabase = {
          connected: false,
          error: 'Missing environment variables',
          data: null
        }
        debugInfo.errors.push('Missing Supabase environment variables')
      }
    } catch (supabaseError) {
      debugInfo.supabase = {
        connected: false,
        error: supabaseError instanceof Error ? supabaseError.message : 'Unknown Supabase error',
        data: null
      }
      debugInfo.errors.push(`Supabase exception: ${debugInfo.supabase.error}`)
    }

    // Try to parse request body
    try {
      const body = await request.json()
      debugInfo.requestBody = body
    } catch (parseError) {
      debugInfo.errors.push(`Request body parsing failed: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
    }

    return NextResponse.json({
      success: true,
      debug: debugInfo,
      summary: {
        hasErrors: debugInfo.errors.length > 0,
        errorCount: debugInfo.errors.length,
        csrfWorking: debugInfo.csrf.verificationResult,
        supabaseWorking: debugInfo.supabase.connected,
        environmentConfigured: debugInfo.environment.hasSupabaseUrl && debugInfo.environment.hasServiceRoleKey
      }
    })

  } catch (error) {
    debugInfo.errors.push(`General error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    
    return NextResponse.json({
      success: false,
      error: 'Debug endpoint failed',
      debug: debugInfo
    }, { status: 500 })
  }
}
