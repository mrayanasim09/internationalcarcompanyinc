"use client"

import { useState, useEffect } from 'react'
import { CarDetails } from '@/components/car-details'
import { CarImageCarousel } from '@/components/car-image-carousel'
import { ContactToBuy } from '@/components/contact-to-buy'
import { CarPageLoader } from '@/components/ui/production-loader'
import { ErrorDisplay } from '@/components/ui/error-display'
import type { Car } from '@/lib/types'
import Script from 'next/script'

interface CarPageClientProps {
  carId: string
}

// Escape JSON-LD to avoid XSS/script breakouts
function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/<\/script/gi, '<\\/script')
}

export function CarPageClient({ carId }: CarPageClientProps) {
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('DEBUG: CarPageClient fetching car with ID:', carId)
        const response = await fetch(`/api/car/${carId}`)
        
        console.log('DEBUG: CarPageClient response status:', response.status)
        console.log('DEBUG: CarPageClient response ok:', response.ok)
        
        if (!response.ok) {
          if (response.status === 404) {
            console.log('DEBUG: CarPageClient - Car not found')
            setError('Car not found')
          } else {
            console.log('DEBUG: CarPageClient - Request failed with status:', response.status)
            
            // Try to get error details from response
            let errorMessage = `Failed to fetch car: ${response.status}`
            try {
              const errorData = await response.json()
              console.log('DEBUG: CarPageClient error response:', errorData)
              if (errorData.error) {
                errorMessage = errorData.error
              }
              if (errorData.details) {
                errorMessage += ` - ${errorData.details}`
              }
            } catch (parseError) {
              console.log('DEBUG: CarPageClient could not parse error response')
            }
            
            setError(errorMessage)
          }
          return
        }

        const carData = await response.json()
        console.log('DEBUG: CarPageClient received car data:', { id: carData.id, title: carData.title })
        setCar(carData)
      } catch (err) {
        console.error('DEBUG: CarPageClient error fetching car:', err)
        setError(err instanceof Error ? err.message : 'Failed to load car')
      } finally {
        setLoading(false)
      }
    }

    if (carId) {
      fetchCar()
    }
  }, [carId])

  if (loading) {
    return <CarPageLoader />
  }

  if (error) {
    return (
      <ErrorDisplay 
        title="Error Loading Car"
        message="Failed to load vehicle information. Please try again later."
        error={error}
      />
    )
  }

  if (!car) {
    return (
      <ErrorDisplay 
        title="Car Not Found"
        message="The requested vehicle could not be found."
        error="Car not found"
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Main Image - Reduced height on mobile */}
      <div className="relative w-full h-48 sm:h-64 md:h-[500px] lg:h-[600px] bg-gradient-to-b from-gray-900 to-gray-800">
        <CarImageCarousel images={car.images || []} title={car.title} />
        
        {/* Hero Content Overlay - Improved mobile layout */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-lg sm:text-xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2 leading-tight">
              {car.title}
            </h1>
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 md:gap-4 text-white/90">
              <span className="text-xs sm:text-sm md:text-lg lg:text-xl">{car.year}</span>
              <span className="text-xs sm:text-sm md:text-lg lg:text-xl">{car.make}</span>
              <span className="text-xs sm:text-sm md:text-lg lg:text-xl">{car.model}</span>
              {car.price && (
                <span className="text-sm sm:text-lg md:text-xl lg:text-3xl font-bold text-green-400">
                  ${car.price.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Improved mobile layout */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {/* Main Content - 2/3 width on large screens */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8">
            <CarDetails car={car} />
          </div>
          
          {/* Sidebar - 1/3 width on large screens, full width on mobile */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            {/* Contact Section */}
            <div className="lg:sticky lg:top-8">
              <ContactToBuy car={car} />
            </div>
            
            {/* VIN Information */}
            {car.vin && (
              <div className="bg-card border rounded-lg p-3 sm:p-4 md:p-6">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-3 md:mb-4">Vehicle Information</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">VIN</p>
                    <p className="font-mono text-xs sm:text-sm break-all">{car.vin}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      
      <Script
        id="car-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "Car",
            "name": car.title,
            "brand": {
              "@type": "Brand",
              "name": car.make
            },
            "model": car.model,
            "vehicleModelDate": car.year,
            "mileageFromOdometer": {
              "@type": "QuantitativeValue",
              "value": car.mileage,
              "unitCode": "SMI"
            },
            "offers": {
              "@type": "Offer",
              "price": car.price,
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            }
          })
        }}
      />
    </div>
  )
}
