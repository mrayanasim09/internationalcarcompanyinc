"use client"

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface ProductionLoaderProps {
  type?: 'card' | 'list' | 'grid' | 'hero'
  count?: number
  className?: string
}

export function ProductionLoader({ type = 'card', count = 3, className = '' }: ProductionLoaderProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'hero':
        return (
          <div className="w-full h-96 md:h-[500px] lg:h-[600px] bg-gradient-to-b from-gray-900 to-gray-800 animate-pulse">
            <div className="w-full h-full bg-gray-700 animate-pulse"></div>
          </div>
        )
      
      case 'list':
        return (
          <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Skeleton className="h-16 w-16 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        )
      
      case 'grid':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-32 w-full rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      
      default: // card
        return (
          <div className="space-y-6">
            {Array.from({ length: count }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                    ))}
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        )
    }
  }

  return (
    <div className={`w-full ${className}`}>
      {renderSkeleton()}
    </div>
  )
}

// Specialized loaders for specific use cases
export function CarPageLoader() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section Skeleton */}
      <div className="w-full h-96 md:h-[500px] lg:h-[600px] bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="w-full h-full bg-gray-700 animate-pulse"></div>
      </div>
      
      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <ProductionLoader type="card" count={2} />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function DashboardLoader() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Main Content */}
      <ProductionLoader type="card" count={2} />
    </div>
  )
}
