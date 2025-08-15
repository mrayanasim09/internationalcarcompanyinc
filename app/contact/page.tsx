"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Breadcrumb } from "@/components/breadcrumb"
import { ContactContent } from "@/components/contact-content"
import { ErrorBoundary } from "@/components/error-boundary"

export default function ContactPage() {
  const breadcrumbItems = [
    { label: "Contact International Car Company Inc" }
  ]

  return (
    <div className="icc-theme min-h-screen bg-background" suppressHydrationWarning>
      <Navbar />
      <Breadcrumb items={breadcrumbItems} />
      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8">
        <ErrorBoundary>
          <ContactContent />
        </ErrorBoundary>
      </main>
      {/* Sticky mobile contact bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3">
          {/* Phone Numbers Row */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="text-center bg-card py-2 rounded-lg border border-border">
              <span className="text-xs font-medium text-foreground">+1 310-350-7709</span>
            </div>
            <div className="text-center bg-card py-2 rounded-lg border border-border">
              <span className="text-xs font-medium text-foreground">+1 424-250-9663</span>
            </div>
          </div>
          {/* Action Buttons Row */}
          <div className="grid grid-cols-3 gap-2">
            <a href="tel:+13103507709" className="text-center bg-primary text-primary-foreground py-3 rounded-lg font-medium text-sm flex flex-col items-center justify-center gap-1">
              <span className="text-xs">📞</span>
              <span>Call Mobile</span>
            </a>
            <a href="tel:+14242509663" className="text-center bg-blue-600 text-white py-3 rounded-lg font-medium text-sm flex flex-col items-center justify-center gap-1">
              <span className="text-xs">☎️</span>
              <span>Call Landline</span>
            </a>
            <a href="https://wa.me/13103507709?text=Hi!%20I%27m%20interested%20in%20your%20vehicles." target="_blank" rel="noopener noreferrer" className="text-center bg-green-600 text-white py-3 rounded-lg font-medium text-sm flex flex-col items-center justify-center gap-1">
              <span className="text-xs">💬</span>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

