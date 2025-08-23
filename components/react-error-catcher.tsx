"use client"

import React, { useEffect, useState } from 'react'
import { AlertTriangle, RefreshCw, Bug, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ReactError {
  id: string
  timestamp: Date
  error: string
  errorCode: string
  stack?: string
  componentStack?: string
}

export function ReactErrorCatcher() {
  const [errors, setErrors] = useState<ReactError[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [errorCounts, setErrorCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!isMonitoring) return

    const originalError = console.error
    const originalWarn = console.warn

    // Catch React errors
    console.error = (...args) => {
      const message = args.join(' ')
      
      // Check for React minified errors
      const reactErrorMatch = message.match(/Minified React error #(\d+)/)
      if (reactErrorMatch) {
        const errorCode = reactErrorMatch[1]
        const error: ReactError = {
          id: Date.now().toString(),
          timestamp: new Date(),
          error: message,
          errorCode,
          stack: new Error().stack
        }
        
        setErrors(prev => [...prev, error])
        setErrorCounts(prev => ({
          ...prev,
          [errorCode]: (prev[errorCode] || 0) + 1
        }))
      }
      
      originalError.apply(console, args)
    }

    // Catch React warnings
    console.warn = (...args) => {
      const message = args.join(' ')
      
      if (message.includes('React') || message.includes('component') || message.includes('hook')) {
        const error: ReactError = {
          id: Date.now().toString(),
          timestamp: new Date(),
          error: message,
          errorCode: 'WARNING',
          stack: new Error().stack
        }
        
        setErrors(prev => [...prev, error])
        setErrorCounts(prev => ({
          ...prev,
          WARNING: (prev.WARNING || 0) + 1
        }))
      }
      
      originalWarn.apply(console, args)
    }

    // Catch unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error: ReactError = {
        id: Date.now().toString(),
        timestamp: new Date(),
        error: `Unhandled Promise Rejection: ${event.reason}`,
        errorCode: 'PROMISE_REJECTION',
        stack: new Error().stack
      }
      
      setErrors(prev => [...prev, error])
      setErrorCounts(prev => ({
        ...prev,
        PROMISE_REJECTION: (prev.PROMISE_REJECTION || 0) + 1
      }))
    }

    // Catch unhandled errors
    const handleError = (event: ErrorEvent) => {
      const error: ReactError = {
        id: Date.now().toString(),
        timestamp: new Date(),
        error: `Unhandled Error: ${event.error?.message || event.message}`,
        errorCode: 'UNHANDLED_ERROR',
        stack: event.error?.stack || new Error().stack
      }
      
      setErrors(prev => [...prev, error])
      setErrorCounts(prev => ({
        ...prev,
        UNHANDLED_ERROR: (prev.UNHANDLED_ERROR || 0) + 1
      }))
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    return () => {
      console.error = originalError
      console.warn = originalWarn
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [isMonitoring])

  const startMonitoring = () => {
    setIsMonitoring(true)
    setErrors([])
    setErrorCounts({})
  }

  const stopMonitoring = () => {
    setIsMonitoring(false)
  }

  const clearErrors = () => {
    setErrors([])
    setErrorCounts({})
  }

  const getErrorDescription = (errorCode: string) => {
    const descriptions: Record<string, string> = {
      '418': 'React Hook Error - Invalid hook usage or component state issue',
      '423': 'React Component Error - Component lifecycle or rendering problem',
      '425': 'React Hook Error - Hook called outside of component or invalid context',
      'WARNING': 'React Warning - Component behavior or performance issue',
      'PROMISE_REJECTION': 'Unhandled Promise Rejection - Async operation failed',
      'UNHANDLED_ERROR': 'Unhandled JavaScript Error - Runtime error occurred'
    }
    return descriptions[errorCode] || 'Unknown React Error'
  }

  const getErrorSeverity = (errorCode: string) => {
    if (['418', '423', '425'].includes(errorCode)) return 'destructive'
    if (errorCode === 'WARNING') return 'secondary'
    return 'default'
  }

  // Only show in development or when there are errors
  if (process.env.NODE_ENV === 'production' && errors.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bug className="w-4 h-4" />
            React Error Monitor
            {isMonitoring && (
              <Badge variant="default" className="text-xs">
                Active
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Error Counts */}
          {Object.keys(errorCounts).length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Error Counts:</div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(errorCounts).map(([code, count]) => (
                  <Badge key={code} variant={getErrorSeverity(code)} className="text-xs">
                    {code}: {count}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={startMonitoring} 
              disabled={isMonitoring}
              className="flex-1 text-xs"
            >
              Start
            </Button>
            <Button 
              size="sm" 
              onClick={stopMonitoring} 
              disabled={!isMonitoring} 
              variant="outline"
              className="flex-1 text-xs"
            >
              Stop
            </Button>
            <Button 
              size="sm" 
              onClick={clearErrors} 
              variant="outline"
              className="text-xs"
            >
              Clear
            </Button>
          </div>

          {/* Recent Errors */}
          {errors.length > 0 && (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground mb-2">
                Recent Errors ({errors.length})
              </summary>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {errors.slice(-3).map((error) => (
                  <div key={error.id} className="p-2 bg-muted rounded border-l-2 border-destructive">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getErrorSeverity(error.errorCode)} className="text-xs">
                        {error.errorCode}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {error.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs font-medium mb-1">
                      {getErrorDescription(error.errorCode)}
                    </p>
                    <p className="text-xs text-muted-foreground break-words">
                      {error.error.substring(0, 100)}...
                    </p>
                  </div>
                ))}
              </div>
            </details>
          )}

          {/* Help Info */}
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
            <div className="flex items-center gap-1 mb-1">
              <Info className="w-3 h-3" />
              <span className="font-medium">React Error Codes</span>
            </div>
            <ul className="space-y-1 text-xs">
              <li><strong>#418:</strong> Hook usage error</li>
              <li><strong>#423:</strong> Component lifecycle error</li>
              <li><strong>#425:</strong> Hook context error</li>
            </ul>
          </div>

          <Button 
            size="sm" 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="w-full text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Reload Page
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
