import { NextRequest, NextResponse } from 'next/server'
import { sitemapSubmitter } from '@/lib/sitemap-submitter'

export async function POST(request: NextRequest) {
  try {
    // Check if this is an authorized request (you can add authentication here)
    const authHeader = request.headers.get('authorization')
    
    // For now, allow any POST request, but you can add proper authentication
    if (!authHeader) {
      console.warn('Sitemap submission request without authorization header')
    }

    // Submit sitemap to search engines
    const results = await sitemapSubmitter.submitToAll()
    
    const successCount = results.filter(r => r.success).length
    const totalCount = results.length

    // Log the submission
    console.log(`Sitemap submission API called: ${successCount}/${totalCount} successful`)

    return NextResponse.json({
      success: true,
      message: `Sitemap submitted to ${successCount}/${totalCount} search engines`,
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Sitemap submission API error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Failed to submit sitemap',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return sitemap submission status
    const status = sitemapSubmitter.getStatus()
    
    return NextResponse.json({
      success: true,
      status,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Sitemap status API error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Failed to get sitemap status',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
