"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react"
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
  }, { minSwipeDistance: 40 })

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
              className="object-cover transition-transform duration-300 group-hover:scale-105"
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
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 md:opacity-0 md:group-hover:opacity-100 min-h-[48px] min-w-[48px] flex items-center justify-center"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 md:opacity-0 md:group-hover:opacity-100 min-h-[48px] min-w-[48px] flex items-center justify-center"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Fullscreen Button */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100">
                <Maximize2 className="h-5 w-5" />
              </button>
            </DialogTrigger>
            <DialogContent 
              className="max-w-4xl w-full h-[80vh]"
              aria-describedby="fullscreen-image-dialog"
            >
              <div id="fullscreen-image-dialog" className="relative h-full">
                 {images[currentIndex] ? (
                  <Image
                    src={images[currentIndex]}
                    alt={`${carTitle} - Image ${currentIndex + 1}`}
                     fill
                     className="object-contain"
                    sizes="100vw"
                    priority={true}
                  />
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
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
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

