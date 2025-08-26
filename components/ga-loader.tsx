"use client"

import { useEffect } from 'react'

export function GAConsentLoader() {
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return
      const consent = window.localStorage.getItem('icc-cookie-consent')
      if (consent !== 'accepted') return

      // Prevent double-injection
      if (document.getElementById('gtag-src')) return

      // Inject GA script
      const script = document.createElement('script')
      script.id = 'gtag-src'
      script.async = true
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-SV90G9ZG56'
      document.head.appendChild(script)

      // Init shim and configuration
      type GtagFunction = (...args: unknown[]) => void
      const w = window as unknown as { dataLayer?: unknown[]; gtag?: GtagFunction }
      w.dataLayer = Array.isArray(w.dataLayer) ? w.dataLayer : []
      w.gtag = (...args: unknown[]) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        w.dataLayer!.push(args)
      }

      const configure = () => {
        w.gtag?.('js', new Date())
        w.gtag?.('config', 'G-SV90G9ZG56', {
          send_page_view: false,
          anonymize_ip: true,
          allow_google_signals: false,
          allow_ad_personalization_signals: false,
          cookie_flags: 'SameSite=None;Secure',
          allow_enhanced_conversions: false,
          respect_dnt: true,
          demographics: false,
          interests: false,
          advertising_features: false,
          cookie_expires: 0,
          allow_linker: false,
          enhanced_ecommerce: false,
        })
      }

      script.addEventListener('load', configure, { once: true })
    } catch {
      // no-op
    }
  }, [])

  return null
}


