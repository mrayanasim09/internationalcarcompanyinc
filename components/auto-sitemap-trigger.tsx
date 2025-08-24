"use client"

import { useEffect, useRef, useState } from 'react'
import { submitSitemapForNewContent } from '@/lib/sitemap-submitter'

interface AutoSitemapTriggerProps {
  contentId?: string
  contentType?: 'car' | 'page' | 'article'
  forceSubmit?: boolean
  onSubmitted?: (success: boolean) => void
}

interface SitemapStatus {
  success: boolean
  message: string
  results: Array<{
    success: boolean
    message: string
    timestamp: string
    retryAfter?: number
    method?: string
  }>
  searchEngineStatus: {
    google: { accessible: boolean; status?: number; message?: string }
    bing: { accessible: boolean; status?: number; message?: string }
  }
  retryInfo?: Array<{
    engine: string
    retryAfter: number
    method: string
  }>
  recommendations?: string[]
  timestamp: string
}

interface SearchEngineHealth {
  google: { accessible: boolean; status?: number; message?: string }
  bing: { accessible: boolean; status?: number; message?: string }
}

export function AutoSitemapTrigger({
  contentId,
  contentType = 'page',
  forceSubmit = false,
  onSubmitted
}: AutoSitemapTriggerProps) {
  const hasSubmitted = useRef(false)
  const submitTimeout = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Only submit once per component mount
    if (hasSubmitted.current && !forceSubmit) {
      return
    }

    // Delay submission to ensure content is fully loaded
    submitTimeout.current = setTimeout(async () => {
      try {
        console.log(`Auto-triggering sitemap submission for ${contentType}:`, contentId)
        
        await submitSitemapForNewContent()
        hasSubmitted.current = true
        
        if (onSubmitted) {
          onSubmitted(true)
        }
        
        console.log('Sitemap submission completed successfully')
      } catch (error) {
        console.error('Failed to auto-submit sitemap:', error)
        
        // Check if it's a 503 error (service unavailable)
        if (error instanceof Error && error.message.includes('503')) {
          console.warn('Search engines are temporarily unavailable. This is normal and will resolve automatically.')
          // Still mark as submitted to avoid repeated attempts
          hasSubmitted.current = true
          if (onSubmitted) {
            onSubmitted(true) // Consider 503 as "handled" not "failed"
          }
        } else {
          if (onSubmitted) {
            onSubmitted(false)
          }
        }
      }
    }, 2000) // 2 second delay

    return () => {
      if (submitTimeout.current) {
        clearTimeout(submitTimeout.current)
      }
    }
  }, [contentId, contentType, forceSubmit, onSubmitted])

  // This component doesn't render anything visible
  return null
}

/**
 * Hook to manually trigger sitemap submission
 */
export function useSitemapSubmission() {
  const submitSitemap = async (force = false) => {
    try {
      if (force) {
        // Force immediate submission
        const { sitemapSubmitter } = await import('@/lib/sitemap-submitter')
        await sitemapSubmitter.forceSubmit()
      } else {
        await submitSitemapForNewContent()
      }
      return true
    } catch (error) {
      console.error('Manual sitemap submission failed:', error)
      
      // Check if it's a 503 error
      if (error instanceof Error && error.message.includes('503')) {
        console.warn('Search engines are temporarily unavailable. This is normal and will resolve automatically.')
        return true // Consider 503 as "handled" not "failed"
      }
      
      return false
    }
  }

  const checkStatus = async (): Promise<SitemapStatus | null> => {
    try {
      const response = await fetch('/api/sitemap-submit')
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Failed to check sitemap status:', error)
      return null
    }
  }

  const checkSearchEngineHealth = async (): Promise<SearchEngineHealth | null> => {
    try {
      const response = await fetch('/api/sitemap-submit')
      const data = await response.json()
      return data.searchEngineStatus || null
    } catch (error) {
      console.error('Failed to check search engine health:', error)
      return null
    }
  }

  return {
    submitSitemap,
    checkStatus,
    checkSearchEngineHealth
  }
}

/**
 * Component for admin pages to manually trigger sitemap submission
 */
export function ManualSitemapSubmitter() {
  const { submitSitemap, checkStatus, checkSearchEngineHealth } = useSitemapSubmission()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastStatus, setLastStatus] = useState<SitemapStatus | null>(null)
  const [searchEngineHealth, setSearchEngineHealth] = useState<SearchEngineHealth | null>(null)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const success = await submitSitemap(true) // Force submission
      if (success) {
        // Check status after submission
        const status = await checkStatus()
        setLastStatus(status)
        
        // Also check search engine health
        const health = await checkSearchEngineHealth()
        setSearchEngineHealth(health)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCheckStatus = async () => {
    const status = await checkStatus()
    setLastStatus(status)
    
    // Also check search engine health
    const health = await checkSearchEngineHealth()
    setSearchEngineHealth(health)
  }

  const getStatusColor = (success: boolean) => {
    return success ? 'text-green-600' : 'text-red-600'
  }

  const getStatusIcon = (success: boolean) => {
    return success ? '✅' : '❌'
  }

  return (
    <div className="p-4 border rounded-lg bg-background">
      <h3 className="text-lg font-semibold mb-4">Sitemap Management</h3>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Sitemap Now'}
          </button>
          
          <button
            onClick={handleCheckStatus}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Check Status
          </button>
        </div>

        {/* Search Engine Health Status */}
        {searchEngineHealth && (
          <div className="p-3 bg-gray-50 rounded border">
            <h4 className="font-medium mb-2">Search Engine Health:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span>Google:</span>
                <span className={getStatusColor(searchEngineHealth.google?.accessible)}>
                  {getStatusIcon(searchEngineHealth.google?.accessible)} 
                  {searchEngineHealth.google?.accessible ? 'Accessible' : 'Unavailable'}
                </span>
                {searchEngineHealth.google?.status && (
                  <span className="text-gray-500">(Status: {searchEngineHealth.google.status})</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span>Bing:</span>
                <span className={getStatusColor(searchEngineHealth.bing?.accessible)}>
                  {getStatusIcon(searchEngineHealth.bing?.accessible)} 
                  {searchEngineHealth.bing?.accessible ? 'Accessible' : 'Unavailable'}
                </span>
                {searchEngineHealth.bing?.status && (
                  <span className="text-gray-500">(Status: {searchEngineHealth.bing.status})</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Last Status */}
        {lastStatus && (
          <div className="text-sm">
            <h4 className="font-medium mb-2">Last Submission Status:</h4>
            <div className="space-y-2">
              <div className={`font-medium ${getStatusColor(lastStatus.success)}`}>
                {getStatusIcon(lastStatus.success)} {lastStatus.message}
              </div>
              
              {lastStatus.retryInfo && lastStatus.retryInfo.length > 0 && (
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="font-medium text-yellow-800">Retry Information:</div>
                  {lastStatus.retryInfo.map((info, index) => (
                    <div key={index} className="text-yellow-700">
                      {info.engine}: Retry after {Math.round(info.retryAfter / 1000)}s
                    </div>
                  ))}
                </div>
              )}
              
              {lastStatus.recommendations && lastStatus.recommendations.length > 0 && (
                <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                  <div className="font-medium text-blue-800">Recommendations:</div>
                  <ul className="list-disc list-inside text-blue-700">
                    {lastStatus.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <details className="bg-gray-100 p-2 rounded">
                <summary className="cursor-pointer text-gray-700">Raw Response</summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {JSON.stringify(lastStatus, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
