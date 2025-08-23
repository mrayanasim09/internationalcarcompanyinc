"use client"

import { Phone, MessageCircle, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import type { Car } from "@/lib/types"

interface ContactToBuyProps {
  car: Car
  variant?: "card" | "inline" | "floating"
}

export function ContactToBuy({ car, variant = "card" }: ContactToBuyProps) {
  
  // Define both phone numbers
  const mobilePhone = "+1 310-350-7709"
  const landlinePhone = "+1 424-250-9663"
  
  // Prefer per-car contact info if provided, otherwise use default numbers
  const dynamicPhone = car?.contact?.phone && String(car.contact.phone).trim() ? String(car.contact.phone).trim() : mobilePhone
  const phoneNumbers = [
    { number: dynamicPhone, label: dynamicPhone, type: "Mobile" },
    { number: landlinePhone, label: landlinePhone, type: "Landline" }
  ]

  const handlePhoneCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_self')
  }

  const handleSMS = (phoneNumber: string) => {
    window.open(`sms:${phoneNumber}`, '_self')
  }

  const handleWhatsApp = (phoneNumber: string) => {
    const message = encodeURIComponent(
      `Hi! I'd like to schedule a viewing for the ${car.title} (${car.year}). When would be a good time?`
    )
    window.open(`https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${message}`, '_blank')
  }

  const handleScheduleViewing = (phoneNumber: string) => {
    const message = encodeURIComponent(
      `Hi! I'd like to schedule a viewing for the ${car.title} (${car.year}). When would be a good time?`
    )
    // Use SMS with body prefilled (works on most devices)
    window.open(`sms:${phoneNumber}?&body=${message}`, '_self')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (variant === "inline") {
    return (
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => handlePhoneCall(phoneNumbers[0].number)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-h-[48px] font-semibold"
          >
            <Phone className="h-5 w-5 mr-2" />
            Call Mobile
          </Button>
          <Button 
            onClick={() => handlePhoneCall(phoneNumbers[1].number)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-h-[48px] font-semibold"
          >
            <Phone className="h-5 w-5 mr-2" />
            Call Landline
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => handleSMS(phoneNumbers[0].number)}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-h-[48px] font-semibold"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            SMS Mobile
          </Button>
          <Button 
            onClick={() => handleWhatsApp(phoneNumbers[0].number)}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-h-[48px] font-semibold"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            WhatsApp
          </Button>
        </div>
      </div>
    )
  }

  if (variant === "floating") {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 z-40 shadow-lg pb-[env(safe-area-inset-bottom)]">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="font-bold text-lg text-gray-900 dark:text-white">{formatPrice(car.price)}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{car.title}</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              onClick={() => handlePhoneCall(phoneNumbers[0].number)}
              className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 min-h-[48px] font-semibold"
            >
              <Phone className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Call Mobile</span>
              <span className="sm:hidden">Call</span>
            </Button>
            <Button 
              onClick={() => handleSMS(phoneNumbers[0].number)}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 min-h-[48px] font-semibold"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">SMS</span>
              <span className="sm:hidden">Text</span>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Compact card with both phone numbers
  return (
    <Card className="bg-card border border-border">
      <CardContent className="p-4 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-bold text-foreground">Interested in this vehicle?</h3>
          <p className="text-sm text-muted-foreground">Contact us to learn more or schedule a viewing.</p>
          <div className="mt-2 space-y-1">
            <p className="text-xs text-foreground">Mobile: {phoneNumbers[0].label}</p>
            <p className="text-xs text-foreground">Landline: {phoneNumbers[1].label}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={() => handlePhoneCall(phoneNumbers[0].number)}
            className="w-full bg-green-600 hover:bg-green-700 text-white touch-button text-xs"
          >
            <Phone className="h-3 w-3 mr-1" />
            Call Mobile
          </Button>
          <Button 
            onClick={() => handlePhoneCall(phoneNumbers[1].number)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white touch-button text-xs"
          >
            <Phone className="h-3 w-3 mr-1" />
            Call Landline
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={() => handleSMS(phoneNumbers[0].number)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white touch-button text-xs"
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            SMS
          </Button>
          <Button 
            onClick={() => handleWhatsApp(phoneNumbers[0].number)}
            className="w-full bg-green-500 hover:bg-green-600 text-white touch-button text-xs"
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            WhatsApp
          </Button>
        </div>
        <Button 
          onClick={() => handleScheduleViewing(phoneNumbers[0].number)}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground touch-button"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Viewing
        </Button>
      </CardContent>
    </Card>
  )
}

