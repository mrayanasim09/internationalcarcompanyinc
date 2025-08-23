"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home, Bug, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorType: 'react' | 'connection' | 'general' | 'unknown'
  errorCode: string | null
  retryCount: number
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  private maxRetries = 3
  private retryTimeout: NodeJS.Timeout | null = null

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'unknown',
      errorCode: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Analyze the error to determine its type
    let errorType: State['errorType'] = 'general'
    let errorCode: string | null = null

    // Check for React minified errors
    const reactErrorMatch = error.message.match(/Minified React error #(\d+)/)
    if (reactErrorMatch) {
      errorType = 'react'
      errorCode = reactErrorMatch[1]
    }
    // Check for connection-related errors
    else if (error.message.includes('Connection closed') || 
             error.message.includes('Connection failed') ||
             error.message.includes('Network error') ||
             error.message.includes('fetch') ||
             error.message.includes('WebSocket')) {
      errorType = 'connection'
    }

    return {
      hasError: true,
      errorType,
      errorCode
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('EnhancedErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Production error reporting
    if (process.env.NODE_ENV === 'production') {
      this.reportErrorToAnalytics(error, errorInfo)
    }

    // Log to console for debugging
    if (process.env.NODE_ENV !== 'production') {
      console.group('Enhanced Error Boundary Details')
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Stack Trace:', error.stack)
      console.error('Component Stack:', errorInfo.componentStack)
      console.groupEnd()
    }

    // Auto-retry for certain error types
    if (this.state.errorType === 'connection' && this.state.retryCount < this.maxRetries) {
      this.scheduleRetry()
    }
  }

  private reportErrorToAnalytics = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Report to Google Analytics if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'exception', {
          description: error.message,
          fatal: false,
          custom_map: {
            component_stack: errorInfo.componentStack,
            error_stack: error.stack
          }
        })
      }

      // Report to console for production debugging
      console.error('Production Error Report:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      })
    } catch (reportingError) {
      console.error('Failed to report error to analytics:', reportingError)
    }
  }

  private scheduleRetry = () => {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }

    this.retryTimeout = setTimeout(() => {
      this.setState(prev => ({ retryCount: prev.retryCount + 1 }))
      this.handleRetry()
    }, Math.pow(2, this.state.retryCount) * 1000) // Exponential backoff
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'unknown',
      errorCode: null
    })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  getErrorDescription = (errorCode: string | null): string => {
    if (!errorCode) return 'An unexpected error occurred'
    
    const descriptions: Record<string, string> = {
      '418': 'React Hook Error - Invalid hook usage or component state issue. This usually happens when hooks are called conditionally or outside of React components.',
      '423': 'React Component Error - Component lifecycle or rendering problem. This typically occurs when there are issues with component mounting/unmounting or state updates.',
      '425': 'React Hook Error - Hook called outside of component or invalid context. This happens when hooks are used in event handlers, loops, or nested functions.'
    }
    
    return descriptions[errorCode] || 'React Error - Component or hook usage issue'
  }

  getErrorSeverity = (): 'default' | 'destructive' | 'secondary' => {
    switch (this.state.errorType) {
      case 'react':
        return 'destructive'
      case 'connection':
        return 'secondary'
      default:
        return 'default'
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="mb-4">
                <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {this.state.errorType === 'react' ? 'React Component Error' : 
                   this.state.errorType === 'connection' ? 'Connection Error' : 
                   'Something went wrong'}
                </h1>
                <p className="text-muted-foreground mb-4">
                  {this.state.errorType === 'react' 
                    ? 'A React component encountered an error. This might be due to invalid hook usage or component state issues.'
                    : this.state.errorType === 'connection'
                    ? 'We encountered a connection issue. This might be temporary.'
                    : 'An unexpected error occurred. Please try again.'
                  }
                </p>
              </div>

              {/* Error Code Badge */}
              {this.state.errorCode && (
                <div className="mb-4">
                  <Badge variant={this.getErrorSeverity()} className="text-sm">
                    <Bug className="h-3 w-3 mr-1" />
                    Error #{this.state.errorCode}
                  </Badge>
                </div>
              )}

              {/* Error Description */}
              {this.state.errorCode && (
                <div className="mb-6 p-4 bg-muted/50 rounded-md text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>{this.getErrorDescription(this.state.errorCode)}</p>
                  </div>
                </div>
              )}

              {/* Retry Count for Connection Errors */}
              {this.state.errorType === 'connection' && this.state.retryCount > 0 && (
                <div className="mb-4 text-sm text-muted-foreground">
                  Retry attempt {this.state.retryCount} of {this.maxRetries}
                </div>
              )}
            </CardHeader>

            <CardContent className="text-center space-y-4">
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={this.handleRetry}
                  className="flex-1 sm:flex-none"
                  disabled={this.state.errorType === 'connection' && this.state.retryCount >= this.maxRetries}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {this.state.errorType === 'connection' && this.state.retryCount >= this.maxRetries 
                    ? 'Max Retries Reached' 
                    : 'Try Again'
                  }
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV !== 'production' && this.state.error && (
                <details className="text-left">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    Show Error Details
                  </summary>
                  <div className="mt-3 p-3 bg-muted/50 rounded-md text-xs font-mono text-muted-foreground overflow-auto max-h-40">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    {this.state.errorInfo && (
                      <div className="mb-2">
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap mt-1">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="whitespace-pre-wrap mt-1">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }
  }
}
