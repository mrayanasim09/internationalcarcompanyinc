// app/page.tsx

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { BrandNameUser } from "@/components/brand-name-user"
// CSS animation utilities are used to avoid client boundary issues
import { FeaturedCarsSSR } from "@/components/featured-cars-ssr"
import Link from "next/link"
import { Button } from "@/components/ui/button"
// import Image from "next/image"


// Client enhancer is disabled; using SSR FeaturedCars for SEO and simplicity



export default function HomePage() {
  return (
    <div className="icc-theme min-h-screen bg-background">
      <Navbar />
      
      <HeroSection />

      {/* Features Section - tighter mobile spacing */}
      <section className="py-6 md:py-8 lg:py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose <BrandNameUser className="inline" />?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide exceptional service and quality vehicles to ensure your complete satisfaction.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {["Quality Vehicles","Competitive Pricing","Expert Service","Easy Contact"].map((title, index) => (
              <div key={index} className="text-center p-6 bg-card rounded-xl border border-border card-hover">
                <div className="mx-auto mb-4 w-8 h-8 rounded-full bg-primary" aria-hidden="true" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {title === 'Quality Vehicles' && 'Carefully selected pre-owned vehicles with detailed history reports.'}
                  {title === 'Competitive Pricing' && 'Fair and transparent pricing with no hidden fees.'}
                  {title === 'Expert Service' && 'Professional team dedicated to finding your perfect vehicle.'}
                  {title === 'Easy Contact' && 'Multiple ways to reach us: Phone, SMS, WhatsApp, and Email.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars - live data */}
       <section className="py-6 md:py-8 lg:py-12 bg-background">
        <div className="container mx-auto px-4">
            <div className="text-center mb-8 md:mb-12">
             <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">Featured Vehicles</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Discover our handpicked selection of premium pre-owned vehicles, each thoroughly inspected and ready for your next adventure.</p>
           </div>
          {/* Hybrid: SSR list for SEO; client component will enhance on hydration */}
           <FeaturedCarsSSR />
        </div>
      </section>

      {/* Contact CTA Section - accessible contrast */}
      <section className="py-6 md:py-8 lg:py-12 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Your Perfect Vehicle?
          </h2>
          <p className="max-w-2xl mx-auto mb-6 md:mb-8">
            Contact us today to discuss your needs and schedule a viewing. Our team is here to help you find the perfect vehicle.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Button asChild size="lg" className="bg-background text-foreground hover:bg-accent px-8 py-3 touch-button focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-foreground">
              <Link href="/contact">
                Contact Us
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-background text-foreground hover:bg-accent px-8 py-3 touch-button focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-foreground">
              <Link href="/inventory">
                Browse Inventory
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}