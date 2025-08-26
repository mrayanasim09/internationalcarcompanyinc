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
  const [hasError, setHasError] = useState(false)

  const registerServiceWorker = useCallback(async () => {
    try {
      if (!('serviceWorker' in navigator)) return
      
      // Check if service worker is already registered
      const existingReg = await navigator.serviceWorker.getRegistration()
      if (existingReg) {
        setRegistration(existingReg)
        return
      }
      
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      })
      setRegistration(reg)
      setHasError(false)

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
      setHasError(true)
      
      // If service worker fails, try to unregister any existing ones
      try {
        const existingReg = await navigator.serviceWorker.getRegistration()
        if (existingReg) {
          await existingReg.unregister()
          console.log('Failed service worker unregistered')
        }
      } catch (unregisterError) {
        console.error('Failed to unregister service worker:', unregisterError)
      }
    }
  }, [])

  const updateServiceWorker = useCallback(() => {
    if (registration && registration.waiting) {
      setIsInstalling(true)
      
      try {
        // Send message to waiting service worker to skip waiting
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        
        // Reload the page when the new service worker takes over
        const handleStateChange = () => {
          if (registration.waiting?.state === 'activated') {
            window.location.reload()
          }
        }
        
        registration.waiting.addEventListener('statechange', handleStateChange)
      } catch (error) {
        console.error('Failed to update service worker:', error)
        setIsInstalling(false)
      }
    }
  }, [registration])

  const unregisterServiceWorker = useCallback(async () => {
    try {
      if (registration) {
        await registration.active?.postMessage({ type: 'UNREGISTER' })
        await navigator.serviceWorker.getRegistration().then(reg => reg?.unregister())
        setRegistration(null)
        setHasUpdate(false)
        setHasError(false)
        console.log('Service worker unregistered')
      }
    } catch (error) {
      console.error('Failed to unregister service worker:', error)
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

  // Don't show anything if there are no updates and no errors
  if (!hasUpdate && !hasError) {
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

      {/* Service Worker Error Notification */}
      {hasError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg shadow-lg">
          <RefreshCw className="h-4 w-4 text-red-500" />
          <span className="text-xs text-red-700">Service worker error</span>
          <Button
            size="sm"
            variant="outline"
            onClick={unregisterServiceWorker}
            className="h-6 px-2 text-xs text-red-700 border-red-200 hover:bg-red-100"
          >
            Disable
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
      }).catch(() => {
        setIsRegistered(false)
      })
    }
  }, [])

  const checkForUpdates = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          await registration.update()
        }
      } catch (error) {
        console.error('Failed to check for updates:', error)
      }
    }
  }

  const clearCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        )
        console.log('All caches cleared')
      } catch (error) {
        console.error('Failed to clear caches:', error)
      }
    }
  }

  return {
    isSupported,
    isRegistered,
    checkForUpdates,
    clearCache
  }
}
