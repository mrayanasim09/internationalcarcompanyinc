"use client"

import { useEffect, useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

interface AnalyticsProviderProps {
  children: React.ReactNode
  gaId?: string
}

export function AnalyticsProvider({ children, gaId }: AnalyticsProviderProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Initialize Google Analytics
  const initializeGA = useCallback(() => {
    if (!gaId || typeof window === 'undefined') return

    // Load Google Analytics script
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
    script.async = true
    document.head.appendChild(script)

    // Initialize gtag
    window.dataLayer = window.dataLayer || []
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args)
    }
    gtag('js', new Date())
    gtag('config', gaId, {
      page_title: document.title,
      page_location: window.location.href,
      send_page_view: false // We'll handle this manually
    })

    // Make gtag available globally
    ;(window as { gtag: typeof gtag }).gtag = gtag
  }, [gaId])

  // Track page views
  const trackPageView = useCallback((url: string) => {
    if (typeof window === 'undefined' || !(window as { gtag: unknown }).gtag) return

    const gtag = (window as { gtag: unknown }).gtag as typeof gtag
    gtag('config', gaId, {
      page_title: document.title,
      page_location: url,
      send_page_view: true
    })

    // Track custom event
    gtag('event', 'page_view', {
      page_title: document.title,
      page_location: url,
      page_referrer: document.referrer
    })
  }, [gaId])

  // Track custom events
  const trackEvent = useCallback((action: string, category: string, label?: string, value?: number) => {
    if (typeof window === 'undefined' || !(window as { gtag: unknown }).gtag) return

    const gtag = (window as { gtag: unknown }).gtag as typeof gtag
    gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    })
  }, [])

  // Track errors
  const trackError = useCallback((error: Error, errorInfo?: Record<string, unknown>) => {
    if (typeof window === 'undefined' || !(window as { gtag: unknown }).gtag) return

    const gtag = (window as { gtag: unknown }).gtag as typeof gtag
    gtag('event', 'exception', {
      description: error.message,
      fatal: false,
      custom_map: {
        error_name: error.name,
        error_stack: error.stack,
        error_info: errorInfo
      }
    })
  }, [])

  // Track performance metrics
  const trackPerformance = useCallback(() => {
    if (typeof window === 'undefined' || !(window as { gtag: unknown }).gtag) return

    const gtag = (window as { gtag: unknown }).gtag as typeof gtag
    
    // Track Core Web Vitals
    if ('PerformanceObserver' in window) {
      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
            gtag('event', 'timing_complete', {
              name: 'fcp',
              value: Math.round(entry.startTime)
            })
          }
        }
      })
      fcpObserver.observe({ entryTypes: ['paint'] })

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            gtag('event', 'timing_complete', {
              name: 'lcp',
              value: Math.round(entry.startTime)
            })
          }
        }
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift') {
            const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number }
            if (!layoutShiftEntry.hadRecentInput && layoutShiftEntry.value) {
              clsValue += layoutShiftEntry.value
            }
          }
        }
        gtag('event', 'timing_complete', {
          name: 'cls',
          value: Math.round(clsValue * 1000)
        })
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    }
  }, [])

  // Initialize analytics on mount
  useEffect(() => {
    initializeGA()
    trackPerformance()
  }, [initializeGA, trackPerformance])

  // Track page views on route changes
  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    trackPageView(url)
  }, [pathname, searchParams, trackPageView])

  // Make tracking functions available globally for error boundaries
  useEffect(() => {
    if (typeof window !== 'undefined') {
      ;(window as { trackEvent: typeof trackEvent; trackError: typeof trackError }).trackEvent = trackEvent
      ;(window as { trackEvent: typeof trackEvent; trackError: typeof trackError }).trackError = trackError
    }
  }, [trackEvent, trackError])

  return <>{children}</>
}
