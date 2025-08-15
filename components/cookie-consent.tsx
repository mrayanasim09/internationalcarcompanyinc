"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Cookie, Info } from 'lucide-react'
import { useAnalyticsConsent } from '@/hooks/use-analytics-consent'
import Link from 'next/link'

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const { hasConsent, acceptAnalytics, declineAnalytics } = useAnalyticsConsent()

  useEffect(() => {
    // Only show if no consent decision has been made
    if (hasConsent === null) {
      setIsVisible(true)
    } else if (hasConsent === false) {
      // Check if we should show again after 30 days
      const consentDate = localStorage.getItem('icc-cookie-date')
      if (consentDate) {
        const declinedDate = new Date(consentDate)
        const now = new Date()
        const daysSinceDeclined = (now.getTime() - declinedDate.getTime()) / (1000 * 60 * 60 * 24)
        
        if (daysSinceDeclined >= 30) {
          setIsVisible(true)
        }
      }
    }
  }, [hasConsent])

  const handleAccept = () => {
    acceptAnalytics()
    setIsVisible(false)
  }

  const handleDecline = () => {
    declineAnalytics()
    setIsVisible(false)
  }

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
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1 text-xs text-primary hover:underline mt-2"
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
            >
              Accept All
            </Button>
            <Button
              onClick={handleDecline}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none text-xs px-4 py-3 border-border text-foreground hover:bg-accent touch-button"
            >
              Decline
            </Button>
            <Button
              onClick={handleDecline}
              variant="ghost"
              size="sm"
              className="p-3 text-muted-foreground hover:text-foreground touch-target"
              aria-label="Close cookie notice"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
