import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabasePublic = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'international-car-company-inc'
    }
  }
})

// Enhanced error handling and connection testing
export const testSupabaseConnection = async () => {
  try {
    const { error } = await supabasePublic
      .from('cars')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Supabase connection test failed:', error)
      return { connected: false, error: error.message }
    }
    
    return { connected: true, error: null }
  } catch (err) {
    console.error('Supabase connection test exception:', err)
    return { connected: false, error: 'Connection failed' }
  }
}


