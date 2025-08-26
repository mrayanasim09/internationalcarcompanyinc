"use client"

import { Skeleton } from "@/components/ui/skeleton"

interface CarLoaderProps {
  size?: number
  className?: string
}

export function CarLoader({ size = 200 }: CarLoaderProps) {
  const sizeClass = size <= 100 ? 'w-24 h-24' : size <= 200 ? 'w-48 h-48' : 'w-96 h-96'
  
  return (
    <Skeleton className={sizeClass} />
  )
}

interface CarGridSkeletonProps {
  count?: number
  className?: string
}

export function CarGridSkeleton({ count = 6, className }: CarGridSkeletonProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className || ''}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton className="w-full h-48 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}


