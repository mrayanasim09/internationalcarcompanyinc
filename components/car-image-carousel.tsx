"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"
import Image from "next/image"
import { useSwipeGestures } from '@/hooks/use-mobile-gestures'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"

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

  // Enhanced touch handling for fullscreen mode
  useEffect(() => {
    if (!isFullscreen || !fullscreenRef.current) return

    let initialDistance = 0
    let initialScale = 1
    let initialPosition = { x: 0, y: 0 }
    let lastTouchTime = 0
    let touchCount = 0
    let isZooming = false

    const handleTouchStart = (e: TouchEvent) => {
      touchCount = e.touches.length
      
      if (e.touches.length === 2) {
        // Two finger touch - pinch gesture
        e.preventDefault()
        isZooming = true
        initialDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
        initialScale = scale
      } else if (e.touches.length === 1) {
        // Single finger touch - pan gesture
        if (scale > 1) {
          e.preventDefault()
          initialPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        }
        lastTouchTime = Date.now()
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Handle pinch to zoom
        e.preventDefault()
        const distance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
        const newScale = Math.max(0.5, Math.min(3, (distance / initialDistance) * initialScale))
        setScale(newScale)
      } else if (e.touches.length === 1 && scale > 1) {
        // Handle pan when zoomed in
        e.preventDefault()
        const deltaX = e.touches[0].clientX - initialPosition.x
        const deltaY = e.touches[0].clientY - initialPosition.y
        setPosition(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }))
        initialPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        // All touches ended
        if (touchCount === 1 && scale <= 1 && !isZooming) {
          // Single tap - check for double tap
          const now = Date.now()
          if (now - lastTouchTime < 300) {
            // Double tap - zoom in/out
            if (scale === 1) {
              setScale(2)
            } else {
              resetZoom()
            }
          }
        }
        
        // Reset if scale is too small
        if (scale < 0.5) {
          setScale(1)
          setPosition({ x: 0, y: 0 })
        }
        
        touchCount = 0
        isZooming = false
      }
    }

    const element = fullscreenRef.current
    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })

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

  // Enable swipe gestures on mobile - only for navigation, not zoom
  const [swipeEnabled, setSwipeEnabled] = useState(true)
  
  useSwipeGestures(containerRef, {
    onSwipeLeft: swipeEnabled ? nextImage : () => {},
    onSwipeRight: swipeEnabled ? prevImage : () => {},
  }, { minSwipeDistance: 50 })

  return (
    <div className="w-full h-full carousel-container overflow-hidden touch-no-select">
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
              onLoad={() => setImageError(false)}
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
                onTouchStart={(e) => {
                  e.stopPropagation()
                  setSwipeEnabled(false)
                }}
                onTouchEnd={() => {
                  setTimeout(() => setSwipeEnabled(true), 100)
                }}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  prevImage()
                }}
                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 bg-black/80 hover:bg-black text-white p-3 sm:p-4 rounded-full transition-all duration-150 min-h-[56px] min-w-[56px] flex items-center justify-center z-40 touch-manipulation shadow-lg"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
              </button>
              <button
                onTouchStart={(e) => {
                  e.stopPropagation()
                  setSwipeEnabled(false)
                }}
                onTouchEnd={() => {
                  setTimeout(() => setSwipeEnabled(true), 100)
                }}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  nextImage()
                }}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 bg-black/80 hover:bg-black text-white p-3 sm:p-4 rounded-full transition-all duration-150 min-h-[56px] min-w-[56px] flex items-center justify-center z-40 touch-manipulation shadow-lg"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
              </button>
            </>
          )}

          {/* Fullscreen Button - Primary trigger */}
          <button 
            className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-black/70 hover:bg-black/90 text-white p-2 sm:p-3 rounded-full transition-all duration-150 min-h-[40px] min-w-[40px] flex items-center justify-center z-30 touch-manipulation"
            aria-label="Open fullscreen"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleFullscreenChange(true)
            }}
          >
            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>

          {/* Image Counter */}
          <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-black/70 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm z-20">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Tap anywhere to fullscreen - Lower z-index, excludes buttons */}
          <div 
            className="absolute inset-0 w-full h-full z-10 cursor-pointer"
            onClick={(e) => {
              // Only trigger if not clicking on navigation buttons or fullscreen button
              const target = e.target as HTMLElement
              const clickedButton = target.closest('button')
              if (clickedButton) {
                return // Let the button handle its own click
              }
              handleFullscreenChange(true)
            }}
            onTouchStart={(e) => {
              // Prevent interference on mobile
              const target = e.target as HTMLElement
              const touchedButton = target.closest('button')
              if (touchedButton) {
                e.stopPropagation()
              }
            }}
          />
        </div>
      </div>

      {/* Fullscreen Modal - Single instance */}
      <Dialog open={isFullscreen} onOpenChange={handleFullscreenChange}>
        <DialogContent 
          className="fixed inset-0 w-screen h-screen max-w-none p-0 border-0 bg-black z-[9999] flex items-center justify-center"
          aria-describedby="fullscreen-image-dialog"
        >
          <DialogTitle className="sr-only">Car Image Fullscreen View</DialogTitle>
          <DialogDescription className="sr-only">Fullscreen view of car images with zoom and navigation controls</DialogDescription>
              <div 
                id="fullscreen-image-dialog" 
                className="relative h-full w-full overflow-hidden flex items-center justify-center touch-pan-x touch-pan-y"
                ref={fullscreenRef}
              >
                {images[currentIndex] ? (
                  <div className="relative h-full w-full flex items-center justify-center">
                    <Image
                      src={images[currentIndex]}
                      alt={`${carTitle} - Image ${currentIndex + 1}`}
                      fill
                      className="object-contain select-none fullscreen-image"
                      sizes="100vw"
                      priority={true}
                      onError={() => setImageError(true)}
                      onLoad={() => setImageError(false)}
                      style={{
                        transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                        transition: scale === 1 ? 'transform 0.2s ease-out' : 'none',
                        touchAction: 'none'
                      }}
                    />
                    
                    {/* Zoom Controls */}
                    <div className="absolute top-4 left-4 flex gap-2 z-30">
                      <button
                        onTouchStart={(e) => e.stopPropagation()}
                        onClick={handleZoomIn}
                        className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all duration-150 min-h-[40px] min-w-[40px] flex items-center justify-center touch-manipulation"
                        aria-label="Zoom in"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </button>
                      <button
                        onTouchStart={(e) => e.stopPropagation()}
                        onClick={handleZoomOut}
                        className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all duration-150 min-h-[40px] min-w-[40px] flex items-center justify-center touch-manipulation"
                        aria-label="Zoom out"
                      >
                        <ZoomOut className="h-4 w-4" />
                      </button>
                      {scale !== 1 && (
                        <button
                          onTouchStart={(e) => e.stopPropagation()}
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
                          onTouchStart={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            prevImage()
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/80 hover:bg-black text-white p-4 rounded-full transition-all duration-150 min-h-[56px] min-w-[56px] flex items-center justify-center z-50 touch-manipulation shadow-lg"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="h-7 w-7" />
                        </button>
                        <button
                          onTouchStart={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            nextImage()
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/80 hover:bg-black text-white p-4 rounded-full transition-all duration-150 min-h-[56px] min-w-[56px] flex items-center justify-center z-50 touch-manipulation shadow-lg"
                          aria-label="Next image"
                        >
                          <ChevronRight className="h-7 w-7" />
                        </button>
                      </>
                    )}
                    
                    {/* Close button */}
                    <button
                      onTouchStart={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleFullscreenChange(false)
                      }}
                      className="absolute top-4 right-4 bg-black/80 hover:bg-black text-white p-3 rounded-full transition-all duration-150 min-h-[48px] min-w-[48px] flex items-center justify-center z-50 touch-manipulation shadow-lg"
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
                        Pinch to zoom • Double-tap to zoom • Swipe to navigate
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

