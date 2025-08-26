import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set (length: ' + (process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0) + ')' : 'Missing',
    JWT_SECRET: process.env.JWT_SECRET ? 'Set (length: ' + (process.env.JWT_SECRET?.length || 0) + ')' : 'Missing',
    SESSION_SECRET: process.env.SESSION_SECRET ? 'Set (length: ' + (process.env.SESSION_SECRET?.length || 0) + ')' : 'Missing',
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY ? 'Set (length: ' + (process.env.ENCRYPTION_KEY?.length || 0) + ')' : 'Missing',
    CSRF_SECRET: process.env.CSRF_SECRET ? 'Set (length: ' + (process.env.CSRF_SECRET?.length || 0) + ')' : 'Missing',
    NODE_ENV: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
}
