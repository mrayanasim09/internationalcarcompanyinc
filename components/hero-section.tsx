"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { BrandName } from "@/components/brand-name"
import { Car, Phone } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-[60vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Mobile Optimization */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/optimized/placeholder.webp"
          alt="Car dealership background"
          fill
          className="object-cover opacity-25 scale-105"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background"></div>
        {/* subtle radial spotlight */}
        <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_60%)] bg-gradient-to-tr from-primary/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto bg-card/70 backdrop-blur-xl rounded-3xl border border-border p-5 md:p-8 shadow-xl">
          {/* Logo Image */}
          <div className="flex justify-center mb-6">
            <div className="relative w-28 h-24 md:w-32 md:h-28">
              <Image src="/prestige-auto-sales-logo.png" alt="Prestige Auto Sales LLC Logo" fill className="object-contain" priority sizes="(max-width: 768px) 112px, 128px" />
            </div>
          </div>
          
          {/* Main Heading - Mobile First */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-3 md:mb-5 leading-tight">
            Welcome to <BrandName className="inline" />
          </h1>
          
          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-foreground/80 mb-5 md:mb-7 max-w-2xl mx-auto leading-relaxed">
            Discover premium pre-owned vehicles, transparent pricing, and exceptional service—all in one place.
          </p>

          {/* CTA Buttons - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-5 md:mb-7">
            <Link href="/inventory">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-base font-semibold rounded-xl transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 touch-button hover:scale-[1.02]"
                aria-label="Browse our vehicle inventory"
              >
                <Car className="w-4 h-4 mr-2" aria-hidden="true" />
                Browse Inventory
              </Button>
            </Link>
            
            <Link href="/contact">
              <Button 
                size="lg"
                className="w-full sm:w-auto bg-background text-foreground hover:bg-accent px-8 py-4 text-base font-semibold rounded-xl transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 touch-button hover:scale-[1.02]"
                aria-label="Contact us for assistance"
              >
                <Phone className="w-4 h-4 mr-2" aria-hidden="true" />
                Contact Us
              </Button>
            </Link>
          </div>

          {/* Feature Icons - Mobile Responsive */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-center space-x-3 bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-3">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center" aria-hidden="true" />
              <div className="text-left">
                <h2 className="text-primary-foreground font-semibold text-sm">Quality Vehicles</h2>
                <p className="text-muted-foreground text-xs">Thoroughly inspected and certified pre-owned cars</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-3 bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-3">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center" aria-hidden="true" />
              <div className="text-left">
                <h2 className="text-primary-foreground font-semibold text-sm">Competitive Pricing</h2>
                <p className="text-muted-foreground text-xs">Best value for your money with transparent pricing</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-3 bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-3">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center" aria-hidden="true" />
              <div className="text-left">
                <h2 className="text-primary-foreground font-semibold text-sm">Expert Service</h2>
                <p className="text-muted-foreground text-xs">Professional team dedicated to your satisfaction</p>
              </div>
            </div>
          </div>

          {/* Trust Indicators - Mobile Optimized */}
          <div className="flex flex-wrap justify-center items-center gap-3 md:gap-6 text-muted-foreground text-xs mt-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-2" aria-hidden="true"></div>
              <span>BBB Accredited</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-2" aria-hidden="true"></div>
              <span>Financing Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-2" aria-hidden="true"></div>
              <span>Warranty Included</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
