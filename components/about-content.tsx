"use client"
import { Card, CardContent } from "@/components/ui/card"
import { BrandNameUser } from "@/components/brand-name-user"
import { Badge } from "@/components/ui/badge"
import { Users, Award, Shield, Heart, Star, CheckCircle, MapPin, Phone, Mail } from "lucide-react"
// Subtle CSS animations are used for performance and to avoid client boundary issues
import { cn } from "@/lib/utils"

export function AboutContent() {
  const stats = [
    { label: "Years in Business", value: "15+", icon: Award },
    { label: "Cars Sold", value: "5,000+", icon: Star },
    { label: "Happy Customers", value: "4,800+", icon: Heart },
    { label: "Team Members", value: "25+", icon: Users },
  ]

  const values = [
    {
      title: "Quality Assurance",
      description: "Every vehicle undergoes a comprehensive 150-point inspection before being offered for sale.",
      icon: Shield,
    },
    {
      title: "Transparent Pricing",
      description: "No hidden fees, no surprises. Our prices are competitive and clearly displayed.",
      icon: CheckCircle,
    },
    {
      title: "Customer First",
      description: "Your satisfaction is our priority. We&apos;re here to help you find the perfect vehicle.",
      icon: Heart,
    },
    {
      title: "Expert Team",
      description: "Our experienced team has the knowledge to guide you through every step of your purchase.",
      icon: Users,
    },
  ]

  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative bg-background py-10 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-foreground animate-fade-in">
            About <BrandNameUser className="inline" />
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 text-muted-foreground max-w-3xl mx-auto animate-fade-in animate-delay-80">
            We are committed to providing exceptional service and quality vehicles to our customers.
          </p>
          <div className="animate-fade-in animate-delay-140">
            <Badge className="bg-primary text-primary-foreground px-4 md:px-6 py-2 text-base md:text-lg">15+ Years of Excellence</Badge>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 md:py-14 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <div key={index} className={cn(
                  "animate-slide-up",
                  index === 0 && "animate-delay-0",
                  index === 1 && "animate-delay-60",
                  index === 2 && "animate-delay-120",
                  index === 3 && "animate-delay-180",
                  index === 4 && "animate-delay-240",
                  index === 5 && "animate-delay-300"
                )}>
                <Card className="text-center bg-card border-border">
                  <CardContent className="p-4 md:p-6">
                    <IconComponent className="h-6 w-6 md:h-8 md:w-8 text-primary mx-auto mb-3 md:mb-4" />
                    <div className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">{stat.value}</div>
                    <p className="text-sm md:text-base text-muted-foreground font-medium">{stat.label}</p>
                  </CardContent>
                </Card>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-8 md:py-14 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 md:mb-6">Our Story</h2>
            <div className="space-y-4 md:space-y-6 text-muted-foreground text-base md:text-lg leading-relaxed">
              <p><BrandNameUser className="inline" /> has been committed to a showroom-quality experience with corporate-level service standards, ensuring every customer feels confident and informed.</p>
              <p>We combine transparent pricing with rigorous multi-point inspections and a curated inventory, so our customers spend less time searching and more time driving.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-8 md:py-14 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 md:mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
              These core principles guide everything we do and ensure every customer has an exceptional experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon
              return (
                <Card key={index} className="text-center h-full bg-card border-border">
                  <CardContent className="p-4 md:p-6">
                    <IconComponent className="h-10 w-10 md:h-12 md:w-12 text-primary mx-auto mb-3 md:mb-4" />
                    <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">{value.title}</h3>
                    <p className="text-sm md:text-base text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Location & Contact Section */}
      <section className="py-8 md:py-14 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 md:mb-4">Visit Our Office</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
              Come see us in person and experience the <BrandNameUser className="inline" /> difference.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
            <Card className="text-center bg-card/70 backdrop-blur border border-border rounded-2xl">
              <CardContent className="p-4 md:p-6">
                <MapPin className="h-10 w-10 md:h-12 md:w-12 text-primary mx-auto mb-3 md:mb-4" />
                <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">Our Location</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  24328 S Vermont Ave Suite #215<br/>Harbor City, CA 90710
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-card/70 backdrop-blur border border-border rounded-2xl">
              <CardContent className="p-4 md:p-6">
                <Phone className="h-10 w-10 md:h-12 md:w-12 text-primary mx-auto mb-3 md:mb-4" />
                <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">Call Us</h3>
                <div className="space-y-2 text-sm md:text-base text-muted-foreground">
                  <p className="font-medium">Mobile: +1 310-350-7709</p>
                  <p className="font-medium">Landline: +1 424-250-9663</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-card/70 backdrop-blur border border-border rounded-2xl">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col items-center">
                  <Mail className="h-10 w-10 md:h-12 md:w-12 text-primary mb-3 md:mb-4" />
                  <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">Email Us</h3>
                  <p className="text-sm md:text-base text-muted-foreground text-center break-all">
                    info@internationalcarcompanyinc.com
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 md:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Ready to Find Your Perfect Car?</h2>
          <p className="text-lg md:text-xl mb-6 md:mb-8">
            Browse our inventory or visit our showroom to experience the <BrandNameUser className="inline" /> difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <a
              href="/inventory"
              className="bg-white text-primary px-6 md:px-8 py-2 md:py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm md:text-base"
            >
              Browse Inventory
            </a>
              <a
              href="/contact"
              className="border-2 border-white text-white px-6 md:px-8 py-2 md:py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors text-sm md:text-base"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
