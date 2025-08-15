import type { Metadata } from 'next'
import Script from 'next/script'
import { headers } from 'next/headers'
import { GeistSans } from 'geist/font/sans'
import { Montserrat } from 'next/font/google'
import { Providers } from '@/components/providers'
import { CookieConsent } from '@/components/cookie-consent'
import { ErrorMonitor } from '@/components/error-monitor'
import { PerformanceMonitor } from '@/components/performance-monitor'
import { validateEnvironment } from '@/lib/config/env'
import './globals.css'

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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'International Car Company Inc - Premium Vehicles',
    description: 'Discover premium vehicles at International Car Company Inc. Modern experience, transparent pricing, and professional service.',
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
        {/* Google tag (gtag.js) - load only after consent */}
        <Script
          id="gtag-src"
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-SV90G9ZG56"
          strategy="afterInteractive"
          nonce={nonce}
        />
        <Script id="gtag-init" strategy="afterInteractive" nonce={nonce}>
          {`
            // Google Analytics consent management with enhanced privacy focus
            function shouldLoadAnalytics() {
              if (typeof window === 'undefined') return false;
              if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') return false;
              
              const consent = localStorage.getItem('icc-cookie-consent');
              return consent === 'accepted';
            }
            
            function initializeAnalytics() {
              if (!shouldLoadAnalytics()) return;
              
              try {
                window.dataLayer = window.dataLayer || [];
                
                if (typeof window.gtag === 'undefined') {
                  window.gtag = function() {
                    window.dataLayer.push(arguments);
                  };
                }
                
                window.gtag('js', new Date());
                
                // Enhanced privacy-focused configuration
                window.gtag('config', 'G-SV90G9ZG56', {
                  page_title: document.title,
                  page_location: window.location.href,
                  send_page_view: false,
                  anonymize_ip: true,
                  allow_google_signals: false,
                  allow_ad_personalization_signals: false,
                  cookie_flags: 'SameSite=None;Secure',
                  // Disable enhanced conversions and remarketing
                  allow_enhanced_conversions: false,
                  // Minimize data collection
                  send_page_view_on_load: false,
                  // Respect Do Not Track
                  respect_dnt: true,
                  // Disable demographics and interests
                  demographics: false,
                  interests: false,
                  // Disable advertising features
                  advertising_features: false,
                  // Set cookie expiration to session
                  cookie_expires: 0,
                  // Disable cross-domain tracking
                  allow_linker: false,
                  // Disable enhanced ecommerce
                  enhanced_ecommerce: false
                });
                
                // Send page view after a delay and only if still consented
                setTimeout(() => {
                  if (window.gtag && shouldLoadAnalytics()) {
                    window.gtag('event', 'page_view', {
                      // Minimal page view data
                      page_title: document.title,
                      page_location: window.location.href
                    });
                  }
                }, 1000);
                
              } catch (error) {
                console.warn('Failed to initialize analytics:', error);
              }
            }
            
            function disableAnalytics() {
              if (typeof window === 'undefined') return;
              
              try {
                if (window.gtag) {
                  window.gtag('config', 'G-SV90G9ZG56', {
                    send_page_view: false
                  });
                }
                
                // Clear dataLayer to prevent data collection
                if (window.dataLayer) {
                  window.dataLayer = [];
                }
                
                // Remove gtag function
                delete window.gtag;
              } catch (error) {
                console.warn('Failed to disable analytics:', error);
              }
            }
            
            // Listen for consent changes
            if (typeof window !== 'undefined') {
              window.addEventListener('icc-analytics-consent', (event) => {
                if (event.detail === 'accepted') {
                  initializeAnalytics();
                } else if (event.detail === 'declined') {
                  disableAnalytics();
                  // Remove the GA script if consent is declined
                  const script = document.getElementById('gtag-src');
                  if (script) {
                    script.remove();
                  }
                }
              });
              
              // Check if consent was already given
              const consent = localStorage.getItem('icc-cookie-consent');
              if (consent === 'accepted') {
                // Small delay to ensure DOM is ready
                setTimeout(initializeAnalytics, 100);
              } else if (consent === 'declined') {
                // Remove GA script if consent was previously declined
                setTimeout(() => {
                  const script = document.getElementById('gtag-src');
                  if (script) {
                    script.remove();
                  }
                }, 100);
              }
            }
          `}
        </Script>
        {/* Preload critical resources */}
        <link rel="preload" href="/favicon.ico" as="image" type="image/x-icon" />
        <link rel="preload" as="image" href="/optimized/placeholder.webp" imageSrcSet="/optimized/placeholder.webp 1200w" imageSizes="100vw" />
        
        {/* Font optimization */}
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" as="style" onLoad="this.onload=null;this.rel='stylesheet'" />
        <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" /></noscript>
        
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
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        
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
              
              // Load web vitals asynchronously with better performance
              if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                  import('https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js').then(() => {
                    webVitals.onLCP(send)
                    webVitals.onCLS(send)
                    webVitals.onINP && webVitals.onINP(send)
                    webVitals.onFID && webVitals.onFID(send)
                    webVitals.onTTFB && webVitals.onTTFB(send)
                  }).catch(()=>{})
                })
              } else {
                // Fallback for older browsers
                setTimeout(() => {
                  import('https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js').then(() => {
                    webVitals.onLCP(send)
                    webVitals.onCLS(send)
                    webVitals.onINP && webVitals.onINP(send)
                    webVitals.onFID && webVitals.onFID(send)
                    webVitals.onTTFB && webVitals.onTTFB(send)
                  }).catch(()=>{})
                }, 1000)
              }
              
              // Additional performance monitoring with better timing
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
        <PerformanceMonitor />
        {/* AI Chatbot is now gated and mounted from Providers after idle */}
      </body>
    </html>
  )
}