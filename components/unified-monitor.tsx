"use client"

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { CheckCircle, XCircle, Bug, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ReactError {
  id: string
  timestamp: Date
  error: string
  errorCode: string
  stack?: string
}

interface ConnectionStatus {
  status: 'checking' | 'connected' | 'error'
  lastCheck: Date
  errors: string[]
}

export function UnifiedMonitor() {
  const [activeTab, setActiveTab] = useState('connection')
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'checking',
    lastCheck: new Date(),
    errors: []
  })
  const [reactErrors, setReactErrors] = useState<ReactError[]>([])
  const originalErrorRef = useRef<typeof console.error>()
  const originalWarnRef = useRef<typeof console.warn>()

  // Connection monitoring
  const testConnection = useCallback(async () => {
    try {
      const response = await fetch('/api/health/redis', { 
        method: 'GET',
        cache: 'no-cache'
      })
      if (response.ok) {
        setConnectionStatus(prev => ({ ...prev, status: 'connected' }))
      } else {
        setConnectionStatus(prev => ({ ...prev, status: 'error' }))
      }
    } catch (error) {
      setConnectionStatus(prev => ({ 
        ...prev, 
        status: 'error',
        errors: [...prev.errors, `Fetch error: ${error}`]
      }))
    }
    setConnectionStatus(prev => ({ ...prev, lastCheck: new Date() }))
  }, [])

  // React error monitoring
  const setupErrorMonitoring = useCallback(() => {
    if (!originalErrorRef.current || !originalWarnRef.current) return

    const originalError = originalErrorRef.current
    const originalWarn = originalWarnRef.current

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
        
        setReactErrors(prev => [...prev, error])
      }

      // Check for connection errors
      if (message.includes('Connection closed') || message.includes('WebSocket')) {
        setConnectionStatus(prev => ({
          ...prev,
          status: 'error',
          errors: [...prev.errors, `Console error: ${message}`]
        }))
      }

      // Call original console.error
      originalError.apply(console, args)
    }

    // Catch React warnings
    console.warn = (...args) => {
      const message = args.join(' ')
      
      // Check for React warnings
      if (message.includes('React') || message.includes('Warning')) {
        const error: ReactError = {
          id: Date.now().toString(),
          timestamp: new Date(),
          error: message,
          errorCode: 'WARNING',
          stack: new Error().stack
        }
        
        setReactErrors(prev => [...prev, error])
      }

      // Call original console.warn
      originalWarn.apply(console, args)
    }

    return () => {
      console.error = originalError
      console.warn = originalWarn
    }
  }, [])

  useEffect(() => {
    // Store original console methods
    originalErrorRef.current = console.error
    originalWarnRef.current = console.warn

    // Test connection initially
    testConnection()
    
    // Set up connection monitoring interval
    const interval = setInterval(testConnection, 30000)
    
    return () => clearInterval(interval)
  }, [testConnection])

  useEffect(() => {
    // Set up error monitoring when monitoring is enabled
    const cleanup = setupErrorMonitoring()
    
    return cleanup
  }, [setupErrorMonitoring, testConnection])

  // Don't render anything if not in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Card className="w-80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bug className="h-4 w-4" />
            System Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="connection" className="text-xs">Connection</TabsTrigger>
              <TabsTrigger value="errors" className="text-xs">Errors</TabsTrigger>
            </TabsList>
            
            <TabsContent value="connection" className="mt-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Status:</span>
                  <Badge variant={connectionStatus.status === 'connected' ? 'default' : 'destructive'}>
                    {connectionStatus.status === 'connected' ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {connectionStatus.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Last check: {connectionStatus.lastCheck.toLocaleTimeString()}
                </div>
                {connectionStatus.errors.length > 0 && (
                  <div className="text-xs text-red-600">
                    Errors: {connectionStatus.errors.length}
                  </div>
                )}
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={testConnection}
                  className="w-full text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Test Connection
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="errors" className="mt-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs">React Errors:</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setReactErrors([])
                    }}
                    className="text-xs h-6 px-2"
                  >
                    Clear
                  </Button>
                </div>
                {reactErrors.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-2">
                    No errors detected
                  </div>
                ) : (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {reactErrors.slice(-5).map((error) => (
                      <div key={error.id} className="text-xs p-2 bg-muted rounded">
                        <div className="font-mono text-red-600">#{error.errorCode}</div>
                        <div className="text-muted-foreground truncate">{error.error}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Total: {reactErrors.length}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
