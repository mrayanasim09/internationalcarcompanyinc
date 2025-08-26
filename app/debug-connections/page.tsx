"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface ConnectionAttempt {
  timestamp: Date
  type: 'websocket' | 'fetch' | 'xhr' | 'error' | 'warning'
  details: string
  stack?: string
}

export default function DebugConnectionsPage() {
  const [connections, setConnections] = useState<ConnectionAttempt[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [errorCount, setErrorCount] = useState(0)
  const [warningCount, setWarningCount] = useState(0)

  useEffect(() => {
    if (!isMonitoring) return

    const originalError = console.error
    const originalWarn = console.warn
    const originalFetch = window.fetch
    const originalXHROpen = XMLHttpRequest.prototype.open
    const originalWebSocket = window.WebSocket

    // Monitor console errors
    console.error = (...args) => {
      const message = args.join(' ')
      if (message.includes('Connection closed') || message.includes('Minified React error')) {
        setConnections(prev => [...prev, {
          timestamp: new Date(),
          type: 'error',
          details: message,
          stack: new Error().stack
        }])
        setErrorCount(prev => prev + 1)
      }
      originalError.apply(console, args)
    }

    // Monitor console warnings
    console.warn = (...args) => {
      const message = args.join(' ')
      if (message.includes('Connection') || message.includes('WebSocket') || message.includes('CSP')) {
        setConnections(prev => [...prev, {
          timestamp: new Date(),
          type: 'warning',
          details: message,
          stack: new Error().stack
        }])
        setWarningCount(prev => prev + 1)
      }
      originalWarn.apply(console, args)
    }

    // Monitor fetch calls
    window.fetch = (...args) => {
      const [url] = args
      setConnections(prev => [...prev, {
        timestamp: new Date(),
        type: 'fetch',
        details: `Fetch to: ${url}`,
        stack: new Error().stack
      }])
      return originalFetch.apply(window, args)
    }

    // Monitor XHR calls
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async: boolean = true, username?: string | null, password?: string | null) {
      setConnections(prev => [...prev, {
        timestamp: new Date(),
        type: 'xhr',
        details: `XHR ${method} to: ${url}`,
        stack: new Error().stack
      }])
      return originalXHROpen.apply(this, [method, url, async, username, password])
    }

    // Monitor WebSocket connections
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const WebSocketWrapper = function(this: any, url: string | URL, protocols?: string | string[]) {
      setConnections(prev => [...prev, {
        timestamp: new Date(),
        type: 'websocket',
        details: `WebSocket to: ${url}`,
        stack: new Error().stack
      }])
      return new originalWebSocket(url, protocols)
    }
    
    // Copy static properties from original WebSocket
    Object.setPrototypeOf(WebSocketWrapper, originalWebSocket)
    Object.defineProperty(WebSocketWrapper, 'prototype', {
      value: originalWebSocket.prototype,
      writable: false
    })
    
    // Copy static constants
    WebSocketWrapper.CONNECTING = originalWebSocket.CONNECTING
    WebSocketWrapper.OPEN = originalWebSocket.OPEN
    WebSocketWrapper.CLOSING = originalWebSocket.CLOSING
    WebSocketWrapper.CLOSED = originalWebSocket.CLOSED
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.WebSocket = WebSocketWrapper as any

    return () => {
      console.error = originalError
      console.warn = originalWarn
      window.fetch = originalFetch
      XMLHttpRequest.prototype.open = originalXHROpen
      window.WebSocket = originalWebSocket
    }
  }, [isMonitoring])

  const startMonitoring = () => {
    setIsMonitoring(true)
    setConnections([])
    setErrorCount(0)
    setWarningCount(0)
  }

  const stopMonitoring = () => {
    setIsMonitoring(false)
  }

  const clearLogs = () => {
    setConnections([])
    setErrorCount(0)
    setWarningCount(0)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'destructive'
      case 'warning': return 'secondary'
      case 'websocket': return 'default'
      case 'fetch': return 'outline'
      case 'xhr': return 'outline'
      default: return 'outline'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'websocket': return <CheckCircle className="w-4 h-4" />
      case 'fetch': return <CheckCircle className="w-4 h-4" />
      case 'xhr': return <CheckCircle className="w-4 h-4" />
      default: return <CheckCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Connection Debug Monitor</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={isMonitoring ? 'default' : 'secondary'}>
              {isMonitoring ? 'Monitoring' : 'Stopped'}
            </Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="destructive">{errorCount}</Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">{warningCount}</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mb-6">
        <Button onClick={startMonitoring} disabled={isMonitoring}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Start Monitoring
        </Button>
        <Button onClick={stopMonitoring} disabled={!isMonitoring} variant="outline">
          Stop Monitoring
        </Button>
        <Button onClick={clearLogs} variant="outline">
          Clear Logs
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection Attempts ({connections.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {isMonitoring ? 'Waiting for connections...' : 'Start monitoring to see connections'}
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {connections.map((connection, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(connection.type)}
                    <Badge variant={getTypeColor(connection.type)}>
                      {connection.type.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {connection.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm font-mono break-words">{connection.details}</p>
                  {connection.stack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-muted-foreground">
                        Stack Trace
                      </summary>
                      <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-auto">
                        {connection.stack}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">Instructions</h3>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Click &quot;Start Monitoring&quot; to begin tracking connections</li>
          <li>Navigate to pages that have connection errors (like /about)</li>
          <li>Check the browser console for additional errors</li>
          <li>Look for patterns in the connection attempts</li>
          <li>Use the stack traces to identify the source of connections</li>
        </ol>
      </div>
    </div>
  )
}
