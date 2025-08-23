"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"
import Image from "next/image"
import { useSwipeGestures } from '@/hooks/use-mobile-gestures'
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

interface CarImageCarouselProps {
  images: string[]
  carTitle: string
  onFullscreenChange?: (isFullscreen: boolean) => void
}

export function CarImageCarousel({ images, carTitle, onFullscreenChange }: CarImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageError, setImageError] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const fullscreenRef = useRef<HTMLDivElement>(null)

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    setImageError(false)
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
    setImageError(false)
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
    setImageError(false)
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const handleZoomIn = () => {
    setScale(prev => Math.min(3, prev + 0.5))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.5))
  }

  const resetZoom = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleFullscreenChange = (open: boolean) => {
    setIsFullscreen(open)
    onFullscreenChange?.(open)
  }

  // Handle pinch to zoom in fullscreen
  useEffect(() => {
    if (!isFullscreen || !fullscreenRef.current) return

    let initialDistance = 0
    let initialScale = 1
    let initialPosition = { x: 0, y: 0 }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        initialDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
        initialScale = scale
      } else if (e.touches.length === 1) {
        initialPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      
      if (e.touches.length === 2) {
        const distance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
        const newScale = Math.max(0.5, Math.min(3, (distance / initialDistance) * initialScale))
        setScale(newScale)
      } else if (e.touches.length === 1 && scale > 1) {
        const deltaX = e.touches[0].clientX - initialPosition.x
        const deltaY = e.touches[0].clientY - initialPosition.y
        setPosition(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }))
        initialPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      }
    }

    const handleTouchEnd = () => {
      if (scale < 1) {
        setScale(1)
        setPosition({ x: 0, y: 0 })
      }
    }

    const element = fullscreenRef.current
    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd)

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isFullscreen, scale])

  // Handle keyboard navigation in fullscreen
  useEffect(() => {
    if (!isFullscreen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          prevImage()
          break
        case 'ArrowRight':
          nextImage()
          break
        case 'Escape':
          handleFullscreenChange(false)
          break
        case '+':
        case '=':
          handleZoomIn()
          break
        case '-':
          handleZoomOut()
          break
        case '0':
          resetZoom()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  // Enable swipe gestures on mobile
  useSwipeGestures(containerRef, {
    onSwipeLeft: nextImage,
    onSwipeRight: prevImage,
  }, { minSwipeDistance: 30 })

  return (
    <div className="w-full h-full carousel-container overflow-hidden">
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
          
          {/* Navigation Arrows - Always visible, improved touch targets */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 sm:p-4 rounded-full transition-all duration-150 min-h-[48px] min-w-[48px] flex items-center justify-center z-20 touch-manipulation"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 sm:p-4 rounded-full transition-all duration-150 min-h-[48px] min-w-[48px] flex items-center justify-center z-20 touch-manipulation"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </>
          )}

          {/* Tap to Fullscreen - Click anywhere on image */}
          <Dialog open={isFullscreen} onOpenChange={handleFullscreenChange}>
            <DialogTrigger asChild>
              <button className="absolute inset-0 w-full h-full bg-transparent z-10 touch-manipulation" aria-label="Open fullscreen view">
                <span className="sr-only">Click to view fullscreen</span>
              </button>
            </DialogTrigger>
            <DialogContent 
              className="fixed inset-0 w-screen h-screen max-w-none p-0 border-0 bg-black z-[9999] flex items-center justify-center"
              aria-describedby="fullscreen-image-dialog"
            >
              <div 
                id="fullscreen-image-dialog" 
                className="relative h-full w-full overflow-hidden flex items-center justify-center"
                ref={fullscreenRef}
              >
                {images[currentIndex] ? (
                  <div className="relative h-full w-full flex items-center justify-center">
                    <Image
                      src={images[currentIndex]}
                      alt={`${carTitle} - Image ${currentIndex + 1}`}
                      fill
                      className="object-contain"
                      sizes="100vw"
                      priority={true}
                      style={{
                        transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                        transition: scale === 1 ? 'transform 0.2s ease-out' : 'none'
                      }}
                    />
                    
                    {/* Zoom Controls */}
                    <div className="absolute top-4 left-4 flex gap-2 z-30">
                      <button
                        onClick={handleZoomIn}
                        className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all duration-150 min-h-[40px] min-w-[40px] flex items-center justify-center touch-manipulation"
                        aria-label="Zoom in"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleZoomOut}
                        className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all duration-150 min-h-[40px] min-w-[40px] flex items-center justify-center touch-manipulation"
                        aria-label="Zoom out"
                      >
                        <ZoomOut className="h-4 w-4" />
                      </button>
                      {scale !== 1 && (
                        <button
                          onClick={resetZoom}
                          className="bg-black/60 hover:bg-black/80 text-white px-3 py-2 rounded-full transition-all duration-150 min-h-[40px] flex items-center justify-center touch-manipulation text-sm"
                          aria-label="Reset zoom"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                    
                    {/* Navigation in fullscreen */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-150 min-h-[48px] min-w-[48px] flex items-center justify-center z-30 touch-manipulation"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-150 min-h-[48px] min-w-[48px] flex items-center justify-center z-30 touch-manipulation"
                          aria-label="Next image"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>
                      </>
                    )}
                    
                    {/* Close button */}
                    <button
                      onClick={() => handleFullscreenChange(false)}
                      className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all duration-150 min-h-[44px] min-w-[44px] flex items-center justify-center z-30 touch-manipulation"
                      aria-label="Close fullscreen"
                    >
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    {/* Image counter in fullscreen */}
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm z-30">
                      {currentIndex + 1} / {images.length}
                    </div>
                    
                    {/* Zoom instructions */}
                    {scale === 1 && (
                      <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm z-30">
                        Pinch to zoom • Swipe to navigate • Use +/- keys
                      </div>
                    )}
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
          <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-black/70 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm z-20">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </div>

      {/* Thumbnail Navigation - Improved for mobile */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2 mt-2 px-2 scrollbar-hide">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`flex-shrink-0 w-16 h-12 sm:w-20 sm:h-16 rounded-lg overflow-hidden border-2 transition-all duration-150 touch-manipulation ${
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

