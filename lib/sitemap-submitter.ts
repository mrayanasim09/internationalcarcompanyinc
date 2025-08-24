/**
 * Sitemap Submission Utility
 * Automatically notifies search engines about sitemap updates
 */

interface SitemapSubmissionResult {
  success: boolean
  message: string
  timestamp: string
  retryAfter?: number
  method?: string
}

export class SitemapSubmitter {
  private static instance: SitemapSubmitter
  private lastSubmission: Date | null = null
  private submissionInterval = 24 * 60 * 60 * 1000 // 24 hours
  private retryDelays = [5000, 30000, 300000] // 5s, 30s, 5min
  private maxRetries = 3

  private constructor() {}

  public static getInstance(): SitemapSubmitter {
    if (!SitemapSubmitter.instance) {
      SitemapSubmitter.instance = new SitemapSubmitter()
    }
    return SitemapSubmitter.instance
  }

  /**
   * Submit sitemap to Google Search Console with retry logic
   */
  public async submitToGoogle(): Promise<SitemapSubmissionResult> {
    try {
      // Check if we should submit (avoid too frequent submissions)
      if (this.lastSubmission && 
          Date.now() - this.lastSubmission.getTime() < this.submissionInterval) {
        return {
          success: true,
          message: 'Sitemap submission skipped - too recent',
          timestamp: new Date().toISOString(),
          method: 'rate_limited'
        }
      }

      const sitemapUrl = 'https://internationalcarcompanyinc.com/sitemap.xml'
      
      // Try multiple submission methods
      const methods = [
        this.pingGoogle,
        this.submitViaGoogleSearchConsole,
        this.submitViaGooglePing
      ]

      for (let attempt = 0; attempt < this.maxRetries; attempt++) {
        for (const method of methods) {
          try {
            const result = await method(sitemapUrl)
            if (result.success) {
              this.lastSubmission = new Date()
              return {
                ...result,
                timestamp: this.lastSubmission.toISOString(),
                method: method.name
              }
            }
          } catch (error) {
            console.warn(`Google submission method ${method.name} failed (attempt ${attempt + 1}):`, error)
            continue
          }
        }

        // Wait before retry if not the last attempt
        if (attempt < this.maxRetries - 1) {
          const delay = this.retryDelays[attempt] || 30000
          console.log(`Waiting ${delay}ms before retry ${attempt + 2}/${this.maxRetries}`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }

      // All methods failed
      return {
        success: false,
        message: 'All Google submission methods failed after retries',
        timestamp: new Date().toISOString(),
        method: 'all_failed',
        retryAfter: this.submissionInterval
      }

    } catch (error) {
      console.error('Failed to submit sitemap to Google:', error)
      
      return {
        success: false,
        message: `Google submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
        method: 'error',
        retryAfter: this.submissionInterval
      }
    }
  }

  /**
   * Method 1: Ping Google about sitemap update
   */
  private async pingGoogle(sitemapUrl: string): Promise<SitemapSubmissionResult> {
    const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
    
    const response = await fetch(pingUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })

    if (response.ok) {
      return {
        success: true,
        message: 'Sitemap successfully submitted to Google via ping',
        timestamp: new Date().toISOString(),
        method: 'ping'
      }
    } else if (response.status === 503) {
      // Service unavailable - might be rate limited
      const retryAfter = response.headers.get('Retry-After')
      const delay = retryAfter ? parseInt(retryAfter) * 1000 : 300000 // 5 minutes default
      
      return {
        success: false,
        message: `Google service temporarily unavailable (503). Retry after ${Math.round(delay / 1000)}s`,
        timestamp: new Date().toISOString(),
        method: 'ping',
        retryAfter: delay
      }
    } else {
      throw new Error(`Google ping failed with status: ${response.status}`)
    }
  }

  /**
   * Method 2: Alternative Google ping endpoint
   */
  private async submitViaGooglePing(sitemapUrl: string): Promise<SitemapSubmissionResult> {
    const pingUrl = `https://www.google.com/webmasters/sitemaps/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
    
    const response = await fetch(pingUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(10000)
    })

    if (response.ok) {
      return {
        success: true,
        message: 'Sitemap successfully submitted to Google via alternative ping',
        timestamp: new Date().toISOString(),
        method: 'alternative_ping'
      }
    } else {
      throw new Error(`Google alternative ping failed with status: ${response.status}`)
    }
  }

  /**
   * Method 3: Google Search Console API (placeholder for future implementation)
   */
  private async submitViaGoogleSearchConsole(_sitemapUrl: string): Promise<SitemapSubmissionResult> {
    // This would require Google Search Console API credentials
    // For now, return a placeholder that indicates this method is not available
    return {
      success: false,
      message: 'Google Search Console API not configured',
      timestamp: new Date().toISOString(),
      method: 'api_not_configured'
    }
  }

  /**
   * Submit sitemap to Bing Webmaster Tools with retry logic
   */
  public async submitToBing(): Promise<SitemapSubmissionResult> {
    try {
      const sitemapUrl = 'https://internationalcarcompanyinc.com/sitemap.xml'
      
      // Try multiple submission methods for Bing
      const methods = [
        this.pingBing,
        this.submitViaBingAlternative
      ]

      for (let attempt = 0; attempt < this.maxRetries; attempt++) {
        for (const method of methods) {
          try {
            const result = await method(sitemapUrl)
            if (result.success) {
              return {
                ...result,
                timestamp: new Date().toISOString(),
                method: method.name
              }
            }
          } catch (error) {
            console.warn(`Bing submission method ${method.name} failed (attempt ${attempt + 1}):`, error)
            continue
          }
        }

        // Wait before retry if not the last attempt
        if (attempt < this.maxRetries - 1) {
          const delay = this.retryDelays[attempt] || 30000
          console.log(`Waiting ${delay}ms before Bing retry ${attempt + 2}/${this.maxRetries}`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }

      // All methods failed
      return {
        success: false,
        message: 'All Bing submission methods failed after retries',
        timestamp: new Date().toISOString(),
        method: 'all_failed',
        retryAfter: this.submissionInterval
      }

    } catch (error) {
      console.error('Failed to submit sitemap to Bing:', error)
      
      return {
        success: false,
        message: `Bing submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
        method: 'error',
        retryAfter: this.submissionInterval
      }
    }
  }

  /**
   * Method 1: Ping Bing about sitemap update
   */
  private async pingBing(sitemapUrl: string): Promise<SitemapSubmissionResult> {
    const pingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
    
    const response = await fetch(pingUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bingbot.htm)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive'
      },
      signal: AbortSignal.timeout(10000)
    })

    if (response.ok) {
      return {
        success: true,
        message: 'Sitemap successfully submitted to Bing via ping',
        timestamp: new Date().toISOString(),
        method: 'ping'
      }
    } else if (response.status === 503) {
      // Service unavailable - might be rate limited
      const retryAfter = response.headers.get('Retry-After')
      const delay = retryAfter ? parseInt(retryAfter) * 1000 : 300000 // 5 minutes default
      
      return {
        success: false,
        message: `Bing service temporarily unavailable (503). Retry after ${Math.round(delay / 1000)}s`,
        timestamp: new Date().toISOString(),
        method: 'ping',
        retryAfter: delay
      }
    } else {
      throw new Error(`Bing ping failed with status: ${response.status}`)
    }
  }

  /**
   * Method 2: Alternative Bing submission
   */
  private async submitViaBingAlternative(sitemapUrl: string): Promise<SitemapSubmissionResult> {
    // Try alternative Bing endpoint
    const pingUrl = `https://www.bing.com/webmaster/ping.aspx?siteMap=${encodeURIComponent(sitemapUrl)}`
    
    const response = await fetch(pingUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bingbot.htm)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(10000)
    })

    if (response.ok) {
      return {
        success: true,
        message: 'Sitemap successfully submitted to Bing via alternative method',
        timestamp: new Date().toISOString(),
        method: 'alternative'
      }
    } else {
      throw new Error(`Bing alternative submission failed with status: ${response.status}`)
    }
  }

  /**
   * Submit sitemap to multiple search engines
   */
  public async submitToAll(): Promise<SitemapSubmissionResult[]> {
    console.log('Starting sitemap submission to all search engines...')
    
    const results = await Promise.all([
      this.submitToGoogle(),
      this.submitToBing()
    ])

    // Log overall results
    const successCount = results.filter(r => r.success).length
    const totalCount = results.length
    
    console.log(`Sitemap submission completed: ${successCount}/${totalCount} successful`)
    
    // Log detailed results
    results.forEach((result, index) => {
      const engine = index === 0 ? 'Google' : 'Bing'
      if (result.success) {
        console.log(`✅ ${engine}: ${result.message}`)
      } else {
        console.log(`❌ ${engine}: ${result.message}`)
        if (result.retryAfter) {
          console.log(`   ⏰ Retry after: ${Math.round(result.retryAfter / 1000)}s`)
        }
      }
    })

    return results
  }

  /**
   * Force immediate submission (bypasses time restrictions)
   */
  public async forceSubmit(): Promise<SitemapSubmissionResult[]> {
    console.log('Force submitting sitemap to all search engines...')
    this.lastSubmission = null
    return this.submitToAll()
  }

  /**
   * Get submission status
   */
  public getStatus(): {
    lastSubmission: Date | null
    canSubmit: boolean
    nextSubmissionTime: Date | null
    retryDelays: number[]
    maxRetries: number
  } {
    const now = new Date()
    const canSubmit = !this.lastSubmission || 
                     (now.getTime() - this.lastSubmission.getTime()) >= this.submissionInterval
    
    const nextSubmissionTime = this.lastSubmission ? 
      new Date(this.lastSubmission.getTime() + this.submissionInterval) : null

    return {
      lastSubmission: this.lastSubmission,
      canSubmit,
      nextSubmissionTime,
      retryDelays: this.retryDelays,
      maxRetries: this.maxRetries
    }
  }

  /**
   * Check if search engines are accessible
   */
  public async checkSearchEngineStatus(): Promise<{
    google: { accessible: boolean; status?: number; message?: string }
    bing: { accessible: boolean; status?: number; message?: string }
  }> {
    const results = {
      google: { accessible: false, status: undefined, message: undefined },
      bing: { accessible: false, status: undefined, message: undefined }
    }

    try {
      // Test Google
      const googleResponse = await fetch('https://www.google.com/ping?sitemap=https://example.com/sitemap.xml', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })
      results.google = {
        accessible: googleResponse.ok || googleResponse.status === 503,
        status: googleResponse.status,
        message: googleResponse.ok ? 'OK' : `Status: ${googleResponse.status}`
      }
    } catch (error) {
      results.google = {
        accessible: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    try {
      // Test Bing
      const bingResponse = await fetch('https://www.bing.com/ping?sitemap=https://example.com/sitemap.xml', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })
      results.bing = {
        accessible: bingResponse.ok || bingResponse.status === 503,
        status: bingResponse.status,
        message: bingResponse.ok ? 'OK' : `Status: ${bingResponse.status}`
      }
    } catch (error) {
      results.bing = {
        accessible: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    return results
  }
}

// Export singleton instance
export const sitemapSubmitter = SitemapSubmitter.getInstance()

/**
 * Utility function to submit sitemap when new content is added
 */
export async function submitSitemapForNewContent(): Promise<void> {
  try {
    console.log('Submitting sitemap for new content...')
    
    // Check search engine status first
    const status = await sitemapSubmitter.checkSearchEngineStatus()
    console.log('Search engine status:', status)
    
    const results = await sitemapSubmitter.submitToAll()
    
    results.forEach(result => {
      if (result.success) {
        console.log(`✅ ${result.message}`)
      } else {
        console.warn(`⚠️ ${result.message}`)
        if (result.retryAfter) {
          console.log(`   ⏰ Will retry after ${Math.round(result.retryAfter / 1000)}s`)
        }
      }
    })
  } catch (error) {
    console.error('Failed to submit sitemap for new content:', error)
  }
}

/**
 * Utility function to check sitemap submission status
 */
export function checkSitemapStatus(): void {
  const status = sitemapSubmitter.getStatus()
  console.log('Sitemap submission status:', status)
}
