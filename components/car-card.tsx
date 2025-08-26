"use client"

import { useState, useEffect, memo, useCallback, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { LazyImage } from '@/components/lazy-image'
import { 
  Car as CarIcon, 
  MapPin, 
  Calendar
} from 'lucide-react'
import type { Car } from "@/lib/types"

interface CarCardProps {
  car: Car
  priority?: boolean
}

export const CarCard = memo(function CarCard({ car, priority = false }: CarCardProps) {
  // Memoize car ID to prevent unnecessary re-renders
  const carId = useMemo(() => car?.id, [car?.id])
  
  const [userRating, setUserRating] = useState<number>(() => {
    if (typeof window !== "undefined" && carId) {
      try {
        const saved = localStorage.getItem(`car-rating-${carId}`)
        return saved ? Number(saved) : car.rating || 0
      } catch (error) {
        console.warn('Failed to read from localStorage:', error)
        return car.rating || 0
      }
    }
    return car?.rating || 0
  })

  // Update rating when car changes
  useEffect(() => {
    if (carId && car?.rating !== undefined) {
      setUserRating(car.rating)
    }
  }, [carId, car?.rating])

  // Save rating to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && carId && userRating !== undefined) {
      try {
        localStorage.setItem(`car-rating-${carId}`, String(userRating))
      } catch (error) {
        console.warn('Failed to save to localStorage:', error)
      }
    }
  }, [carId, userRating])

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price)
  }, [])

  // Add safety checks for car data
  if (!car || !carId) {
    console.error('CarCard: Invalid car data received:', car)
    return null
  }

  // Generate title from car data
  const carTitle = car.title || `${car.year} ${car.make} ${car.model}`

  return (
    <div className="group hover:shadow-xl transition-all duration-300 overflow-hidden bg-card/70 backdrop-blur border border-border rounded-2xl touch-card hover:-translate-y-1 active:scale-95 touch-manipulation touch-feedback">
      <Link href={`/car/${carId}`} className="block" aria-label={`View details for ${carTitle}`}>
        <div className="relative aspect-video">
          {car.images && car.images[0] && typeof car.images[0] === 'string' ? (
            <LazyImage
              src={car.images[0] as string}
              alt={`${carTitle} - ${car.year || 'N/A'} ${car.make || 'N/A'} ${car.model || 'N/A'}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              quality={75}
            />
          ) : (
            <LazyImage
              src="/optimized/placeholder.webp"
              alt={`${carTitle} - ${car.year || 'N/A'} ${car.make || 'N/A'} ${car.model || 'N/A'}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              quality={75}
            />
          )}

          {/* Price Badge */}
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground font-bold text-sm shadow-md" aria-label={`Price: ${formatPrice(car.price || 0)}`}>
            {formatPrice(car.price || 0)}
          </Badge>

          {/* Featured Badge */}
          {car.isFeatured === true && (
            <Badge
              variant="warning"
              className="absolute top-2 right-2 font-bold text-xs"
              aria-label="Featured vehicle"
            >
              Featured
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Title and Basic Info */}
          <div>
            <h3 className="font-semibold text-lg line-clamp-2 mb-2">
              <Link href={`/car/${carId}`} className="hover:text-primary transition-colors" aria-label={`View details for ${carTitle}`}>
                {carTitle}
              </Link>
            </h3>
            
            {/* Car Details - Single Line for Mobile */}
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-3" role="list" aria-label="Vehicle specifications">
              <div className="flex items-center gap-1" role="listitem">
                <Calendar className="h-3 w-3" aria-hidden="true" />
                <span>{car.year || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1" role="listitem">
                <CarIcon className="h-3 w-3" aria-hidden="true" />
                <span>{(car.mileage || 0).toLocaleString()} mi</span>
              </div>
              <div className="flex items-center gap-1" role="listitem">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                <span className="truncate max-w-[100px]">{car.location || 'Harbor City, CA'}</span>
              </div>
            </div>
          </div>

          {/* Simple metadata row */}
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>{car.make || 'N/A'} {car.model || 'N/A'}</span>
            <span>{car.year || 'N/A'}</span>
          </div>
          
          {/* Single button for full details */}
          <Link href={`/car/${carId}`} className="block">
            <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm py-3 min-h-[48px] touch-manipulation" aria-label={`See full details for ${carTitle}`}>
              See Full Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </div>
  )
})
