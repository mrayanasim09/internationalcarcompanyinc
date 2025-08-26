// app/page.tsx

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
    <div className="min-h-screen bg-background">
      <HeroSection />

      {/* Features Section - showroom visuals */}
      <section className="py-8 md:py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3 md:mb-4">
              Why Choose <BrandNameUser className="inline" />?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We provide exceptional service and quality vehicles to ensure your complete satisfaction.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-7">
            {["Quality Vehicles","Competitive Pricing","Expert Service","Easy Contact"].map((title, index) => (
              <div key={index} className="text-center p-6 md:p-7 bg-card/70 backdrop-blur rounded-2xl border border-border shadow-sm hover:shadow-lg transition-shadow">
                <div className="mx-auto mb-4 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="w-6 h-6 rounded-full bg-primary" aria-hidden="true" />
                </div>
                <h3 className="text-primary-foreground font-semibold text-sm">
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
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
       <section className="py-8 md:py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4">
            <div className="text-center mb-10 md:mb-14">
             <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">Featured Vehicles</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">Discover our handpicked selection of premium pre-owned vehicles, each thoroughly inspected and ready for your next adventure.</p>
           </div>
          {/* Hybrid: SSR list for SEO; client component will enhance on hydration */}
           <FeaturedCarsSSR />
        </div>
      </section>

      {/* Contact CTA Section - showroom gradient */}
      <section className="py-10 md:py-14 lg:py-16 bg-gradient-to-br from-primary to-accent text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 md:mb-4">
            Ready to Find Your Perfect Vehicle?
          </h2>
          <p className="max-w-2xl mx-auto mb-6 md:mb-8 leading-relaxed">
            Contact us today to discuss your needs and schedule a viewing. Our team is here to help you find the perfect vehicle.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Button asChild size="lg" className="bg-background text-foreground hover:bg-accent px-8 py-3 rounded-xl shadow-md touch-button focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-foreground">
              <Link href="/contact">
                Contact Us
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-background text-foreground hover:bg-accent px-8 py-3 rounded-xl shadow-md touch-button focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-foreground">
              <Link href="/inventory">
                Browse Inventory
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}