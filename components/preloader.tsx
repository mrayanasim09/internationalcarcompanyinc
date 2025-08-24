"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

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

        {/* Loading Animation - Logo with pulse effect */}
        <div className="relative mb-6">
            <div className="w-20 h-20 md:w-24 md:h-24 mx-auto loading-logo">
                      <Image
          src="/prestige-auto-sales-logo.png"
          alt="Prestige Auto Sales LLC Logo" 
                fill 
                className="object-contain animate-pulse" 
                priority 
                sizes="(max-width: 768px) 80px, 96px" 
              />
            </div>
        </div>

        {/* Progress Bar */}
          <div className="w-64 mx-auto mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={cn(
                  "h-2 bg-primary rounded-full transition-all duration-300 ease-out",
                  progress <= 10 && "w-[10%]",
                  progress > 10 && progress <= 20 && "w-[20%]",
                  progress > 20 && progress <= 30 && "w-[30%]",
                  progress > 30 && progress <= 40 && "w-[40%]",
                  progress > 40 && progress <= 50 && "w-[50%]",
                  progress > 50 && progress <= 60 && "w-[60%]",
                  progress > 60 && progress <= 70 && "w-[70%]",
                  progress > 70 && progress <= 80 && "w-[80%]",
                  progress > 80 && progress <= 90 && "w-[90%]",
                  progress > 90 && "w-full"
                )}
              />
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

