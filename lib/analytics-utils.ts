// Google Analytics consent management utilities

export interface AnalyticsConsent {
  analytics: boolean;
  marketing: boolean;
  essential: boolean;
}

export function getAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('icc-cookie-consent') === 'accepted';
}

export function setAnalyticsConsent(consent: boolean): void {
  if (typeof window === 'undefined') return;
  
  if (consent) {
    localStorage.setItem('icc-cookie-consent', 'accepted');
    localStorage.setItem('icc-cookie-date', new Date().toISOString());
  } else {
    localStorage.setItem('icc-cookie-consent', 'declined');
    localStorage.setItem('icc-cookie-date', new Date().toISOString());
  }
  
  // Dispatch event for other components to listen to
  window.dispatchEvent(new CustomEvent('icc-analytics-consent', { 
    detail: consent ? 'accepted' : 'declined' 
  }));
}

export function shouldLoadAnalytics(): boolean {
  // Only load analytics if:
  // 1. We're in the browser
  // 2. User has given consent
  // 3. Not in development mode
  if (typeof window === 'undefined') return false;
  if (process.env.NODE_ENV === 'development') return false;
  
  return getAnalyticsConsent();
}

export function disableAnalytics(): void {
  if (typeof window === 'undefined') return;
  
  // Clear any existing analytics data
  if (window.gtag) {
    try {
      window.gtag('config', 'G-SV90G9ZG56', {
        send_page_view: false
      });
    } catch (error) {
      console.warn('Failed to disable analytics:', error);
    }
  }
  
  // Clear dataLayer
  if (window.dataLayer) {
    window.dataLayer = [];
  }
}

export function initializeAnalytics(): void {
  if (!shouldLoadAnalytics()) return;
  
  try {
    // Initialize Google Analytics
    window.dataLayer = Array.isArray(window.dataLayer) ? window.dataLayer : [];
    
    if (typeof window.gtag === 'undefined') {
      window.gtag = (...args: unknown[]) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        window.dataLayer!.push(args);
      };
    }
    
    window.gtag('js', new Date());
    window.gtag('config', 'G-SV90G9ZG56', {
      page_title: document.title,
      page_location: window.location.href,
      send_page_view: false,
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_flags: 'SameSite=None;Secure'
    });
    
    // Send page view after a delay
    setTimeout(() => {
      if (window.gtag) {
        window.gtag('event', 'page_view');
      }
    }, 1000);
    
  } catch (error) {
    console.warn('Failed to initialize analytics:', error);
  }
}

// Type declarations for global objects
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}
