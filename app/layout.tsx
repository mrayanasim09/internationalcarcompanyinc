import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'
import { ThemeProvider } from '@/components/theme-provider'
import { ComparisonProvider } from '@/lib/comparison-context'
import { AuthProvider } from '@/lib/auth-context'
import { Toaster } from '@/components/ui/sonner'
import { EnhancedErrorBoundary } from '@/components/enhanced-error-boundary'
import { PerformanceMonitor } from '@/components/performance-monitor'
import { UnifiedMonitor } from '@/components/unified-monitor'
import { CookieConsent } from '@/components/cookie-consent'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Preloader } from '@/components/preloader'
import { NonceProvider } from '@/components/nonce-context'
import { GAConsentLoader } from '@/components/ga-loader'
import { 
  DynamicServiceWorkerRegister, 
  DynamicBreadcrumbNav, 
  DynamicOrganizationStructuredData 
} from '@/components/dynamic-imports'
import { headers } from 'next/headers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'International Car Company Inc - Premium Used Cars in Harbor City, CA',
    template: '%s | International Car Company Inc'
  },
  description: 'Find quality pre-owned vehicles at International Car Company Inc in Harbor City, CA. Competitive financing, expert service, and a wide selection of used cars, trucks, and SUVs.',
  keywords: [
    'used cars Harbor City CA',
    'pre-owned vehicles',
    'car dealership',
    'auto financing',
    'quality used cars',
    'Harbor City car lot',
    'affordable vehicles',
    'car trade-in',
    'auto loans',
    'certified pre-owned'
  ],
  authors: [{ name: 'International Car Company Inc' }],
  creator: 'International Car Company Inc',
  publisher: 'International Car Company Inc',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://internationalcarcompanyinc.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://internationalcarcompanyinc.com',
    title: 'International Car Company Inc - Premium Used Cars in Harbor City, CA',
    description: 'Find quality pre-owned vehicles at International Car Company Inc in Harbor City, CA. Competitive financing, expert service, and a wide selection of used cars, trucks, and SUVs.',
    siteName: 'International Car Company Inc',
    images: [
      {
        url: '/prestige-auto-sales-logo.png',
        width: 1200,
        height: 630,
        alt: 'Prestige Auto Sales LLC Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'International Car Company Inc - Premium Used Cars in Harbor City, CA',
    description: 'Find quality pre-owned vehicles at International Car Company Inc in Harbor City, CA. Competitive financing, expert service, and a wide selection of used cars, trucks, and SUVs.',
    images: ['/prestige-auto-sales-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'G-SV90G9ZG56',
  },
  icons: {
    icon: [
      { url: '/favicon-light.ico', media: '(prefers-color-scheme: light)' },
      { url: '/favicon.ico', media: '(prefers-color-scheme: dark)' }
    ],
    shortcut: '/favicon-light.ico',
    apple: '/favicon-light.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get nonce from headers for CSP compliance
  const headersList = headers()
  const nonce = headersList.get('x-nonce') || undefined

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* CSP nonce meta tag for components to access */}
        {nonce ? <meta name="csp-nonce" content={nonce} /> : null}
        
        {/* Organization Structured Data */}
        <DynamicOrganizationStructuredData />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/prestige-auto-sales-logo.png" as="image" />
        
        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//*.supabase.co" />
        
        {/* Preconnect to critical external domains */}
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://*.supabase.co" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <NonceProvider nonce={nonce}>
          <ThemeProvider>
            <ComparisonProvider>
              <AuthProvider>
                <EnhancedErrorBoundary>
                  <PerformanceMonitor />
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <DynamicBreadcrumbNav />
                    <main className="flex-1 pt-20 md:pt-24">
                      {children}
                    </main>
                    <Footer />
                  </div>
                  <CookieConsent />
                  <Toaster />
                  <DynamicServiceWorkerRegister />
                  <UnifiedMonitor />
                  <GAConsentLoader />
                </EnhancedErrorBoundary>
              </AuthProvider>
            </ComparisonProvider>
          </ThemeProvider>
        </NonceProvider>
      </body>
    </html>
  )
}