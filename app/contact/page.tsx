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
      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <ErrorBoundary>
          <ContactContent />
        </ErrorBoundary>
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">Our Location</h2>
          <div className="w-full overflow-hidden rounded-lg border border-border">
            <iframe
              title="Google Maps - International Car Company Inc"
              src="https://www.google.com/maps?q=International%20Car%20Company%20Inc&output=embed"
              className="w-full h-[360px] md:h-[480px] border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <a
            href="https://maps.app.goo.gl/aJ8ZksnKGYunr8VZ7?g_st=iw"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-lg hover:bg-primary/90 transition-colors touch-button"
            aria-label="Open location in Google Maps"
          >
            Open in Google Maps
          </a>
        </div>
      </main>
      {/* Sticky mobile contact bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 grid grid-cols-3 gap-2">
          <a href="tel:+13103507709" className="text-center bg-primary text-primary-foreground py-3 rounded-lg">Call</a>
          <a href="sms:+13103507709" className="text-center bg-card py-3 rounded-lg">SMS</a>
          <a href="https://wa.me/13103507709?text=Hi!%20I%27m%20interested%20in%20your%20vehicles." target="_blank" rel="noopener noreferrer" className="text-center bg-green-600 text-white py-3 rounded-lg">WhatsApp</a>
        </div>
      </div>
      <Footer />
    </div>
  )
}

