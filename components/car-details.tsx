"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ContactToBuy } from "@/components/contact-to-buy"
import { SimilarCars } from "@/components/similar-cars"
import { 
  Calendar, 
  MapPin, 
  Car as CarIcon, 
  Gauge
} from "lucide-react"
import type { Car } from "@/lib/types"

interface CarDetailsProps {
  car: Car
  similarCars?: Car[]
  loading?: boolean
}

export function CarDetails({ car, similarCars = [], loading = false }: CarDetailsProps) {
  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat("en-US").format(mileage)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Loading skeleton for main content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="animate-pulse">
              <div className="bg-muted h-48 sm:h-64 rounded-lg mb-4 sm:mb-6"></div>
              <div className="h-6 sm:h-8 bg-muted rounded mb-3 sm:mb-4"></div>
              <div className="h-4 sm:h-6 bg-muted rounded mb-4 sm:mb-6"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 sm:h-16 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Loading skeleton for sidebar */}
          <div className="space-y-4 sm:space-y-6">
            <div className="animate-pulse">
              <div className="h-24 sm:h-32 bg-muted rounded-lg mb-3 sm:mb-4"></div>
              <div className="h-3 sm:h-4 bg-muted rounded mb-2"></div>
              <div className="h-3 sm:h-4 bg-muted rounded mb-3 sm:mb-4"></div>
              <div className="h-8 sm:h-10 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Key Details */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Vehicle Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Year</p>
                <p className="font-semibold text-sm sm:text-base truncate">{car.year}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <CarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Make & Model</p>
                <p className="font-semibold text-sm sm:text-base truncate">{car.make} {car.model}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <Gauge className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Mileage</p>
                <p className="font-semibold text-sm sm:text-base truncate">{formatMileage(car.mileage)} mi</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Location</p>
                <p className="font-semibold text-sm sm:text-base truncate">{car.location}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Specifications */}
      {(car.engine || car.transmission || car.fuelType || car.driveType || car.exteriorColor || car.interiorColor) && (
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Technical Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {car.engine && (
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">Engine</p>
                  <p className="font-semibold text-sm sm:text-base truncate">{car.engine}</p>
                </div>
              )}
              
              {car.transmission && (
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">Transmission</p>
                  <p className="font-semibold text-sm sm:text-base truncate">{car.transmission}</p>
                </div>
              )}
              
              {car.fuelType && (
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">Fuel Type</p>
                  <p className="font-semibold text-sm sm:text-base truncate">{car.fuelType}</p>
                </div>
              )}
              
              {car.driveType && (
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">Drive Type</p>
                  <p className="font-semibold text-sm sm:text-base truncate">{car.driveType}</p>
                </div>
              )}

              {car.exteriorColor && (
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">Exterior Color</p>
                  <p className="font-semibold text-sm sm:text-base truncate">{car.exteriorColor}</p>
                </div>
              )}

              {car.interiorColor && (
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">Interior Color</p>
                  <p className="font-semibold text-sm sm:text-base truncate">{car.interiorColor}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features */}
      {Array.isArray(car.features) && car.features.length > 0 && (
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {car.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 sm:gap-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {Boolean(car.description && String(car.description).trim().length > 0) && (
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/80 leading-relaxed text-sm sm:text-base">
              {car.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Similar Cars */}
      {similarCars.length > 0 && (
        <SimilarCars cars={similarCars} currentCar={car} />
      )}
    </div>
  )
}
