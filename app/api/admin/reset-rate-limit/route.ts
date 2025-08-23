import { NextRequest, NextResponse } from 'next/server'
import { rateLimiters } from '@/lib/security/rate-limiter'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, type = 'all' } = body

    if (!clientId) {
      return NextResponse.json({ 
        error: 'Client ID required' 
      }, { status: 400 })
    }

    let resetCount = 0

    if (type === 'all' || type === 'twoFA') {
      await rateLimiters.twoFA.resetLimit(clientId)
      resetCount++
    }

    if (type === 'all' || type === 'adminLogin') {
      await rateLimiters.adminLogin.resetLimit(clientId)
      resetCount++
    }

    return NextResponse.json({ 
      success: true, 
      message: `Reset ${resetCount} rate limit(s) for client: ${clientId}`,
      resetCount,
      clientId
    })

  } catch (error) {
    console.error('Rate limit reset error:', error)
    return NextResponse.json({ 
      error: 'Failed to reset rate limit' 
    }, { status: 500 })
  }
}
