"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Maximize2, ZoomIn } from "lucide-react"
import Image from "next/image"
import { useRef, useEffect } from 'react'
import { useSwipeGestures } from '@/hooks/use-mobile-gestures'
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

interface CarImageCarouselProps {
  images: string[]
  carTitle: string
}

export function CarImageCarousel({ images, carTitle }: CarImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageError, setImageError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    setImageError(false)
  }

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
    setImageError(false)
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
    setImageError(false)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  // Enable swipe gestures on mobile
  useSwipeGestures(containerRef, {
    onSwipeLeft: nextImage,
    onSwipeRight: prevImage,
  }, { minSwipeDistance: 30 })

  return (
    <div className="w-full h-full carousel-container">
      {/* Main Image */}
      <div className="relative group w-full h-full" ref={containerRef}>
        <div className="relative w-full h-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          {!imageError && images[currentIndex] ? (
            <Image
              src={images[currentIndex]}
              alt={`${carTitle} - Image ${currentIndex + 1}`}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 800px, 1000px"
              onError={handleImageError}
              priority={currentIndex === 0}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
              <div className="text-center">
                <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">No Image Available</div>
                <div className="text-gray-400 dark:text-gray-500 text-sm">{carTitle}</div>
              </div>
            </div>
          )}
          
          {/* Navigation Arrows - Always visible on mobile, faster transitions */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 sm:p-3 rounded-full transition-all duration-150 md:opacity-0 md:group-hover:opacity-100 min-h-[44px] min-w-[44px] flex items-center justify-center z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 sm:p-3 rounded-full transition-all duration-150 md:opacity-0 md:group-hover:opacity-100 min-h-[44px] min-w-[44px] flex items-center justify-center z-10"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </>
          )}

          {/* Fullscreen Button - Always visible on mobile */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all duration-150 opacity-100 md:opacity-0 md:group-hover:opacity-100 z-10">
                <ZoomIn className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </DialogTrigger>
            <DialogContent 
              className="max-w-[95vw] w-full h-[90vh] sm:max-w-4xl sm:h-[80vh] p-0"
              aria-describedby="fullscreen-image-dialog"
            >
              <div id="fullscreen-image-dialog" className="relative h-full w-full">
                {images[currentIndex] ? (
                  <div className="relative h-full w-full">
                    <Image
                      src={images[currentIndex]}
                      alt={`${carTitle} - Image ${currentIndex + 1}`}
                      fill
                      className="object-contain"
                      sizes="100vw"
                      priority={true}
                    />
                    {/* Navigation in fullscreen */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-150 min-h-[48px] min-w-[48px] flex items-center justify-center"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-150 min-h-[48px] min-w-[48px] flex items-center justify-center"
                          aria-label="Next image"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>
                      </>
                    )}
                    {/* Image counter in fullscreen */}
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      {currentIndex + 1} / {images.length}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                    <div className="text-center">
                      <div className="text-gray-500 dark:text-gray-400 text-lg">No Image Available</div>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Image Counter */}
          <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-black/70 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </div>

      {/* Thumbnail Navigation - Improved for mobile */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2 mt-2 px-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`flex-shrink-0 w-16 h-12 sm:w-20 sm:h-16 rounded-lg overflow-hidden border-2 transition-all duration-150 ${
                index === currentIndex
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
              }`}
            >
              <Image
                src={image}
                alt={`${carTitle} - Thumbnail ${index + 1}`}
                width={80}
                height={64}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

