import { createClient } from '@supabase/supabase-js'

// Server-only Supabase client using the service role key
// WARNING: Never import this module in client components

let cachedClient: ReturnType<typeof createClient> | null = null

function instantiate(): ReturnType<typeof createClient> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key'
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('[supabase/admin] Using placeholder values. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for production.')
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    realtime: false,
    global: {
      headers: {
        'X-Client-Info': 'international-car-company-inc-admin',
      },
    },
  })
}

export function getSupabaseAdmin(): ReturnType<typeof createClient> {
  if (!cachedClient) {
    cachedClient = instantiate()
  }
  return cachedClient
}

// Backwards compatibility: a lazy proxy that only instantiates when used
export const supabaseAdmin = new Proxy({} as unknown as ReturnType<typeof createClient>, {
  get(_target, prop, receiver) {
    if (!cachedClient) {
      try {
        cachedClient = instantiate()
      } catch (e) {
        // In non-production builds, avoid crashing import time usage; throw when actually used
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.warn('[supabase/admin] Accessed before configuration. Ensure env vars are set at runtime.')
        }
        // Re-throw so API routes surface the error when called
        throw e
      }
    }
    return Reflect.get(cachedClient as unknown as Record<string, unknown>, prop, receiver as unknown as object)
  },
})


