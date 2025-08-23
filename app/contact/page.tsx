"use client"

import { Navbar } from "@/components/navbar"

import { Breadcrumb } from "@/components/breadcrumb"
import { ContactContent } from "@/components/contact-content"
import { ErrorBoundary } from "@/components/error-boundary"

export default function ContactPage() {
  const breadcrumbItems = [
    { label: "Contact International Car Company Inc" }
  ]

  return (
    <div className="icc-theme min-h-screen bg-background">
      <Navbar />
      <Breadcrumb items={breadcrumbItems} />
      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8">
        <ErrorBoundary>
          <ContactContent />
        </ErrorBoundary>
      </main>
    </div>
  )
}

