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

    // Check search engine status first
    console.log('Checking search engine status before submission...')
    const status = await sitemapSubmitter.checkSearchEngineStatus()
    console.log('Search engine status:', status)

    // Submit sitemap to search engines
    const results = await sitemapSubmitter.submitToAll()
    
    const successCount = results.filter(r => r.success).length
    const totalCount = results.length

    // Log the submission
    console.log(`Sitemap submission API called: ${successCount}/${totalCount} successful`)

    // Check if we have any retry information
    const retryInfo = results
      .filter(r => r.retryAfter)
      .map(r => ({
        engine: r.message.includes('Google') ? 'Google' : 'Bing',
        retryAfter: r.retryAfter,
        method: r.method
      }))

    return NextResponse.json({
      success: successCount > 0,
      message: successCount > 0 
        ? `Sitemap submitted to ${successCount}/${totalCount} search engines`
        : `Sitemap submission failed for all search engines`,
      results,
      searchEngineStatus: status,
      retryInfo,
      timestamp: new Date().toISOString(),
      recommendations: successCount === 0 ? [
        'Search engines may be temporarily unavailable',
        'Try again in a few minutes',
        'Check if your server IP is rate limited',
        'Consider using Google Search Console directly'
      ] : []
    })

  } catch (error) {
    console.error('Sitemap submission API error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Failed to submit sitemap',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      recommendations: [
        'Check server logs for detailed error information',
        'Verify search engine endpoints are accessible',
        'Check network connectivity and firewall settings'
      ]
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Return sitemap submission status
    const status = sitemapSubmitter.getStatus()
    
    // Also check current search engine status
    const searchEngineStatus = await sitemapSubmitter.checkSearchEngineStatus()
    
    return NextResponse.json({
      success: true,
      status,
      searchEngineStatus,
      timestamp: new Date().toISOString(),
      health: {
        canSubmit: status.canSubmit,
        searchEnginesAccessible: searchEngineStatus.google.accessible || searchEngineStatus.bing.accessible,
        lastSubmission: status.lastSubmission,
        nextSubmissionTime: status.nextSubmissionTime
      }
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
