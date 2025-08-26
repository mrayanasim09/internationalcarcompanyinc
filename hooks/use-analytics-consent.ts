import { useState, useEffect } from 'react'

export function useAnalyticsConsent() {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Check consent status on mount
    const consent = localStorage.getItem('icc-cookie-consent')
    if (consent === 'accepted' || consent === 'declined') {
      setHasConsent(consent === 'accepted')
    } else {
      setHasConsent(null) // No decision made yet
    }
    setIsLoading(false)
  }, [])

  const acceptAnalytics = () => {
    if (typeof window === 'undefined') return
    
    localStorage.setItem('icc-cookie-consent', 'accepted')
    localStorage.setItem('icc-cookie-date', new Date().toISOString())
    setHasConsent(true)
    
    // Dispatch event for analytics initialization
    window.dispatchEvent(new CustomEvent('icc-analytics-consent', { 
      detail: 'accepted' 
    }))
  }

  const declineAnalytics = () => {
    if (typeof window === 'undefined') return
    
    localStorage.setItem('icc-cookie-consent', 'declined')
    localStorage.setItem('icc-cookie-date', new Date().toISOString())
    setHasConsent(false)
    
    // Dispatch event to disable analytics
    window.dispatchEvent(new CustomEvent('icc-analytics-consent', { 
      detail: 'declined' 
    }))
  }

  const clearConsent = () => {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem('icc-cookie-consent')
    localStorage.removeItem('icc-cookie-date')
    setHasConsent(null)
  }

  return {
    hasConsent,
    isLoading,
    acceptAnalytics,
    declineAnalytics,
    clearConsent
  }
}
