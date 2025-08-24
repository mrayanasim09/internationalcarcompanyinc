/**
 * Sitemap Submission Utility
 * Automatically notifies search engines about sitemap updates
 */

interface SitemapSubmissionResult {
  success: boolean
  message: string
  timestamp: string
}

export class SitemapSubmitter {
  private static instance: SitemapSubmitter
  private lastSubmission: Date | null = null
  private submissionInterval = 24 * 60 * 60 * 1000 // 24 hours

  private constructor() {}

  public static getInstance(): SitemapSubmitter {
    if (!SitemapSubmitter.instance) {
      SitemapSubmitter.instance = new SitemapSubmitter()
    }
    return SitemapSubmitter.instance
  }

  /**
   * Submit sitemap to Google Search Console
   */
  public async submitToGoogle(): Promise<SitemapSubmissionResult> {
    try {
      // Check if we should submit (avoid too frequent submissions)
      if (this.lastSubmission && 
          Date.now() - this.lastSubmission.getTime() < this.submissionInterval) {
        return {
          success: true,
          message: 'Sitemap submission skipped - too recent',
          timestamp: new Date().toISOString()
        }
      }

      const sitemapUrl = 'https://internationalcarcompanyinc.com/sitemap.xml'
      
      // Method 1: Ping Google about sitemap update
      const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
      
      const response = await fetch(pingUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'InternationalCarCompanyInc-Bot/1.0'
        }
      })

      if (response.ok) {
        this.lastSubmission = new Date()
        
        // Log successful submission
        console.log('Sitemap successfully submitted to Google:', {
          timestamp: this.lastSubmission.toISOString(),
          sitemapUrl,
          responseStatus: response.status
        })

        return {
          success: true,
          message: 'Sitemap successfully submitted to Google',
          timestamp: this.lastSubmission.toISOString()
        }
      } else {
        throw new Error(`Google ping failed with status: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to submit sitemap to Google:', error)
      
      return {
        success: false,
        message: `Sitemap submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Submit sitemap to Bing Webmaster Tools
   */
  public async submitToBing(): Promise<SitemapSubmissionResult> {
    try {
      const sitemapUrl = 'https://internationalcarcompanyinc.com/sitemap.xml'
      const pingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
      
      const response = await fetch(pingUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'InternationalCarCompanyInc-Bot/1.0'
        }
      })

      if (response.ok) {
        console.log('Sitemap successfully submitted to Bing:', {
          timestamp: new Date().toISOString(),
          sitemapUrl,
          responseStatus: response.status
        })

        return {
          success: true,
          message: 'Sitemap successfully submitted to Bing',
          timestamp: new Date().toISOString()
        }
      } else {
        throw new Error(`Bing ping failed with status: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to submit sitemap to Bing:', error)
      
      return {
        success: false,
        message: `Bing submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Submit sitemap to multiple search engines
   */
  public async submitToAll(): Promise<SitemapSubmissionResult[]> {
    const results = await Promise.all([
      this.submitToGoogle(),
      this.submitToBing()
    ])

    // Log overall results
    const successCount = results.filter(r => r.success).length
    console.log(`Sitemap submission completed: ${successCount}/${results.length} successful`)

    return results
  }

  /**
   * Force immediate submission (bypasses time restrictions)
   */
  public async forceSubmit(): Promise<SitemapSubmissionResult[]> {
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
  } {
    const now = new Date()
    const canSubmit = !this.lastSubmission || 
                     (now.getTime() - this.lastSubmission.getTime()) >= this.submissionInterval
    
    const nextSubmissionTime = this.lastSubmission ? 
      new Date(this.lastSubmission.getTime() + this.submissionInterval) : null

    return {
      lastSubmission: this.lastSubmission,
      canSubmit,
      nextSubmissionTime
    }
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
    const results = await sitemapSubmitter.submitToAll()
    
    results.forEach(result => {
      if (result.success) {
        console.log(`✅ ${result.message}`)
      } else {
        console.warn(`⚠️ ${result.message}`)
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
