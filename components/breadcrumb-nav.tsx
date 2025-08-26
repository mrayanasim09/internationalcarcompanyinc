"use client"

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { usePathname } from 'next/navigation'

interface BreadcrumbItem {
  label: string
  href: string
  isCurrent?: boolean
}

export function BreadcrumbNav() {
  const pathname = usePathname()
  
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
    ]
    
    let currentPath = ''
    
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      
      // Convert segment to readable label
      let label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      // Special cases for better readability
      const labelMap: Record<string, string> = {
        'inventory': 'Inventory',
        'about': 'About Us',
        'contact': 'Contact',
        'faq': 'FAQ',
        'privacy': 'Privacy Policy',
        'terms': 'Terms of Service',
        'security': 'Security',
        'admin': 'Admin Panel',
        'dashboard': 'Dashboard',
        'analytics': 'Analytics',
        'messages': 'Messages',
        'reviews': 'Reviews',
        'users': 'User Management',
        'cars': 'Car Management'
      }
      
      if (labelMap[segment]) {
        label = labelMap[segment]
      }
      
      const isCurrent = index === segments.length - 1
      
      breadcrumbs.push({
        label,
        href: currentPath,
        isCurrent
      })
    })
    
    return breadcrumbs
  }
  
  const breadcrumbs = generateBreadcrumbs()
  
  // Don't show breadcrumbs on home page
  if (breadcrumbs.length <= 1) {
    return null
  }
  
  return (
    <nav aria-label="Breadcrumb" className="py-4 px-4 md:px-6 bg-muted/30 border-b border-border">
      <div className="container mx-auto">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={breadcrumb.href} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" aria-hidden="true" />
              )}
              
              {breadcrumb.isCurrent ? (
                <span 
                  className="text-foreground font-medium"
                  aria-current="page"
                >
                  {breadcrumb.label}
                </span>
              ) : (
                <Link
                  href={breadcrumb.href}
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  {breadcrumb.href === '/' ? (
                    <Home className="h-4 w-4" />
                  ) : null}
                  {breadcrumb.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )
}

// Structured data for breadcrumbs (SEO)
export function BreadcrumbStructuredData({ breadcrumbs }: { breadcrumbs: BreadcrumbItem[] }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.label,
      item: `https://internationalcarcompanyinc.com${breadcrumb.href}`
    }))
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
