"use client"

import { useState, useEffect, useRef, useCallback } from 'react'

interface TouchPoint {
  x: number
  y: number
  timestamp: number
}

interface GestureConfig {
  minSwipeDistance?: number
  maxSwipeTime?: number
  minPinchDistance?: number
  enableHaptic?: boolean
}

interface SwipeCallbacks {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onPinchIn?: (scale: number) => void
  onPinchOut?: (scale: number) => void
  onTap?: (point: TouchPoint) => void
  onDoubleTap?: (point: TouchPoint) => void
  onLongPress?: (point: TouchPoint) => void
}

export function useMobileGestures(
  elementRef: React.RefObject<HTMLElement>,
  callbacks: SwipeCallbacks,
  config: GestureConfig = {}
) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isTouching, setIsTouching] = useState(false)
  
  const touchStartRef = useRef<TouchPoint | null>(null)
  const touchEndRef = useRef<TouchPoint | null>(null)
  const lastTapRef = useRef<TouchPoint | null>(null)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  const {
    minSwipeDistance = 50,
    maxSwipeTime = 300,
    minPinchDistance = 20,
    enableHaptic = true
  } = config

  // Haptic feedback for mobile devices
  const triggerHaptic = useCallback(() => {
    if (!enableHaptic || typeof navigator === 'undefined') return
    
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(10)
      }
    } catch (error) {
      console.warn('Haptic feedback not supported:', error)
    }
  }, [enableHaptic])

  // Calculate distance between two points
  const getDistance = useCallback((p1: TouchPoint, p2: TouchPoint): number => {
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    return Math.sqrt(dx * dx + dy * dy)
  }, [])

  // Calculate angle between two points
  const getAngle = useCallback((p1: TouchPoint, p2: TouchPoint): number => {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI
  }, [])

  // Detect swipe gesture
  const detectSwipe = useCallback((start: TouchPoint, end: TouchPoint) => {
    const distance = getDistance(start, end)
    const time = end.timestamp - start.timestamp
    const angle = getAngle(start, end)

    if (distance < minSwipeDistance || time > maxSwipeTime) return

    // Determine swipe direction
    if (Math.abs(angle) < 45) {
      // Horizontal swipe
      if (angle > 0) {
        callbacks.onSwipeRight?.()
      } else {
        callbacks.onSwipeLeft?.()
      }
    } else if (Math.abs(angle - 90) < 45) {
      // Vertical swipe
      if (angle > 90) {
        callbacks.onSwipeDown?.()
      } else {
        callbacks.onSwipeUp?.()
      }
    }

    triggerHaptic()
  }, [getDistance, getAngle, minSwipeDistance, maxSwipeTime, callbacks, triggerHaptic])

  // Detect pinch gesture
  const detectPinch = useCallback((touches: TouchList) => {
    if (touches.length !== 2) return

    const touch1 = touches[0]
    const touch2 = touches[1]
    
    const distance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    )

    if (distance < minPinchDistance) return

    // Calculate scale factor (simplified)
    const scale = distance / 100 // Base scale on 100px distance
    
    if (scale < 0.8) {
      callbacks.onPinchIn?.(scale)
    } else if (scale > 1.2) {
      callbacks.onPinchOut?.(scale)
    }
  }, [minPinchDistance, callbacks])

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault()
    setIsTouching(true)
    
    const touch = e.touches[0]
    const point: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    }
    
    touchStartRef.current = point
    
    // Start long press timer
    longPressTimerRef.current = setTimeout(() => {
      callbacks.onLongPress?.(point)
      triggerHaptic()
    }, 500)
  }, [callbacks, triggerHaptic])

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return
    
    // Cancel long press on move
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    
    // Detect pinch gesture
    detectPinch(e.touches)
  }, [detectPinch])

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return
    
    // Cancel long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    
    const touch = e.changedTouches[0]
    const endPoint: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    }
    
    touchEndRef.current = endPoint
    
    // Detect swipe
    detectSwipe(touchStartRef.current, endPoint)
    
    // Detect tap
    const distance = getDistance(touchStartRef.current, endPoint)
    const time = endPoint.timestamp - touchStartRef.current.timestamp
    
    if (distance < 10 && time < 200) {
      // Single tap
      callbacks.onTap?.(endPoint)
      
      // Check for double tap
      if (lastTapRef.current) {
        const timeBetweenTaps = endPoint.timestamp - lastTapRef.current.timestamp
        const distanceBetweenTaps = getDistance(lastTapRef.current, endPoint)
        
        if (timeBetweenTaps < 300 && distanceBetweenTaps < 50) {
          callbacks.onDoubleTap?.(endPoint)
          lastTapRef.current = null
          return
        }
      }
      
      lastTapRef.current = endPoint
    }
    
    setIsTouching(false)
    touchStartRef.current = null
    touchEndRef.current = null
  }, [detectSwipe, getDistance, callbacks])

  // Enable/disable gestures
  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const enableGestures = () => {
      element.addEventListener('touchstart', handleTouchStart, { passive: false })
      element.addEventListener('touchmove', handleTouchMove, { passive: false })
      element.addEventListener('touchend', handleTouchEnd, { passive: false })
      setIsEnabled(true)
    }

    const disableGestures = () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      setIsEnabled(false)
    }

    // Check if device supports touch
    if ('ontouchstart' in window) {
      enableGestures()
    }

    return () => {
      disableGestures()
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
    }
  }, [elementRef, handleTouchStart, handleTouchMove, handleTouchEnd])

  return {
    isEnabled,
    isTouching
  }
}

// Convenience hook for swipe gestures only
export function useSwipeGestures(
  elementRef: React.RefObject<HTMLElement>,
  callbacks: Pick<SwipeCallbacks, 'onSwipeLeft' | 'onSwipeRight' | 'onSwipeUp' | 'onSwipeDown'>,
  config?: GestureConfig
) {
  return useMobileGestures(elementRef, callbacks, config)
}

// Convenience hook for pinch gestures only
export function usePinchGestures(
  elementRef: React.RefObject<HTMLElement>,
  callbacks: Pick<SwipeCallbacks, 'onPinchIn' | 'onPinchOut'>,
  config?: GestureConfig
) {
  return useMobileGestures(elementRef, callbacks, config)
}
