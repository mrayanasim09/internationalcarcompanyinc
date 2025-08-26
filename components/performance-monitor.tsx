"use client"

import { useEffect, useState, useCallback, useRef } from 'react'

interface PerformanceMetrics {
  fcp: number | null
  lcp: number | null
  cls: number | null
  fid: number | null
  ttfb: number | null
  bundleSize: number | null
  domSize: number | null
  resourceCount: number | null
}

interface PerformanceLog {
  timestamp: string
  metrics: PerformanceMetrics
  url: string
  userAgent: string
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    cls: null,
    fid: null,
    ttfb: null,
    bundleSize: null,
    domSize: null,
    resourceCount: null,
  })
  const [isVisible, setIsVisible] = useState(false)
  const [logs, setLogs] = useState<PerformanceLog[]>([])
  const observersRef = useRef<PerformanceObserver[]>([])

  const updateMetric = useCallback((key: keyof PerformanceMetrics, value: number) => {
    setMetrics(prev => ({ ...prev, [key]: value }))
  }, [])

  const logPerformance = useCallback((metrics: PerformanceMetrics) => {
    const log: PerformanceLog = {
      timestamp: new Date().toISOString(),
      metrics,
      url: window.location.href,
      userAgent: navigator.userAgent,
    }
    
    setLogs(prev => [...prev.slice(-9), log]) // Keep last 10 logs
    
    // Send to analytics if available
    if (window.gtag) {
      window.gtag('event', 'performance_metrics', {
        event_category: 'Performance',
        event_label: window.location.pathname,
        value: Math.round(metrics.lcp || 0),
        custom_parameters: {
          fcp: metrics.fcp,
          cls: metrics.cls,
          fid: metrics.fid,
          ttfb: metrics.ttfb,
          bundle_size: metrics.bundleSize,
          dom_size: metrics.domSize,
          resource_count: metrics.resourceCount,
        }
      })
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Metrics:', log)
    }
  }, [])

  const calculateBundleSize = useCallback(() => {
    try {
      if (!('performance' in window)) return
      
      // Calculate resource metrics
      const resourceCount = performance.getEntriesByType('resource').length
      const totalSize = performance.getEntriesByType('resource').reduce((total, resource) => {
        const resourceEntry = resource as PerformanceResourceTiming
        if (resourceEntry.transferSize && resourceEntry.transferSize > 0) {
          total += resourceEntry.transferSize
        }
        return total
      }, 0)
      
      updateMetric('bundleSize', Math.round(totalSize / 1024)) // Convert to KB
      updateMetric('resourceCount', resourceCount)
    } catch (error) {
      console.warn('Failed to calculate bundle size:', error)
    }
  }, [updateMetric])

  const calculateDOMSize = useCallback(() => {
    try {
      const domSize = document.documentElement.innerHTML.length
      updateMetric('domSize', Math.round(domSize / 1024)) // Convert to KB
    } catch (error) {
      console.warn('Failed to calculate DOM size:', error)
    }
  }, [updateMetric])

  const measureTTFB = useCallback(() => {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        updateMetric('ttfb', Math.round(navigation.responseStart - navigation.requestStart))
      }
    } catch (error) {
      console.warn('Failed to measure TTFB:', error)
    }
  }, [updateMetric])

  useEffect(() => {
    // Only show in development or when explicitly enabled
    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SHOW_PERFORMANCE === 'true') {
      setIsVisible(true)
    }

    // Set up performance observers
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
    } catch (error) {
      console.warn('Failed to set up performance observers:', error)
    }

    // Calculate initial metrics
    calculateBundleSize()
    calculateDOMSize()
    measureTTFB()

    // Set up periodic monitoring
    const interval = setInterval(() => {
      calculateBundleSize()
      calculateDOMSize()
      measureTTFB()
    }, 10000) // Every 10 seconds

    // Store current observers for cleanup
    const currentObservers = observersRef.current

    return () => {
      clearInterval(interval)
      currentObservers.forEach(observer => observer.disconnect())
    }
  }, [calculateBundleSize, calculateDOMSize, measureTTFB, updateMetric])

  // Log performance when metrics change
  useEffect(() => {
    if (Object.values(metrics).some(metric => metric !== null)) {
      logPerformance(metrics)
    }
  }, [metrics, logPerformance])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 bg-background border border-border rounded-lg p-4 shadow-lg max-w-sm z-50">
      <div className="text-sm font-semibold mb-2">Performance Monitor</div>
      <div className="space-y-1 text-xs">
        <div>FCP: {metrics.fcp ? `${metrics.fcp}ms` : 'N/A'}</div>
        <div>LCP: {metrics.lcp ? `${metrics.lcp}ms` : 'N/A'}</div>
        <div>CLS: {metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}</div>
        <div>FID: {metrics.fid ? `${metrics.fid}ms` : 'N/A'}</div>
        <div>TTFB: {metrics.ttfb ? `${metrics.ttfb}ms` : 'N/A'}</div>
        <div>Bundle: {metrics.bundleSize ? `${metrics.bundleSize}KB` : 'N/A'}</div>
        <div>DOM: {metrics.domSize ? `${metrics.domSize}KB` : 'N/A'}</div>
        <div>Resources: {metrics.resourceCount || 'N/A'}</div>
      </div>
      
      {logs.length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-muted-foreground">Recent Logs</summary>
          <div className="mt-2 max-h-32 overflow-y-auto text-xs">
            {logs.map((log, index) => (
              <div key={index} className="mb-1 p-1 bg-muted rounded">
                <div className="font-mono">{log.timestamp}</div>
                <div>LCP: {log.metrics.lcp}ms, CLS: {log.metrics.cls?.toFixed(3)}</div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
