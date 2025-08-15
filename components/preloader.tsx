"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export function Preloader() {
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setIsLoading(false), 500)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 100)

    // Minimum loading time
    const minLoadTime = setTimeout(() => {
      setProgress(100)
    }, 2000)

    return () => {
      clearInterval(interval)
      clearTimeout(minLoadTime)
    }
  }, [])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center">
      <div className="flex flex-col items-center justify-center space-y-6">
          <div className="text-4xl font-bold text-primary">
            International Car Company Inc
          </div>
          <div className="text-lg text-muted-foreground text-center">
            Loading your premium vehicle experience...
          </div>

        {/* Loading Animation - Simple and clean */}
        <div className="relative mb-6">
            <div className="w-16 h-16 mx-auto">
              <div className="absolute inset-0 border-4 border-border rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        </div>

        {/* Progress Bar */}
          <div className="w-64 mx-auto mb-4">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
                className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <p className="text-lg font-semibold text-foreground">
            Loading Your Perfect Drive
          </p>
          <p className="text-sm text-muted-foreground">
            {progress < 30 && "Preparing inventory..."}
            {progress >= 30 && progress < 60 && "Loading vehicle details..."}
            {progress >= 60 && progress < 90 && "Optimizing experience..."}
            {progress >= 90 && "Almost ready!"}
          </p>
        </div>
      </div>
    </div>
  )
}

