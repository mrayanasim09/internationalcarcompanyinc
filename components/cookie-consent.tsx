"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Cookie, Info } from 'lucide-react'
import { useAnalyticsConsent } from '@/hooks/use-analytics-consent'
import Link from 'next/link'

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const { hasConsent, acceptAnalytics, declineAnalytics } = useAnalyticsConsent()

  const handleAccept = useCallback(() => {
    try {
      acceptAnalytics()
      setIsVisible(false)
    } catch (error) {
      console.warn('Failed to accept analytics:', error)
      setIsVisible(false)
    }
  }, [acceptAnalytics])

  const handleDecline = useCallback(() => {
    try {
      declineAnalytics()
      setIsVisible(false)
    } catch (error) {
      console.warn('Failed to decline analytics:', error)
      setIsVisible(false)
    }
  }, [declineAnalytics])

  const toggleDetails = useCallback(() => {
    setShowDetails(prev => !prev)
  }, [])

  useEffect(() => {
    // Do not show consent banner on admin routes
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
      setIsVisible(false)
      return
    }
    
    // Only show if no consent decision has been made
    if (hasConsent === null) {
      setIsVisible(true)
    } else {
      // User has already made a choice, don't show again
      setIsVisible(false)
    }
  }, [hasConsent])

  // Don't render anything if not visible
  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6">
          <div className="flex items-start gap-3 flex-1 min-w-0 pr-2">
            <Cookie className="h-6 w-6 text-primary mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1">
                International Car Company Inc Cookie Policy
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-normal break-words max-w-full">
                We use essential cookies for site functionality, analytics to improve your car browsing experience, 
                and marketing cookies to show relevant vehicle offers. Your data helps us provide better service.
              </p>
              
              {showDetails && (
                <div className="mt-3 p-3 bg-muted/50 rounded-md text-xs text-muted-foreground">
                  <div className="space-y-2">
                    <div>
                      <strong>Essential Cookies:</strong> Required for site functionality (always active)
                    </div>
                    <div>
                      <strong>Analytics Cookies:</strong> Help us understand how visitors use our site to improve performance
                    </div>
                    <div>
                      <strong>Marketing Cookies:</strong> Show relevant vehicle offers and promotions
                    </div>
                    <div className="pt-2">
                      <Link href="/privacy" className="text-primary hover:underline">
                        Read our full Privacy Policy
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                onClick={toggleDetails}
                className="flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                type="button"
              >
                <Info className="h-3 w-3" />
                {showDetails ? 'Hide details' : 'Show details'}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full lg:w-auto lg:ml-6 justify-end flex-none">
            <Button
              onClick={handleAccept}
              size="sm"
              className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-4 py-3 touch-button"
              type="button"
            >
              Accept All
            </Button>
            <Button
              onClick={handleDecline}
              size="sm"
              variant="outline"
              className="flex-1 sm:flex-none text-xs px-4 py-3 touch-button"
              type="button"
            >
              Decline
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
