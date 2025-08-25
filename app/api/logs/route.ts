import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/config/debug'
import { getAdminAuthFromRequest } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const admin = await getAdminAuthFromRequest(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    if (!admin.permissions.canAccessLogs) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '100')
    const clear = searchParams.get('clear') === 'true'

    let logs: any[] = []

    if (clear) {
      logger.clearLogs()
      logs = []
    } else if (level) {
      logs = logger.getLogsByLevel(level as any)
    } else if (category) {
      logs = logger.getLogsByCategory(category)
    } else {
      logs = logger.getRecentLogs(limit)
    }

    return NextResponse.json({
      success: true,
      logs,
      count: logs.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Logs API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const admin = await getAdminAuthFromRequest(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    if (!admin.permissions.canAccessLogs) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { level, category, message, data, error } = body

    if (!level || !category || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: level, category, message' },
        { status: 400 }
      )
    }

    // Log the message
    logger.log(level, category, message, data, error, {
      userId: admin.userId,
      url: request.url,
      userAgent: request.headers.get('user-agent'),
    })

    return NextResponse.json({
      success: true,
      message: 'Log entry created',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Logs API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
