"use client"

import { useEffect, useRef, useState } from 'react'
import { submitSitemapForNewContent } from '@/lib/sitemap-submitter'

interface AutoSitemapTriggerProps {
  contentId?: string
  contentType?: 'car' | 'page' | 'article'
  forceSubmit?: boolean
  onSubmitted?: (success: boolean) => void
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
        
        if (onSubmitted) {
          onSubmitted(false)
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
      return false
    }
  }

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/sitemap-submit')
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Failed to check sitemap status:', error)
      return null
    }
  }

  return {
    submitSitemap,
    checkStatus
  }
}

/**
 * Component for admin pages to manually trigger sitemap submission
 */
export function ManualSitemapSubmitter() {
  const { submitSitemap, checkStatus } = useSitemapSubmission()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastStatus, setLastStatus] = useState<any>(null)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const success = await submitSitemap(true) // Force submission
      if (success) {
        // Check status after submission
        const status = await checkStatus()
        setLastStatus(status)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCheckStatus = async () => {
    const status = await checkStatus()
    setLastStatus(status)
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

        {lastStatus && (
          <div className="text-sm">
            <h4 className="font-medium">Last Status:</h4>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(lastStatus, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
