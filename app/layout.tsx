import type { Metadata } from 'next'
import Script from 'next/script'
import { headers } from 'next/headers'
import { GeistSans } from 'geist/font/sans'
import { Montserrat } from 'next/font/google'
import { Providers } from '@/components/providers'
import { CookieConsent } from '@/components/cookie-consent'
import { ErrorMonitor } from '@/components/error-monitor'
import { validateEnvironment } from '@/lib/config/env'

const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

// Validate environment on startup
if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
  try {
    validateEnvironment()
  } catch (error) {
    console.error('Environment validation failed:', error)
    // Don't throw during build time
  }
}

// GeistSans provides a preconfigured font with className

export const metadata: Metadata = {
  title: {
    default: 'International Car Company Inc - Premium Vehicles',
    template: '%s | International Car Company Inc'
  },
  description: 'Discover premium vehicles at International Car Company Inc. Modern experience, transparent pricing, and professional service.',
  keywords: ['pre-owned vehicles', 'used cars', 'car dealership', 'International Car Company Inc', 'quality cars', 'transparent pricing', 'financing'],
  authors: [{ name: 'International Car Company Inc' }],
  creator: 'International Car Company Inc',
  publisher: 'International Car Company Inc',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.internationalcarcompanyinc.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.internationalcarcompanyinc.com',
    title: 'International Car Company Inc - Premium Vehicles',
    description: 'Discover premium vehicles at International Car Company Inc. Modern experience, transparent pricing, and professional service.',
    siteName: 'International Car Company Inc',
    images: [
      { url: '/International Car Company Inc. Logo.png', width: 1200, height: 630, alt: 'International Car Company Inc Logo' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'International Car Company Inc - Premium Vehicles',
    description: 'Discover premium vehicles at International Car Company Inc. Modern experience, transparent pricing, and professional service.',
    images: ['/International Car Company Inc. Logo.png'],
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
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const nonce = headers().get('x-nonce') || undefined
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {nonce ? <meta name="csp-nonce" content={nonce} /> : null}
        {/* Google tag (gtag.js) - load lazily to keep main thread free */}
        <Script
          id="gtag-src"
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-SV90G9ZG56"
          strategy="lazyOnload"
          nonce={nonce}
        />
        <Script id="gtag-init" strategy="lazyOnload" nonce={nonce}>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SV90G9ZG56', {
              page_title: document.title,
              page_location: window.location.href,
              send_page_view: false
            });
            
            // Send page view after a delay to avoid blocking
            setTimeout(() => {
              gtag('event', 'page_view');
            }, 1000);
          `}
        </Script>
        {/* Preload critical resources */}
        <link rel="preload" href="/favicon.ico" as="image" type="image/x-icon" />
        <link rel="preload" as="image" href="/optimized/placeholder.webp" imageSrcSet="/optimized/placeholder.webp 1200w" imageSizes="100vw" />
        <link rel="preload" href="/International Car Company Inc. Logo.png" as="image" type="image/png" />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Sitemap */}
        <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
        
        {/* Manifest for PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e90ff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="International Car Company Inc" />
        
        {/* Viewport optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" />
        
        {/* Cache control handled via next.config headers */}
      </head>
      <body className={`${GeistSans.className} ${montserrat.variable}`}>
        <Script id="web-vitals" strategy="afterInteractive" nonce={nonce}>{`
          (function(){
            try{
              const send = (data) => {
                const body = JSON.stringify({ 
                  ...data, 
                  ts: Date.now(), 
                  path: location.pathname,
                  userAgent: navigator.userAgent,
                  connection: navigator.connection ? navigator.connection.effectiveType : 'unknown'
                })
                // Use debug endpoint for monitoring
                navigator.sendBeacon && navigator.sendBeacon('/api/debug', body)
              }
              
              // Load web vitals asynchronously
              import('https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js').then(() => {
                webVitals.onLCP(send)
                webVitals.onCLS(send)
                webVitals.onINP && webVitals.onINP(send)
                webVitals.onFID && webVitals.onFID(send)
                webVitals.onTTFB && webVitals.onTTFB(send)
              }).catch(()=>{})
              
              // Additional performance monitoring
              if ('performance' in window) {
                const observer = new PerformanceObserver((list) => {
                  for (const entry of list.getEntries()) {
                    if (entry.entryType === 'navigation') {
                      const navEntry = entry;
                      send({
                        type: 'navigation',
                        domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
                        loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
                        domInteractive: navEntry.domInteractive - navEntry.fetchStart,
                        firstByte: navEntry.responseStart - navEntry.requestStart
                      });
                    }
                  }
                });
                observer.observe({ entryTypes: ['navigation'] });
              }
            }catch(e){}
          })();
        `}</Script>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary text-primary-foreground px-3 py-2 rounded">Skip to content</a>
        <Providers>
          <main id="main">{children}</main>
        </Providers>
        <CookieConsent />
        <ErrorMonitor />
        {/* AI Chatbot is now gated and mounted from Providers after idle */}
      </body>
    </html>
  )
}