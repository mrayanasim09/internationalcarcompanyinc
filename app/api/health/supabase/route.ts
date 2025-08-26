import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const startedAt = Date.now()
  let ok = false
  let error: string | undefined
  let details: any = {}

  try {
    // Check environment variables
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    details.environment = {
      hasSupabaseUrl,
      hasServiceRoleKey,
      hasAnonKey,
      supabaseUrl: hasSupabaseUrl ? 'configured' : 'missing',
      serviceRoleKey: hasServiceRoleKey ? 'configured' : 'missing',
      anonKey: hasAnonKey ? 'configured' : 'missing'
    }

    if (!hasSupabaseUrl || !hasServiceRoleKey) {
      error = 'Missing required Supabase environment variables'
      ok = false
    } else {
      // Test database connection
      try {
        const { data, error: dbError } = await supabaseAdmin
          .from('admin_users')
          .select('count')
          .limit(1)

        if (dbError) {
          error = `Database query failed: ${dbError.message}`
          details.databaseError = dbError
          ok = false
        } else {
          ok = true
          details.database = {
            connected: true,
            queryResult: data
          }
        }
      } catch (dbException) {
        error = `Database connection exception: ${dbException instanceof Error ? dbException.message : 'Unknown error'}`
        details.databaseException = dbException
        ok = false
      }
    }

  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error during health check'
    details.exception = e
    ok = false
  }

  const ms = Date.now() - startedAt

  return NextResponse.json(
    {
      ok,
      service: 'supabase',
      ms,
      error: ok ? undefined : error,
      details,
      timestamp: new Date().toISOString(),
    },
    { 
      headers: { 'Cache-Control': 'no-store' },
      status: ok ? 200 : 503
    }
  )
}
