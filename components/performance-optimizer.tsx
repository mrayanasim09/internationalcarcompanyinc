"use client"

import React, { useEffect, useRef } from 'react'

interface PerformanceOptimizerProps {
  children: React.ReactNode
}

export function PerformanceOptimizer({ children }: PerformanceOptimizerProps) {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const performanceRef = useRef<PerformanceObserver | null>(null)

  useEffect(() => {
    // Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const target = entry.target as HTMLElement
              // Add loading class for smooth animations
              target.classList.add('animate-in')
              observerRef.current?.unobserve(target)
            }
          })
        },
        {
          rootMargin: '50px',
          threshold: 0.1,
        }
      )
    }

    // Performance monitoring
    if ('PerformanceObserver' in window) {
      try {
        performanceRef.current = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // Monitor long tasks
            if (entry.entryType === 'longtask') {
              console.warn('Long task detected:', entry.duration)
            }
            
            // Monitor layout shifts
            if (entry.entryType === 'layout-shift') {
              const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number }
              if (!layoutShiftEntry.hadRecentInput) {
                console.warn('Layout shift detected:', layoutShiftEntry.value)
              }
            }
          }
        })
        
        performanceRef.current.observe({ 
          entryTypes: ['longtask', 'layout-shift'] 
        })
      } catch (error) {
        console.warn('Performance monitoring not supported:', error)
      }
    }

    // Cleanup
    return () => {
      observerRef.current?.disconnect()
      performanceRef.current?.disconnect()
    }
  }, [])

  // Add performance attributes to children
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        'data-performance-optimized': true,
        ref: (node: HTMLElement | null) => {
          if (node && observerRef.current) {
            observerRef.current.observe(node)
          }
        },
      })
    }
    return child
  })

  return <>{enhancedChildren}</>
}

// Performance monitoring hook
export function usePerformanceMonitoring() {
  useEffect(() => {
    // Monitor Core Web Vitals
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Note: web-vitals package is not installed, skipping for now
        console.log('Performance monitoring ready')
      })
    }
  }, [])
}

// Lazy loading hook
export function useLazyLoading<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            element.classList.add('loaded')
            observer.unobserve(element)
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return ref
}
