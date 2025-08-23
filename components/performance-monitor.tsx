"use client"

import { useEffect, useState, useCallback, useRef } from 'react'

interface PerformanceMetrics {
  fcp: number | null
  lcp: number | null
  cls: number | null
  fid: number | null
  ttfb: number | null
  bundleSize: number | null
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    cls: null,
    fid: null,
    ttfb: null,
    bundleSize: null,
  })
  const [isVisible, setIsVisible] = useState(false)
  const observersRef = useRef<PerformanceObserver[]>([])

  const updateMetric = useCallback((key: keyof PerformanceMetrics, value: number) => {
    setMetrics(prev => ({ ...prev, [key]: value }))
  }, [])

  const calculateBundleSize = useCallback(() => {
    try {
      if (!('performance' in window)) return
      
      const resources = performance.getEntriesByType('resource')
      let totalSize = 0
      
      for (const resource of resources) {
        if (resource.transferSize) {
          totalSize += resource.transferSize
        }
      }
      
      updateMetric('bundleSize', Math.round(totalSize / 1024)) // Convert to KB
    } catch (error) {
      console.warn('Failed to calculate bundle size:', error)
    }
  }, [updateMetric])

  useEffect(() => {
    // Only show in development or when explicitly enabled
    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SHOW_PERFORMANCE === 'true') {
      setIsVisible(true)
    }

    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        // First Contentful Paint
        const fcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
              updateMetric('fcp', Math.round(entry.startTime))
            }
          }
        })
        fcpObserver.observe({ entryTypes: ['paint'] })
        observersRef.current.push(fcpObserver)

        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
              updateMetric('lcp', Math.round(entry.startTime))
            }
          }
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        observersRef.current.push(lcpObserver)

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
          updateMetric('cls', Math.round(clsValue * 1000) / 1000)
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        observersRef.current.push(clsObserver)

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'first-input') {
              const fidEntry = entry as PerformanceEventTiming
              updateMetric('fid', Math.round(fidEntry.processingStart - fidEntry.startTime))
            }
          }
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
        observersRef.current.push(fidObserver)

        // Time to First Byte
        const navigationObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming
              updateMetric('ttfb', Math.round(navEntry.responseStart - navEntry.requestStart))
            }
          }
        })
        navigationObserver.observe({ entryTypes: ['navigation'] })
        observersRef.current.push(navigationObserver)

        // Calculate initial bundle size
        calculateBundleSize()

        // Recalculate bundle size after a delay to ensure all resources are loaded
        const timeoutId = setTimeout(calculateBundleSize, 2000)

        return () => {
          clearTimeout(timeoutId)
          // Disconnect all observers
          observersRef.current.forEach(observer => observer.disconnect())
          observersRef.current = []
        }
      } catch (error) {
        console.warn('Failed to set up performance monitoring:', error)
      }
    }
  }, [updateMetric, calculateBundleSize])

  // Don't render anything if not visible
  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed top-4 left-4 z-50 bg-background/90 backdrop-blur border border-border rounded-lg shadow-lg p-4 max-w-xs">
      <h3 className="text-sm font-semibold text-foreground mb-3">Performance Metrics</h3>
      <div className="space-y-2 text-xs">
        {metrics.fcp && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">FCP:</span>
            <span className="font-mono">{metrics.fcp}ms</span>
          </div>
        )}
        {metrics.lcp && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">LCP:</span>
            <span className="font-mono">{metrics.lcp}ms</span>
          </div>
        )}
        {metrics.cls && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">CLS:</span>
            <span className="font-mono">{metrics.cls}</span>
          </div>
        )}
        {metrics.fid && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">FID:</span>
            <span className="font-mono">{metrics.fid}ms</span>
          </div>
        )}
        {metrics.ttfb && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">TTFB:</span>
            <span className="font-mono">{metrics.ttfb}ms</span>
          </div>
        )}
        {metrics.bundleSize && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bundle:</span>
            <span className="font-mono">{metrics.bundleSize}KB</span>
          </div>
        )}
      </div>
    </div>
  )
}
