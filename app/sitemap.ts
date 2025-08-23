import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://internationalcarcompanyinc.com'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/inventory`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/browse`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/listings`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/security`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ]

  // Dynamic car pages from database
  let carPages: MetadataRoute.Sitemap = []
  
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
      
      const { data: cars, error } = await supabase
        .from('cars')
        .select('id, title, updated_at')
        .eq('approved', true)
        .order('updated_at', { ascending: false })
        .limit(1000) // Limit to prevent sitemap from becoming too large
      
      if (!error && cars) {
        carPages = cars.map(car => ({
          url: `${baseUrl}/car/${car.id}`,
          lastModified: car.updated_at ? new Date(car.updated_at) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }))
      }
    }
  } catch (error) {
    console.error('Error generating car sitemap:', error)
    // Fallback to static car pages if database fails
    carPages = [
      {
        url: `${baseUrl}/car/fallback-1`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
    ]
  }

  // Admin pages (lower priority, noindex in production)
  const adminPages = [
    {
      url: `${baseUrl}/admin`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.1,
    },
    {
      url: `${baseUrl}/admin/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.1,
    },
  ]

  return [...staticPages, ...carPages, ...adminPages]
}
