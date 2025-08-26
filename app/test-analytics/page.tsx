"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAnalyticsConsent } from '@/hooks/use-analytics-consent'

export default function TestAnalyticsPage() {
  const { hasConsent, acceptAnalytics, declineAnalytics, clearConsent } = useAnalyticsConsent()
  const [analyticsStatus, setAnalyticsStatus] = useState<string>('Checking...')
  const [dataLayerStatus, setDataLayerStatus] = useState<string>('Checking...')

  useEffect(() => {
    // Check analytics status
    const checkStatus = () => {
      if (typeof window !== 'undefined') {
        // Check if gtag is available
        if (typeof window.gtag === 'function') {
          setAnalyticsStatus('✅ Google Analytics is active')
        } else {
          setAnalyticsStatus('❌ Google Analytics is not active')
        }

        // Check dataLayer
        if (window.dataLayer && window.dataLayer.length > 0) {
          setDataLayerStatus(`✅ DataLayer has ${window.dataLayer.length} entries`)
        } else {
          setDataLayerStatus('❌ DataLayer is empty or not available')
        }
      }
    }

    // Check immediately and after a delay
    checkStatus()
    const timer = setTimeout(checkStatus, 2000)

    return () => clearTimeout(timer)
  }, [hasConsent])

  const testPageView = () => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'test_page_view', {
        event_category: 'test',
        event_label: 'manual_test'
      })
      alert('Test page view event sent!')
    } else {
      alert('Google Analytics is not active')
    }
  }

  const testCustomEvent = () => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'test_custom_event', {
        event_category: 'test',
        event_label: 'custom_test',
        value: Math.floor(Math.random() * 100)
      })
      alert('Test custom event sent!')
    } else {
      alert('Google Analytics is not active')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Google Analytics Test Page</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Consent Status</CardTitle>
            <CardDescription>Current cookie consent status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>Status:</strong> {hasConsent === null ? 'No decision' : hasConsent ? 'Accepted' : 'Declined'}
              </div>
              <div className="flex gap-2">
                <Button onClick={acceptAnalytics} variant="outline" size="sm">
                  Accept Analytics
                </Button>
                <Button onClick={declineAnalytics} variant="outline" size="sm">
                  Decline Analytics
                </Button>
                <Button onClick={clearConsent} variant="outline" size="sm">
                  Clear Consent
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics Status</CardTitle>
            <CardDescription>Current Google Analytics status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>Analytics:</strong> {analyticsStatus}
              </div>
              <div>
                <strong>DataLayer:</strong> {dataLayerStatus}
              </div>
              <div className="flex gap-2">
                <Button onClick={testPageView} variant="outline" size="sm">
                  Test Page View
                </Button>
                <Button onClick={testCustomEvent} variant="outline" size="sm">
                  Test Custom Event
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
          <CardDescription>Technical details for debugging</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm font-mono">
            <div>User Agent: {typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'}</div>
            <div>Consent Cookie: {typeof window !== 'undefined' ? localStorage.getItem('icc-cookie-consent') || 'Not set' : 'N/A'}</div>
            <div>Consent Date: {typeof window !== 'undefined' ? localStorage.getItem('icc-cookie-date') || 'Not set' : 'N/A'}</div>
            <div>Environment: {process.env.NODE_ENV}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
