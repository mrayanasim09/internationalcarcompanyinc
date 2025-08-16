"use client"

import { cn } from "@/lib/utils"

interface CarLoaderProps {
  size?: number
  className?: string
}

export function CarLoader({ size = 64, className }: CarLoaderProps) {
  return (
    <div className={cn("animate-spin rounded-full border-4 border-gray-200 border-t-primary", className)} 
         style={{ width: size, height: size }} />
  )
}

export function CarCardSkeleton() {
  return (
    <div className="animate-pulse bg-card/70 backdrop-blur border border-border rounded-2xl overflow-hidden">
      <div className="aspect-video bg-gray-200 dark:bg-gray-700"></div>
      <div className="p-4 space-y-3">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="flex items-center justify-between text-sm">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
        </div>
      </div>
    </div>
  )
}

export function CarGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CarCardSkeleton key={i} />
      ))}
    </div>
  )
}


