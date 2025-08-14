import type { Metadata } from 'next'
import Script from 'next/script'
import { headers } from 'next/headers'
import { GeistSans } from 'geist/font/sans'
import { Montserrat } from 'next/font/google'
const montserrat = Montserrat({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-montserrat', display: 'swap' })
import { CookieConsent } from '@/components/cookie-consent'
import { ErrorMonitor } from '@/components/error-monitor'

import { Providers } from '@/components/providers'
import './globals.css'

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
    <Script id="theme-script" strategy="beforeInteractive" nonce={nonce}>{`
      (function() {
        try {
          var storageKey = 'icc-theme';
          var stored = localStorage.getItem(storageKey);
          var resolved = (stored === 'dark' || stored === 'light') ? stored : 'dark';
          var d = document.documentElement;
          d.classList.remove('light', 'dark');
          d.classList.add(resolved);
        } catch (e) {}
      })();
    `}</Script>
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
            gtag('config', 'G-SV90G9ZG56');
          `}
        </Script>
        {/* DNS prefetch (trimmed) */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/favicon.ico" as="image" type="image/x-icon" />
        <link rel="preload" as="image" href="/optimized/placeholder.webp" imageSrcSet="/optimized/placeholder.webp 1200w" imageSizes="100vw" />
        
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
                const body = JSON.stringify({ ...data, ts: Date.now(), path: location.pathname })
                navigator.sendBeacon && navigator.sendBeacon('/api/debug', body)
              }
              import('https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js').then(() => {
                webVitals.onLCP(send)
                webVitals.onCLS(send)
                webVitals.onINP && webVitals.onINP(send)
              }).catch(()=>{})
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