import { NextRequest, NextResponse } from 'next/server'

interface PerformanceData {
  timestamp: string
  url: string
  userAgent: string
  metrics: {
    fcp?: number
    lcp?: number
    cls?: number
    fid?: number
    ttfb?: number
    loadTime?: number
    domSize?: number
    resourceCount?: number
  }
  errors?: string[]
  sessionId?: string
}

export async function POST(request: NextRequest) {
  try {
    const data: PerformanceData = await request.json()
    
    // Validate required fields
    if (!data.url || !data.timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Log performance data for monitoring
    console.log('Performance Data:', {
      url: data.url,
      timestamp: data.timestamp,
      fcp: data.metrics.fcp,
      lcp: data.metrics.lcp,
      cls: data.metrics.cls,
      errors: data.errors?.length || 0
    })

    // Store in database if needed (Supabase)
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        const { error } = await supabase
          .from('performance_metrics')
          .insert({
            url: data.url,
            timestamp: data.timestamp,
            user_agent: data.userAgent,
            fcp: data.metrics.fcp,
            lcp: data.metrics.lcp,
            cls: data.metrics.cls,
            fid: data.metrics.fid,
            ttfb: data.metrics.ttfb,
            load_time: data.metrics.loadTime,
            dom_size: data.metrics.domSize,
            resource_count: data.metrics.resourceCount,
            errors: data.errors,
            session_id: data.sessionId
          })

        if (error) {
          console.error('Failed to store performance data:', error)
        }
      } catch (dbError) {
        console.error('Database error:', dbError)
      }
    }

    // Return success
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Performance API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return performance metrics summary (for admin dashboard)
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )

      // Get recent performance data
      const { data, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100)

      if (error) {
        throw error
      }

      // Calculate averages
      const averages = data.reduce((acc, metric) => {
        if (metric.fcp) acc.fcp += metric.fcp
        if (metric.lcp) acc.lcp += metric.lcp
        if (metric.cls) acc.cls += metric.cls
        if (metric.fid) acc.fid += metric.fid
        if (metric.ttfb) acc.ttfb += metric.ttfb
        acc.count++
        return acc
      }, { fcp: 0, lcp: 0, cls: 0, fid: 0, ttfb: 0, count: 0 })

      if (averages.count > 0) {
        averages.fcp = Math.round(averages.fcp / averages.count)
        averages.lcp = Math.round(averages.lcp / averages.count)
        averages.cls = Math.round((averages.cls / averages.count) * 1000) / 1000
        averages.fid = Math.round(averages.fid / averages.count)
        averages.ttfb = Math.round(averages.ttfb / averages.count)
      }

      return NextResponse.json({
        recent: data.slice(0, 10),
        averages,
        total: data.length
      })
    }

    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  } catch (error) {
    console.error('Performance GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
