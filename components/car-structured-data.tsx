import type { Car } from '@/lib/types'

interface CarStructuredDataProps {
  car: Car
}

export function CarStructuredData({ car }: CarStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: car.title || `${car.year} ${car.make} ${car.model}`,
    brand: {
      '@type': 'Brand',
      name: car.make
    },
    model: car.model,
    vehicleModelDate: car.year?.toString(),
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: car.mileage,
      unitCode: 'SMI' // Statute mile
    },
    color: car.exteriorColor || 'Unknown',
    vehicleCondition: 'https://schema.org/UsedCondition',
    offers: {
      '@type': 'Offer',
      price: car.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'International Car Company Inc',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '24328 S Vermont Ave Suite #215',
          addressLocality: 'Harbor City',
          addressRegion: 'CA',
          postalCode: '90710',
          addressCountry: 'US'
        },
        telephone: '+1 310-350-7709',
        email: 'info@internationalcarcompanyinc.com',
        url: 'https://internationalcarcompanyinc.com'
      }
    },
    description: car.description || `${car.year} ${car.make} ${car.model} with ${car.mileage?.toLocaleString()} miles`,
    image: car.images && car.images.length > 0 ? car.images : ['/optimized/placeholder.webp'],
    url: `https://internationalcarcompanyinc.com/car/${car.id}`,
    aggregateRating: car.rating ? {
      '@type': 'AggregateRating',
      ratingValue: car.rating,
      reviewCount: car.reviews?.length || 0,
      bestRating: 5,
      worstRating: 1
    } : undefined,
    review: car.reviews && car.reviews.length > 0 ? car.reviews.slice(0, 3).map(review => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating || 5,
        bestRating: 5
      },
      author: {
        '@type': 'Person',
        name: review.authorName || 'Anonymous'
      },
      reviewBody: review.comment || 'Great car!',
      datePublished: review.date || new Date().toISOString()
    })) : undefined
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

// Structured data for car listings page
export function CarListingsStructuredData({ cars }: { cars: Car[] }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Car Inventory',
    description: 'Browse our selection of quality pre-owned vehicles',
    numberOfItems: cars.length,
    itemListElement: cars.map((car, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Car',
        name: car.title || `${car.year} ${car.make} ${car.model}`,
        brand: {
          '@type': 'Brand',
          name: car.make
        },
        model: car.model,
        vehicleModelDate: car.year?.toString(),
        offers: {
          '@type': 'Offer',
          price: car.price,
          priceCurrency: 'USD'
        },
        url: `https://internationalcarcompanyinc.com/car/${car.id}`
      }
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

// Structured data for organization
export function OrganizationStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: 'International Car Company Inc',
    description: 'Premium used car dealership in Harbor City, CA offering quality pre-owned vehicles with competitive financing.',
    url: 'https://internationalcarcompanyinc.com',
    logo: 'https://internationalcarcompanyinc.com/prestige-auto-sales-logo.png',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '24328 S Vermont Ave Suite #215',
      addressLocality: 'Harbor City',
      addressRegion: 'CA',
      postalCode: '90710',
      addressCountry: 'US'
    },
    telephone: '+1 310-350-7709',
    email: 'info@internationalcarcompanyinc.com',
    openingHours: [
      'Mo-Su 09:00-17:00'
    ],
    priceRange: '$$',
    paymentAccepted: [
      'Cash',
      'Credit Card',
      'Financing'
    ],
    areaServed: {
      '@type': 'City',
      name: 'Harbor City'
    },
    serviceArea: {
      '@type': 'City',
      name: 'Los Angeles County'
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Vehicle Inventory',
      itemListElement: []
    },
    sameAs: [
      'https://maps.app.goo.gl/aJ8ZksnKGYunr8VZ7?g_st=iw'
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

// Structured data for FAQ page
export function FAQStructuredData({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
