"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  isConnectionError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isConnectionError: false
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Check if this is a connection-related error
    const isConnectionError = error.message.includes('Connection closed') || 
                             error.message.includes('Connection failed') ||
                             error.message.includes('Network error') ||
                             error.message.includes('fetch') ||
                             error.message.includes('WebSocket') ||
                             error.message.includes('Minified React error #423')

    return {
      hasError: true,
      isConnectionError
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Log to console for debugging
    if (process.env.NODE_ENV !== 'production') {
      console.group('Error Boundary Details')
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Stack Trace:', error.stack)
      console.groupEnd()
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isConnectionError: false
    })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-6 text-center">
            <div className="mb-6">
              <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {this.state.isConnectionError ? 'Connection Error' : 'Something went wrong'}
              </h1>
              <p className="text-muted-foreground mb-4">
                {this.state.isConnectionError 
                  ? 'We encountered a connection issue. This might be temporary.'
                  : 'An unexpected error occurred. Please try again.'
                }
              </p>
            </div>

            {this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  Error Details
                </summary>
                <div className="mt-2 p-3 bg-muted rounded text-xs font-mono text-muted-foreground overflow-auto">
                  <div className="mb-2">
                    <strong>Message:</strong> {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap break-words">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={this.handleRetry}
                className="flex-1"
                variant="default"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button 
                onClick={this.handleGoHome}
                className="flex-1"
                variant="outline"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </div>

            {this.state.isConnectionError && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                <p className="font-medium mb-1">Connection Issue Detected</p>
                <p className="text-blue-700">
                  This appears to be a network or connection issue. Please check your internet connection and try again.
                </p>
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for functional components to use error boundary
export const useErrorBoundary = () => {
  const [hasError, setHasError] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Caught error in useErrorBoundary:', event.error)
      setError(event.error)
      setHasError(true)
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Caught unhandled rejection in useErrorBoundary:', event.reason)
      setError(new Error(event.reason))
      setHasError(true)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return { hasError, error, resetError: () => setHasError(false) }
}
