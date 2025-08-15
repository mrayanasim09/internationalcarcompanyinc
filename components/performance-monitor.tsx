"use client"

import { useEffect, useState } from 'react'

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
              setMetrics(prev => ({ ...prev, fcp: Math.round(entry.startTime) }))
            }
          }
        })
        fcpObserver.observe({ entryTypes: ['paint'] })

        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
              setMetrics(prev => ({ ...prev, lcp: Math.round(entry.startTime) }))
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
          setMetrics(prev => ({ ...prev, cls: Math.round(clsValue * 1000) / 1000 }))
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'first-input') {
              const fidEntry = entry as PerformanceEventTiming
              setMetrics(prev => ({ ...prev, fid: Math.round(fidEntry.processingStart - fidEntry.startTime) }))
            }
          }
        })
        fidObserver.observe({ entryTypes: ['first-input'] })

        // Time to First Byte
        const navigationObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming
              setMetrics(prev => ({ 
                ...prev, 
                ttfb: Math.round(navEntry.responseStart - navEntry.requestStart) 
              }))
            }
          }
        })
        navigationObserver.observe({ entryTypes: ['navigation'] })

        // Monitor bundle sizes
        if ('performance' in window) {
          const calculateBundleSize = () => {
            try {
              const resources = performance.getEntriesByType('resource')
              let totalSize = 0
              
              resources.forEach(resource => {
                if (resource.name.includes('.js') || resource.name.includes('.css')) {
                  // Estimate size based on transfer size or duration
                  if ('transferSize' in resource && typeof resource.transferSize === 'number' && resource.transferSize > 0) {
                    totalSize += resource.transferSize
                  } else if ('duration' in resource && typeof resource.duration === 'number' && resource.duration > 0) {
                    // Rough estimate: 1ms ≈ 1KB
                    totalSize += Math.round(resource.duration)
                  }
                }
              })
              
              setMetrics(prev => ({ 
                ...prev, 
                bundleSize: Math.round(totalSize / 1024) // Convert to KB
              }))
            } catch (error) {
              console.warn('Could not calculate bundle size:', error)
            }
          }
          
          // Calculate bundle size after page load
          if (document.readyState === 'complete') {
            calculateBundleSize()
          } else {
            window.addEventListener('load', calculateBundleSize)
          }
        }

        // Cleanup
        return () => {
          fcpObserver.disconnect()
          lcpObserver.disconnect()
          clsObserver.disconnect()
          fidObserver.disconnect()
          navigationObserver.disconnect()
        }
      } catch (error) {
        console.warn('Performance monitoring not supported:', error)
      }
    }
  }, [])

  if (!isVisible) return null

  const getScoreColor = (metric: keyof PerformanceMetrics, value: number | null) => {
    if (value === null) return 'text-gray-400'
    
    const thresholds: Record<string, { good: number; needsImprovement: number }> = {
      fcp: { good: 1800, needsImprovement: 3000 },
      lcp: { good: 2500, needsImprovement: 4000 },
      cls: { good: 0.1, needsImprovement: 0.25 },
      fid: { good: 100, needsImprovement: 300 },
      ttfb: { good: 800, needsImprovement: 1800 },
    }

    const threshold = thresholds[metric]
    if (!threshold) return 'text-gray-400'

    if (value <= threshold.good) return 'text-green-500'
    if (value <= threshold.needsImprovement) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getScoreLabel = (metric: keyof PerformanceMetrics, value: number | null) => {
    if (value === null) return 'N/A'
    
    const thresholds: Record<string, { good: number; needsImprovement: number }> = {
      fcp: { good: 1800, needsImprovement: 3000 },
      lcp: { good: 2500, needsImprovement: 4000 },
      cls: { good: 0.1, needsImprovement: 0.25 },
      fid: { good: 100, needsImprovement: 300 },
      ttfb: { good: 800, needsImprovement: 1800 },
    }

    const threshold = thresholds[metric]
    if (!threshold) return 'N/A'

    if (value <= threshold.good) return 'Good'
    if (value <= threshold.needsImprovement) return 'Needs Improvement'
    return 'Poor'
  }

  return (
    <div className="performance-monitor show">
      <div className="text-xs font-mono">
        <div className="font-bold mb-2">Performance Monitor</div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>FCP:</span>
            <span className={getScoreColor('fcp', metrics.fcp)}>
              {metrics.fcp ? `${metrics.fcp}ms` : 'N/A'}
            </span>
            <span className="text-xs text-gray-400">
              {metrics.fcp ? getScoreLabel('fcp', metrics.fcp) : ''}
            </span>
          </div>
          <div className="flex justify-between">
            <span>LCP:</span>
            <span className={getScoreColor('lcp', metrics.lcp)}>
              {metrics.lcp ? `${metrics.lcp}ms` : 'N/A'}
            </span>
            <span className="text-xs text-gray-400">
              {metrics.lcp ? getScoreLabel('lcp', metrics.lcp) : ''}
            </span>
          </div>
          <div className="flex justify-between">
            <span>CLS:</span>
            <span className={getScoreColor('cls', metrics.cls)}>
              {metrics.cls ? metrics.cls : 'N/A'}
            </span>
            <span className="text-xs text-gray-400">
              {metrics.cls ? getScoreLabel('cls', metrics.cls) : ''}
            </span>
          </div>
          <div className="flex justify-between">
            <span>FID:</span>
            <span className={getScoreColor('fid', metrics.fid)}>
              {metrics.fid ? `${metrics.fid}ms` : 'N/A'}
            </span>
            <span className="text-xs text-gray-400">
              {metrics.fid ? getScoreLabel('fid', metrics.fid) : ''}
            </span>
          </div>
          <div className="flex justify-between">
            <span>TTFB:</span>
            <span className={getScoreColor('ttfb', metrics.ttfb)}>
              {metrics.ttfb ? `${metrics.ttfb}ms` : 'N/A'}
            </span>
            <span className="text-xs text-gray-400">
              {metrics.ttfb ? getScoreLabel('ttfb', metrics.ttfb) : ''}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Bundle:</span>
            <span className={metrics.bundleSize && metrics.bundleSize > 500 ? 'text-red-500' : metrics.bundleSize && metrics.bundleSize > 250 ? 'text-yellow-500' : 'text-green-500'}>
              {metrics.bundleSize ? `${metrics.bundleSize}KB` : 'N/A'}
            </span>
            <span className="text-xs text-gray-400">
              {metrics.bundleSize ? (metrics.bundleSize > 500 ? 'Large' : metrics.bundleSize > 250 ? 'Medium' : 'Good') : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
