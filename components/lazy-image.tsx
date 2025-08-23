"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  placeholder?: string
  priority?: boolean
  sizes?: string
  quality?: number
  blurDataURL?: string
}

export function LazyImage({
  src,
  alt,
  width = 400,
  height = 300,
  fill = false,
  className,
  placeholder = "/placeholder.jpg",
  priority = false,
  sizes = "100vw",
  quality = 75,
  blurDataURL
}: LazyImageProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [isInView, setIsInView] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
  }, [])

  const handleError = useCallback(() => {
    setHasError(true)
  }, [])

  useEffect(() => {
    if (!imgRef.current) return

    // Mobile-optimized intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        // Larger root margin for mobile to start loading earlier
        rootMargin: '200px',
        threshold: 0.01
      }
    )

    observer.observe(imgRef.current)

    return () => observer.disconnect()
  }, [])

  // Show placeholder while not in view
  if (!isInView && !priority) {
    return (
      <div
        ref={imgRef}
        className={cn(
          "bg-muted animate-pulse",
          fill ? "absolute inset-0" : "",
          !fill && width && height && `w-[${width}px] h-[${height}px]`,
          className
        )}
      >
        <Image
          src={placeholder}
          alt=""
          fill={fill}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          className="opacity-0"
          sizes={sizes}
          quality={20}
        />
      </div>
    )
  }

  // Show error state
  if (hasError) {
    return (
      <div
        className={cn(
          "bg-muted flex items-center justify-center text-muted-foreground",
          fill ? "absolute inset-0" : "",
          !fill && width && height && `w-[${width}px] h-[${height}px]`,
          className
        )}
      >
        <span className="text-sm">Failed to load image</span>
      </div>
    )
  }

  return (
    <Image
      ref={imgRef}
      src={src}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      className={cn(
        "transition-opacity duration-300",
        isLoaded ? "opacity-100" : "opacity-0",
        className
      )}
      priority={priority}
      sizes={sizes}
      quality={quality}
      onLoad={handleLoad}
      onError={handleError}
      loading={priority ? "eager" : "lazy"}
      placeholder={blurDataURL ? "blur" : "empty"}
      blurDataURL={blurDataURL}
    />
  )
}

// Hook for lazy loading any element
export function useLazyLoad<T extends HTMLElement>() {
  const elementRef = useRef<T>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    if (!elementRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        // Mobile-optimized settings
        rootMargin: '200px',
        threshold: 0.01
      }
    )

    observer.observe(elementRef.current)

    return () => observer.disconnect()
  }, [])

  return { elementRef, isInView }
}
