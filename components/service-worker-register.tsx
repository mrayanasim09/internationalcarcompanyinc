"use client"

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Download } from 'lucide-react'

interface ServiceWorkerRegistration {
  waiting: ServiceWorker | null
  installing: ServiceWorker | null
  active: ServiceWorker | null
}

export function ServiceWorkerRegister() {
  const [hasUpdate, setHasUpdate] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  const registerServiceWorker = useCallback(async () => {
    try {
      if (!('serviceWorker' in navigator)) return
      
      const reg = await navigator.serviceWorker.register('/sw.js')
      setRegistration(reg)

      // Handle service worker updates
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setHasUpdate(true)
            }
          })
        }
      })

      // Handle service worker state changes
      if (reg.waiting) {
        setHasUpdate(true)
      }

      // Handle service worker messages
      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          console.log('Service Worker: Cache updated successfully')
        }
      }
      
      navigator.serviceWorker.addEventListener('message', handleMessage)

      console.log('Service Worker registered successfully:', reg)
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }, [])

  const updateServiceWorker = useCallback(() => {
    if (registration && registration.waiting) {
      setIsInstalling(true)
      
      // Send message to waiting service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      
      // Reload the page when the new service worker takes over
      const handleStateChange = () => {
        if (registration.waiting?.state === 'activated') {
          window.location.reload()
        }
      }
      
      registration.waiting.addEventListener('statechange', handleStateChange)
    }
  }, [registration])

  const preloadCriticalAssets = useCallback(async () => {
    if (registration && registration.active) {
      const criticalUrls = [
        '/inventory',
        '/about',
        '/contact',
        '/International Car Company Inc. Logo.png'
      ]

      try {
        for (const url of criticalUrls) {
          await registration.active.postMessage({
            type: 'PRELOAD_ASSET',
            url
          })
        }
        console.log('Critical assets preloaded successfully')
      } catch (error) {
        console.warn('Failed to preload critical assets:', error)
      }
    }
  }, [registration])

  useEffect(() => {
    // Check if service worker is supported and register
    registerServiceWorker()
  }, [registerServiceWorker])

  // Don't render anything if service worker is not supported
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {/* Service Worker Update Notification */}
      {hasUpdate && (
        <div className="flex items-center gap-2 p-3 bg-background border border-border rounded-lg shadow-lg">
          <Download className="h-4 w-4 text-blue-500" />
          <span className="text-xs text-muted-foreground">Update available</span>
          <Button
            size="sm"
            variant="outline"
            onClick={updateServiceWorker}
            disabled={isInstalling}
            className="h-6 px-2 text-xs"
          >
            {isInstalling ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              'Update'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

// Hook for using service worker functionality
export function useServiceWorker() {
  const [isSupported, setIsSupported] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)

  useEffect(() => {
    setIsSupported('serviceWorker' in navigator)
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setIsRegistered(true)
      })
    }
  }, [])

  const checkForUpdates = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.update()
      }
    }
  }

  const clearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
      console.log('All caches cleared')
    }
  }

  return {
    isSupported,
    isRegistered,
    checkForUpdates,
    clearCache
  }
}
