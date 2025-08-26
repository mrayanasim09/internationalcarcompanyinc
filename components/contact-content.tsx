"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { useToast } from "@/components/ui/use-toast"
import { MapPin, Mail, Clock, Send, Car, CreditCard, Wrench, Phone, MessageSquare } from "lucide-react"
import { sanitizeEmail, sanitizePhone, sanitizeFormData } from '@/lib/security/input-sanitizer'
import { getCSRFTokenForForm } from '@/lib/security/csrf'

export function ContactContent() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Get CSRF token for form
  const { signedToken: csrfToken } = getCSRFTokenForForm()

  // Validation functions with sanitization
  const validateEmail = (email: string): boolean => {
    const sanitized = sanitizeEmail(email)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(sanitized)
  }

  const validatePhone = (phone: string): boolean => {
    if (!phone.trim()) return true // Phone is optional
    const sanitized = sanitizePhone(phone)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(sanitized.replace(/\s/g, ""))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (formData.phone.trim() && !validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number"
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required"
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = "Subject must be at least 5 characters"
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required"
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    setErrors({})
    
    // Validate form
    if (!validateForm()) {
      toast({ title: "Validation Error", description: "Please fix the errors in the form.", variant: "destructive" })
      return
    }

    setIsSubmitting(true)

    try {
      // Sanitize form data before submission
      const sanitizedData = sanitizeFormData({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      })

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          ...sanitizedData,
          csrf_token: csrfToken
        })
      })
      
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || 'Failed to send message')
      }
      
      toast({ title: "Message Sent!", description: "Thank you for contacting us. We'll get back to you within 24 hours." })
      
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      })
      setErrors({})
    } catch (error) {
      console.error('Contact form submission error:', error)
      toast({ title: "Error", description: "Failed to send message. Please try again or call us directly.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Our Office",
      details: [
        "International Car Company Inc",
        "24328 S Vermont Ave Suite #215",
        "Harbor City, CA 90710"
      ],
      action: "Open in Google Maps",
      actionUrl: "https://maps.app.goo.gl/aJ8ZksnKGYunr8VZ7?g_st=iw",
    },
    // Phone cards replaced by dedicated numbers section below
    {
      icon: Mail,
      title: "Email Us",
      details: ["info@internationalcarcompanyinc.com", "24/7 Email Support"],
      action: "Send Email",
      actionUrl: "mailto:info@internationalcarcompanyinc.com",
    },
    // SMS card replaced by dedicated numbers section below
  ]

  const services = [
    {
      icon: Car,
      title: "Vehicle Sales",
      description: "Browse our extensive inventory of quality pre-owned vehicles.",
    },
    {
      icon: CreditCard,
      title: "Financing",
      description: "Competitive rates and flexible terms to fit your budget.",
    },
    {
      icon: Wrench,
      title: "Service & Maintenance",
      description: "Professional service for all makes and models.",
    },
  ]

  const hours = [
    { day: "Monday", time: "9:00 AM - 5:00 PM" },
    { day: "Tuesday", time: "9:00 AM - 5:00 PM" },
    { day: "Wednesday", time: "9:00 AM - 5:00 PM" },
    { day: "Thursday", time: "9:00 AM - 5:00 PM" },
    { day: "Friday", time: "9:00 AM - 5:00 PM" },
    { day: "Saturday", time: "9:00 AM - 5:00 PM" },
    { day: "Sunday", time: "9:00 AM - 5:00 PM" },
  ]

  return (
    <div className="bg-background text-foreground">

      {/* Compact Hero */}
      <section className="relative bg-background pt-10 pb-6">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-high-contrast">Contact Us</h1>
          <p className="text-base md:text-xl mt-2 text-easy-read max-w-3xl mx-auto">We&apos;re here to help you find the perfect vehicle and answer any questions you may have.</p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-6 md:py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {contactInfo.map((info, index) => {
              const IconComponent = info.icon
              return (
                <Card key={index} className="text-center h-full bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center">
                      <IconComponent className="h-12 w-12 text-primary mb-4" />
                      <h3 className="text-xl font-semibold text-high-contrast mb-3">{info.title}</h3>
                      <div className="space-y-1 mb-4">
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="text-easy-read text-center">
                            {detail}
                          </p>
                        ))}
                      </div>
                      <a
                        href={info.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-primary text-primary-foreground px-4 py-3 rounded hover:bg-primary/90 transition-colors touch-button"
                      >
                        {info.action}
                      </a>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Phone Numbers Section - Horizontal Layout for Wide Screens */}
      <section className="py-6 md:py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-3xl font-bold text-high-contrast mb-2">Contact Numbers</h2>
            <p className="text-easy-read max-w-2xl mx-auto">Call or text us anytime. We&apos;re here to help you find your perfect vehicle.</p>
          </div>
          
          {/* Horizontal Layout for Wide Screens */}
          <div className="hidden lg:block">
            <div className="flex items-center justify-center gap-8 max-w-6xl mx-auto">
              {/* Mobile Number - Horizontal */}
              <div className="flex items-center gap-6 bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emphasis mb-2">+1 310-350-7709</p>
                  <p className="text-sm text-muted-foreground">Mobile</p>
                </div>
                <div className="flex gap-3">
                  <a
                    href={`tel:+13103507709`}
                    aria-label={`Call +1 310-350-7709`}
                    className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors touch-button text-sm"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Call</span>
                  </a>
                  <a
                    href={`sms:+13103507709`}
                    aria-label={`Send SMS to +1 310-350-7709`}
                    className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors touch-button text-sm"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>SMS</span>
                  </a>
                  <a
                    href={`https://wa.me/13103507709`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open WhatsApp chat with +1 310-350-7709`}
                    className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors touch-button text-sm"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
              
              {/* Landline Number - Horizontal */}
              <div className="flex items-center gap-6 bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emphasis mb-2">+1 424-250-9663</p>
                  <p className="text-sm text-muted-foreground">Landline</p>
                </div>
                <div className="flex gap-3">
                  <a
                    href={`tel:+14242509663`}
                    aria-label={`Call +1 424-250-9663`}
                    className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors touch-button text-sm"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Call</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Vertical Layout for Mobile/Tablet */}
          <div className="lg:hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Mobile Number */}
              <Card className="bg-card border-border">
                <CardContent className="p-6 text-center">
                  <p className="text-2xl md:text-3xl font-bold text-emphasis mb-4">+1 310-350-7709</p>
                  <p className="text-sm text-muted-foreground mb-4">Mobile - Call, Text, or WhatsApp</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                      href={`tel:+13103507709`}
                      aria-label={`Call +1 310-350-7709`}
                      className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 rounded-full font-medium transition-colors touch-button text-sm"
                    >
                      <Phone className="h-4 w-4" />
                      <span>Call</span>
                    </a>
                    <a
                      href={`sms:+13103507709`}
                      aria-label={`Send SMS to +1 310-350-7709`}
                      className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-full font-medium transition-colors touch-button text-sm"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>SMS</span>
                    </a>
                    <a
                      href={`https://wa.me/13103507709`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open WhatsApp chat with +1 310-350-7709`}
                      className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full font-medium transition-colors touch-button text-sm"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </CardContent>
              </Card>
              
              {/* Landline Number */}
              <Card className="bg-card border-border">
                <CardContent className="p-6 text-center">
                  <p className="text-2xl md:text-3xl font-bold text-emphasis mb-4">+1 424-250-9663</p>
                  <p className="text-sm text-muted-foreground mb-4">Landline - Call Only</p>
                  <div className="flex justify-center">
                    <a
                      href={`tel:+14242509663`}
                      aria-label={`Call +1 424-250-9663`}
                      className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-full font-medium transition-colors touch-button text-base"
                    >
                      <Phone className="h-5 w-5" />
                      <span>Call</span>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-6 md:py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-high-contrast mb-6">Send Us a Message</h2>
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6 mobile-form">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mobile-gap">
                      <div className="form-group">
                         <Label htmlFor="name" className="form-label-readable">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                           className={`form-input-readable touch-input ${errors.name ? "border-destructive" : ""}`}
                          required
                        />
                        {errors.name && (
                          <p className="form-error-readable mt-1">{errors.name}</p>
                        )}
                      </div>
                      <div className="form-group">
                         <Label htmlFor="email" className="form-label-readable">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                           className={`form-input-readable touch-input ${errors.email ? "border-destructive" : ""}`}
                          required
                        />
                        {errors.email && (
                          <p className="form-error-readable mt-1">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mobile-gap">
                      <div className="form-group">
                         <Label htmlFor="phone" className="form-label-readable">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                           className={`form-input-readable touch-input ${errors.phone ? "border-destructive" : ""}`}
                        />
                        {errors.phone && (
                          <p className="form-error-readable mt-1">{errors.phone}</p>
                        )}
                      </div>
                      <div className="form-group">
                         <Label htmlFor="subject" className="form-label-readable">Subject *</Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                           className={`form-input-readable touch-input ${errors.subject ? "border-destructive" : ""}`}
                          required
                        />
                        {errors.subject && (
                          <p className="form-error-readable mt-1">{errors.subject}</p>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                       <Label htmlFor="message" className="form-label-readable">Message *</Label>
                      <Textarea
                        id="message"
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us how we can help you..."
                         className={`form-input-readable touch-input ${errors.message ? "border-destructive" : ""}`}
                        required
                      />
                      {errors.message && (
                        <p className="form-error-readable mt-1">{errors.message}</p>
                      )}
                    </div>

                    {/* Hidden CSRF token */}
                    <input type="hidden" name="csrf_token" value={csrfToken} />
                    
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                       className="w-full bg-primary hover:bg-primary/90 touch-button text-primary-foreground"
                      size="lg"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>

                </CardContent>
              </Card>
            </div>

            {/* Map & Hours */}
            <div className="space-y-8">
              {/* Location */}
              <div>
                 <h3 className="text-2xl font-bold text-high-contrast mb-4">Find Us</h3>
                 <Card className="bg-card border-border">
                  <CardContent className="p-0">
                    <iframe
                      title="Google Maps - International Car Company Inc"
                      src="https://www.google.com/maps?q=24328%20S%20Vermont%20Ave%20Suite%20%23215%2C%20Harbor%20City%2C%20CA%2090710&output=embed"
                      className="w-full h-[300px] md:h-[360px] border-0 rounded"
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Business Hours */}
              <div>
                 <h3 className="text-2xl font-bold text-high-contrast mb-4">Business Hours</h3>
                 <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center text-high-contrast">
                      <Clock className="h-5 w-5 mr-2 text-primary" />
                      Hours of Operation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {hours.map((hour, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="font-medium text-high-contrast">{hour.day}</span>
                          <span className="text-easy-read">{hour.time}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-high-contrast mb-4">Our Services</h2>
            <p className="text-easy-read max-w-2xl mx-auto">
              From sales to service, we&apos;re your one-stop automotive destination.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const IconComponent = service.icon
              return (
                <Card key={index} className="text-center bg-card border-border">
                  <CardContent className="p-6">
                    <IconComponent className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-high-contrast mb-3">{service.title}</h3>
                    <p className="text-easy-read">{service.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
