"use client"

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

export function ConnectionMonitor() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [errors, setErrors] = useState<string[]>([])
  const [lastCheck, setLastCheck] = useState<Date>(new Date())

  useEffect(() => {
    // Monitor for connection-related errors
    const originalError = console.error
    const originalWarn = console.warn

    console.error = (...args) => {
      try {
        const errorMsg = args.join(' ')
        if (errorMsg.includes('Connection closed') || 
            errorMsg.includes('Minified React error') ||
            errorMsg.includes('WebSocket') ||
            errorMsg.includes('fetch')) {
          setErrors(prev => [...prev.slice(-4), `Error: ${errorMsg}`]) // Keep only last 5 errors
          setConnectionStatus('error')
        }
        originalError.apply(console, args)
      } catch (monitoringError) {
        console.warn('Error monitoring failed:', monitoringError)
        // Fallback to original console.error
        originalError.apply(console, args)
      }
    }

    console.warn = (...args) => {
      try {
        const warnMsg = args.join(' ')
        if (warnMsg.includes('Connection') || 
            warnMsg.includes('WebSocket') ||
            warnMsg.includes('CSP')) {
          setErrors(prev => [...prev.slice(-4), `Warning: ${warnMsg}`]) // Keep only last 5 errors
        }
        originalWarn.apply(console, args)
      } catch (monitoringError) {
        console.warn('Warning monitoring failed:', monitoringError)
        // Fallback to original console.warn
        originalWarn.apply(console, args)
      }
    }

    // Test basic connectivity
    const testConnection = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
        
        const response = await fetch('/api/health/redis', { 
          method: 'GET',
          cache: 'no-cache',
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          setConnectionStatus('connected')
        } else {
          setConnectionStatus('error')
          setErrors(prev => [...prev.slice(-4), `API returned ${response.status}`]) // Keep only last 5 errors
        }
      } catch (error) {
        setConnectionStatus('error')
        setErrors(prev => [...prev.slice(-4), `Fetch error: ${error}`]) // Keep only last 5 errors
      }
      setLastCheck(new Date())
    }

    testConnection()

    // Test connection every 30 seconds
    const interval = setInterval(testConnection, 30000)

    return () => {
      try {
        console.error = originalError
        console.warn = originalWarn
      } catch (error) {
        console.warn('Failed to restore console methods:', error)
      }
      clearInterval(interval)
    }
  }, [])

  // Only show in development or when there are errors
  if (process.env.NODE_ENV === 'production' && connectionStatus === 'connected' && errors.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-background border border-border rounded-lg shadow-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          {connectionStatus === 'checking' && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
          {connectionStatus === 'connected' && <CheckCircle className="w-4 h-4 text-green-500" />}
          {connectionStatus === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
          <span className="font-medium text-sm">
            Connection Monitor
          </span>
        </div>

        <div className="text-xs text-muted-foreground mb-2">
          Last check: {lastCheck.toLocaleTimeString()}
        </div>

        {connectionStatus === 'error' && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
            <div className="flex items-center gap-1 mb-1">
              <AlertTriangle className="w-3 h-3" />
              <span className="font-medium">Connection Issues Detected</span>
            </div>
            <p>Check browser console for details</p>
          </div>
        )}

        {errors.length > 0 && (
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground mb-1">
              Recent Errors ({errors.length})
            </summary>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {errors.slice(-5).map((error, index) => (
                <div key={index} className="p-1 bg-muted rounded text-xs font-mono break-words">
                  {error}
                </div>
              ))}
            </div>
          </details>
        )}

        <button
          onClick={() => window.location.reload()}
          className="mt-2 w-full text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
        >
          Reload Page
        </button>
      </div>
    </div>
  )
}
