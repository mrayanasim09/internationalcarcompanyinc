"use client"

import { useState, useEffect } from 'react'

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    const checkDevice = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
      setIsDesktop(width >= 1024)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  // Return default values during SSR to prevent hydration mismatch
  if (!isMounted) {
    return { isMobile: false, isTablet: false, isDesktop: false }
  }

  return { isMobile, isTablet, isDesktop }
}

export function useTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    const checkTouchDevice = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }

    checkTouchDevice()
  }, [])

  // Return default value during SSR to prevent hydration mismatch
  if (!isMounted) {
    return false
  }

  return isTouchDevice
}
