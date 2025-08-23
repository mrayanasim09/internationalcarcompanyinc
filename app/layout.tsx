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
        
        {/* Google tag (gtag.js) - load only after consent with nonce */}
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
                  enhanced_ecommerce: false,
                  // Disable scroll tracking and engagement events
                  engagement_time_msec: 0,
                  // Disable automatic event collection
                  send_page_view_on_load: false,
                  // Disable user engagement tracking
                  user_engagement: false
                });
                
                // Send page view only once per session to reduce requests
                if (window.gtag && shouldLoadAnalytics() && !sessionStorage.getItem('ga-page-view-sent')) {
                  window.gtag('event', 'page_view', {
                    // Minimal page view data
                    page_title: document.title,
                    page_location: window.location.href
                  });
                  sessionStorage.setItem('ga-page-view-sent', 'true');
                }
                
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
                </EnhancedErrorBoundary>
              </AuthProvider>
            </ComparisonProvider>
          </ThemeProvider>
        </NonceProvider>
      </body>
    </html>
  )
}