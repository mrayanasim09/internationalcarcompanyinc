"use client"

import { useEffect } from 'react'
import Head from 'next/head'

interface AutoIndexingSEOProps {
  title: string
  description: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
  structuredData?: object
  noIndex?: boolean
  canonicalUrl?: string
}

export function AutoIndexingSEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags,
  structuredData,
  noIndex = false,
  canonicalUrl
}: AutoIndexingSEOProps) {
  
  const siteUrl = 'https://internationalcarcompanyinc.com'
  const siteName = 'International Car Company Inc'
  const defaultImage = `${siteUrl}/prestige-auto-sales-logo.png`
  
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl
  const fullImage = image || defaultImage
  const canonical = canonicalUrl || fullUrl

  // Automatically notify search engines about new content
  useEffect(() => {
    if (typeof window !== 'undefined' && !noIndex) {
      // Send page view to Google Analytics for indexing
      if (window.gtag) {
        window.gtag('event', 'page_view', {
          page_title: fullTitle,
          page_location: window.location.href,
          page_referrer: document.referrer || 'direct'
        })
      }

      // Add structured data for better indexing
      if (structuredData) {
        const script = document.createElement('script')
        script.type = 'application/ld+json'
        script.text = JSON.stringify(structuredData)
        document.head.appendChild(script)
      }

      // Log page for monitoring
      console.log('Page indexed for SEO:', {
        title: fullTitle,
        url: window.location.href,
        description: description.substring(0, 100) + '...',
        indexed: !noIndex
      })
    }
  }, [fullTitle, description, structuredData, noIndex])

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={author || siteName} />
      
      {/* Indexing instructions */}
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      <meta name="googlebot" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      <meta name="bingbot" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@internationalcarcompany" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* Article specific meta tags */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags && tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Additional SEO Meta Tags for better indexing */}
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-TileColor" content="#000000" />
      
      {/* Language and region */}
      <meta name="language" content="English" />
      <meta name="geo.region" content="US-CA" />
      <meta name="geo.placename" content="Harbor City, CA" />
      
      {/* Business information for local SEO */}
      <meta name="business:contact_data:street_address" content="Harbor City, CA" />
      <meta name="business:contact_data:locality" content="Harbor City" />
      <meta name="business:contact_data:region" content="CA" />
      <meta name="business:contact_data:country_name" content="United States" />
      <meta name="business:contact_data:phone_number" content="+1-XXX-XXX-XXXX" />
      
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      
      {/* DNS Prefetch for performance */}
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      
      {/* Auto-discovery hints for search engines */}
      <link rel="alternate" type="application/rss+xml" title="RSS Feed" href="/rss.xml" />
      <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
    </Head>
  )
}
