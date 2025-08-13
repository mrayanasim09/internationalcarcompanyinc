import { NextRequest, NextResponse } from 'next/server'
import { supabasePublic } from '@/lib/supabase/client'
import { rateLimiters } from '@/lib/security/rate-limiter'
import { createStore } from '@/lib/security/session-store'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  const startedAt = Date.now()
  try {
    // Supabase counts
    const [totalQ, approvedQ, inventoryQ, publicQ, sampleQ] = await Promise.all([
      supabasePublic.from('cars').select('*', { count: 'exact', head: true }),
      supabasePublic.from('cars').select('*', { count: 'exact', head: true }).eq('approved', true),
      supabasePublic.from('cars').select('*', { count: 'exact', head: true }).eq('is_inventory', true),
      supabasePublic.from('cars').select('*', { count: 'exact', head: true }).eq('approved', true).eq('is_inventory', true),
      supabasePublic.from('cars').select('id,title,approved,is_inventory,listed_at').order('listed_at', { ascending: false }).limit(10),
    ])

    const counts = {
      totalCars: totalQ.count || 0,
      approvedCars: approvedQ.count || 0,
      inventoryCars: inventoryQ.count || 0,
      publicCars: publicQ.count || 0,
    }

    // Rate limiter status for this requester (API limiter)
    const rl = await rateLimiters.api.getStatus(request)

    // Session store backend info
    const useRedis = process.env.USE_REDIS === '1' && !!process.env.REDIS_URL
    const store = await createStore()
    let sessionKeys = 0
    try {
      const keys = await store.keys('session:')
      sessionKeys = keys.length
    } catch {}

    // Config presence (non-sensitive)
    const config = {
      supabaseUrlSet: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabaseAnonKeySet: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      netlifySiteIdSet: Boolean(process.env.NETLIFY_SITE_ID),
      cspReportUriSet: Boolean(process.env.CSP_REPORT_URI),
      storageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'car-images',
      useRedis,
    }

    // Quick supabase health ping
    let supabaseHealth: { ok: boolean; ms: number } = { ok: true, ms: 0 }
    try {
      const pingStart = Date.now()
      await supabasePublic.from('cars').select('id').limit(1)
      supabaseHealth = { ok: true, ms: Date.now() - pingStart }
    } catch {
      supabaseHealth = { ok: false, ms: 0 }
    }

    // Error log snapshot (from client-reported recent errors stored in session store if any)
    let recentErrors: Array<{ id: string; message: string; at: string }> = []
    try {
      const keys = await store.keys('error:')
      const limited = keys.slice(0, 10)
      const values = await Promise.all(limited.map((k) => store.get(k)))
      recentErrors = values
        .filter(Boolean)
        .map((v, i) => ({ id: limited[i], message: String(v), at: new Date().toISOString() }))
    } catch {}

    const ms = Date.now() - startedAt
    return NextResponse.json(
      {
        ok: true,
        ms,
        counts,
        samples: sampleQ.data || [],
        rateLimit: rl,
        sessionStore: {
          backend: useRedis ? 'redis' : 'memory',
          sessionKeys,
        },
        config,
        supabaseHealth,
        recentErrors,
        timestamp: new Date().toISOString(),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    const ms = Date.now() - startedAt
    return NextResponse.json(
      { ok: false, error: (error as Error).message, ms },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}


