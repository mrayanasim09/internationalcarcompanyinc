"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  RefreshCw,
  Download,
  AlertTriangle
} from 'lucide-react'

interface PerformanceMetrics {
  fcp: number | null
  lcp: number | null
  cls: number | null
  fid: number | null
  ttfb: number | null
  bundleSize: number | null
  domSize: number | null
  resourceCount: number | null
  cacheHitRate: number | null
}

interface PerformanceHistory {
  timestamp: number
  metrics: PerformanceMetrics
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    cls: null,
    fid: null,
    ttfb: null,
    bundleSize: null,
    domSize: null,
    resourceCount: null,
    cacheHitRate: null
  })
  const [history, setHistory] = useState<PerformanceHistory[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [alerts, setAlerts] = useState<string[]>([])

  // Get performance score color
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

  // Get performance score label
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

  // Calculate overall performance score
  const calculateOverallScore = (): number => {
    const scores = []
    
    // Add performance score calculation with production thresholds
    if (metrics.fcp !== null) {
      if (metrics.fcp <= 1800) scores.push(100)
      else if (metrics.fcp <= 3000) scores.push(70)
      else scores.push(40)
    }
    
    if (metrics.lcp !== null) {
      if (metrics.lcp <= 2500) scores.push(100)
      else if (metrics.lcp <= 4000) scores.push(70)
      else scores.push(40)
    }
    
    if (metrics.cls !== null) {
      if (metrics.cls <= 0.1) scores.push(100)
      else if (metrics.cls <= 0.25) scores.push(70)
      else scores.push(40)
    }
    
    if (metrics.fid !== null) {
      if (metrics.fid <= 100) scores.push(100)
      else if (metrics.fid <= 300) scores.push(70)
      else scores.push(40)
    }
    
    if (metrics.ttfb !== null) {
      if (metrics.ttfb <= 800) scores.push(100)
      else if (metrics.ttfb <= 1800) scores.push(70)
      else scores.push(40)
    }
    
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  }

  // Monitor performance metrics
  const monitorPerformance = useCallback(() => {
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

        // Calculate additional metrics
        if ('performance' in window) {
          const calculateAdditionalMetrics = () => {
            try {
              const resources = performance.getEntriesByType('resource')
              let totalSize = 0
              
              resources.forEach(resource => {
                if (resource.name.includes('.js')) {
                  if ('transferSize' in resource && typeof resource.transferSize === 'number' && resource.transferSize > 0) {
                    totalSize += resource.transferSize
                  }
                } else if (resource.name.includes('.css')) {
                  if ('transferSize' in resource && typeof resource.transferSize === 'number' && resource.transferSize > 0) {
                    totalSize += resource.transferSize
                  }
                }
              })
              
              setMetrics(prev => ({ 
                ...prev, 
                bundleSize: Math.round(totalSize / 1024), // Convert to KB
                resourceCount: resources.length,
                domSize: document.querySelectorAll('*').length
              }))
            } catch (error) {
              console.warn('Could not calculate additional metrics:', error)
            }
          }
          
          if (document.readyState === 'complete') {
            calculateAdditionalMetrics()
          } else {
            window.addEventListener('load', calculateAdditionalMetrics)
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

  // Check for performance issues and generate alerts
  const checkPerformanceIssues = useCallback(() => {
    const newAlerts: string[] = []
    
    if (metrics.fcp && metrics.fcp > 3000) {
      newAlerts.push('First Contentful Paint is too slow (>3s)')
    }
    
    if (metrics.lcp && metrics.lcp > 4000) {
      newAlerts.push('Largest Contentful Paint is too slow (>4s)')
    }
    
    if (metrics.cls && metrics.cls > 0.25) {
      newAlerts.push('Cumulative Layout Shift is too high (>0.25)')
    }
    
    if (metrics.fid && metrics.fid > 300) {
      newAlerts.push('First Input Delay is too high (>300ms)')
    }
    
    if (metrics.bundleSize && metrics.bundleSize > 500) {
      newAlerts.push('Bundle size is too large (>500KB)')
    }
    
    setAlerts(newAlerts)
  }, [metrics])

  // Save metrics to history
  const saveToHistory = useCallback(() => {
    if (typeof window === 'undefined') return
    
    const newEntry: PerformanceHistory = {
      timestamp: Date.now(),
      metrics: { ...metrics }
    }
    
    setHistory(prev => {
      const updated = [newEntry, ...prev.slice(0, 9)] // Keep last 10 entries
      localStorage.setItem('icc-performance-history', JSON.stringify(updated))
      return updated
    })
  }, [metrics])

  // Load history from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const saved = localStorage.getItem('icc-performance-history')
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to load performance history:', error)
      }
    }
  }, [])

  // Monitor performance on mount
  useEffect(() => {
    const cleanup = monitorPerformance()
    return cleanup
  }, [monitorPerformance])

  // Check for issues when metrics change
  useEffect(() => {
    checkPerformanceIssues()
  }, [metrics, checkPerformanceIssues])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(() => {
      monitorPerformance()
      saveToHistory()
    }, 30000) // Refresh every 30 seconds
    
    return () => clearInterval(interval)
  }, [autoRefresh, monitorPerformance, saveToHistory])

  // Show dashboard only in development or when explicitly enabled
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SHOW_PERFORMANCE === 'true') {
      setIsVisible(true)
    }
  }, [])

  if (!isVisible) return null

  const overallScore = calculateOverallScore()

  return (
    <div className="fixed bottom-4 left-4 z-50 w-80 max-h-96 overflow-y-auto bg-background border border-border rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Performance Dashboard
        </h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-primary text-primary-foreground' : ''}
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsVisible(false)}
          >
            ×
          </Button>
        </div>
      </div>

      {/* Overall Score */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Overall Performance Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-primary">{overallScore}</div>
            <div className="flex-1">
              <Progress value={overallScore} className="h-2" />
            </div>
            <Badge variant={overallScore >= 80 ? 'default' : overallScore >= 60 ? 'secondary' : 'destructive'}>
              {overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : 'Needs Work'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Core Web Vitals */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Core Web Vitals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs">FCP</span>
            <span className={`text-xs font-mono ${getScoreColor('fcp', metrics.fcp)}`}>
              {metrics.fcp ? `${metrics.fcp}ms` : 'N/A'}
            </span>
            <Badge variant="outline" className="text-xs">
              {getScoreLabel('fcp', metrics.fcp)}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs">LCP</span>
            <span className={`text-xs font-mono ${getScoreColor('lcp', metrics.lcp)}`}>
              {metrics.lcp ? `${metrics.lcp}ms` : 'N/A'}
            </span>
            <Badge variant="outline" className="text-xs">
              {getScoreLabel('lcp', metrics.lcp)}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs">CLS</span>
            <span className={`text-xs font-mono ${getScoreColor('cls', metrics.cls)}`}>
              {metrics.cls ? metrics.cls : 'N/A'}
            </span>
            <Badge variant="outline" className="text-xs">
              {getScoreLabel('cls', metrics.cls)}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs">FID</span>
            <span className={`text-xs font-mono ${getScoreColor('fid', metrics.fid)}`}>
              {metrics.fid ? `${metrics.fid}ms` : 'N/A'}
            </span>
            <Badge variant="outline" className="text-xs">
              {getScoreLabel('fid', metrics.fid)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Additional Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>TTFB:</span>
            <span className="font-mono">{metrics.ttfb ? `${metrics.ttfb}ms` : 'N/A'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Bundle:</span>
            <span className="font-mono">{metrics.bundleSize ? `${metrics.bundleSize}KB` : 'N/A'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Resources:</span>
            <span className="font-mono">{metrics.resourceCount || 'N/A'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>DOM Size:</span>
            <span className="font-mono">{metrics.domSize || 'N/A'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Performance Alerts */}
      {alerts.length > 0 && (
        <Card className="mb-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-800 dark:text-red-200 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Performance Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {alerts.map((alert, index) => (
                <li key={index} className="text-xs text-red-700 dark:text-red-300">
                  • {alert}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Performance History */}
      {history.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Recent History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {history.slice(0, 5).map((entry, index) => (
                <div key={index} className="text-xs border-l-2 border-primary pl-2">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-muted-foreground">
                      Score: {entry.metrics.fcp ? (entry.metrics.fcp <= 1800 ? 'Good' : entry.metrics.fcp <= 3000 ? 'Fair' : 'Poor') : 'N/A'}
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    FCP: {entry.metrics.fcp ? `${entry.metrics.fcp}ms` : 'N/A'} | 
                    LCP: {entry.metrics.lcp ? `${entry.metrics.lcp}ms` : 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            monitorPerformance()
            saveToHistory()
          }}
          className="flex-1"
        >
          <Download className="h-4 w-4 mr-1" />
          Refresh
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setHistory([])
            localStorage.removeItem('icc-performance-history')
          }}
          className="flex-1"
        >
          Clear History
        </Button>
      </div>
    </div>
  )
}
