

import { AboutContent } from "@/components/about-content"

import { Metadata } from 'next'

// Optimize caching and performance
export const revalidate = 3600 // 1 hour
export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'About Us - International Car Company Inc',
  description: 'Learn about International Car Company Inc. Professional service, modern experience, and transparent pricing.',
  keywords: 'International Car Company Inc, used car dealership, pre-owned vehicles',
  openGraph: {
    title: 'About International Car Company Inc',
    description: 'Professional service and modern experience',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function AboutPage() {
  return (
    <div className="icc-theme min-h-screen bg-background text-foreground">
      <AboutContent />
    </div>
  )
}

