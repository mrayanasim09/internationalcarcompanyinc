import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    
    // Enhanced logging for CSP violations
    if (process.env.NODE_ENV === 'development') {
      console.warn('[CSP-Report] Violation detected:', {
        timestamp: new Date().toISOString(),
        documentUri: body['document-uri'],
        violatedDirective: body['violated-directive'],
        blockedUri: body['blocked-uri'],
        sourceFile: body['source-file'],
        lineNumber: body['line-number'],
        columnNumber: body['column-number'],
        statusCode: body['status-code'],
        originalPolicy: body['original-policy']
      })
    } else {
      // In production, you might want to send this to a monitoring service
      console.warn('[CSP-Report] Production violation:', {
        documentUri: body['document-uri'],
        violatedDirective: body['violated-directive'],
        blockedUri: body['blocked-uri']
      })
    }
    
    return NextResponse.json({ 
      ok: true, 
      message: 'CSP violation reported',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[CSP-Report] Error processing report:', error)
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to process CSP report' 
    }, { status: 500 })
  }
}


