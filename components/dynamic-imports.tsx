import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

// Dynamic imports for heavy components to reduce initial bundle size
export const DynamicAdvancedSearch = dynamic(
  () => import('./advanced-search').then(mod => ({ default: mod.AdvancedSearch })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
)

export const DynamicPerformanceDashboard = dynamic(
  () => import('./performance-dashboard').then(mod => ({ default: mod.PerformanceDashboard })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
)

export const DynamicServiceWorkerRegister = dynamic(
  () => import('./service-worker-register').then(mod => ({ default: mod.ServiceWorkerRegister })),
  {
    loading: () => null,
    ssr: false,
  }
)

// Simplified breadcrumb nav - import directly to avoid webpack issues
export const DynamicBreadcrumbNav = dynamic(
  () => import('./breadcrumb-nav').then(mod => ({ default: mod.BreadcrumbNav })),
  {
    loading: () => null,
    ssr: true,
  }
)

// Simplified structured data imports
export const DynamicCarStructuredData = dynamic(
  () => import('./car-structured-data').then(mod => ({ default: mod.CarStructuredData })),
  {
    loading: () => null,
    ssr: true,
  }
)

export const DynamicCarListingsStructuredData = dynamic(
  () => import('./car-structured-data').then(mod => ({ default: mod.CarListingsStructuredData })),
  {
    loading: () => null,
    ssr: true,
  }
)

export const DynamicOrganizationStructuredData = dynamic(
  () => import('./car-structured-data').then(mod => ({ default: mod.OrganizationStructuredData })),
  {
    loading: () => null,
    ssr: true,
  }
)

// Lazy load admin components
export const DynamicAdminDashboard = dynamic(
  () => import('./admin/admin-dashboard').then(mod => ({ default: mod.AdminDashboard })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
)

export const DynamicCarManagement = dynamic(
  () => import('./admin/car-management').then(mod => ({ default: mod.CarManagement })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
)

export const DynamicReviewManagement = dynamic(
  () => import('./admin/review-management').then(mod => ({ default: mod.ReviewManagement })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
)

// Lazy load heavy UI components
export const DynamicCarComparison = dynamic(
  () => import('./car-comparison').then(mod => ({ default: mod.CarComparison })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
)

export const DynamicFilterPanel = dynamic(
  () => import('./filter-panel').then(mod => ({ default: mod.FilterPanel })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
)

// Generic dynamic import wrapper with error handling
export function withDynamicImport<T extends React.ComponentType<Record<string, unknown>>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    loading?: React.ComponentType
    ssr?: boolean
    fallback?: React.ReactNode
  } = {}
) {
  const { loading: LoadingComponent, ssr = true, fallback } = options
  
  const DynamicComponent = dynamic(importFn, {
    loading: LoadingComponent ? () => <LoadingComponent /> : undefined,
    ssr,
  })
  
  if (fallback) {
    const WrappedComponent = (props: React.ComponentProps<T>) => (
      <Suspense fallback={fallback}>
        <DynamicComponent {...props} />
      </Suspense>
    )
    WrappedComponent.displayName = `withDynamicImport(${DynamicComponent.displayName || 'Component'})`
    return WrappedComponent
  }
  
  return DynamicComponent
}

// Preload critical components with error handling
export function preloadCriticalComponents() {
  try {
    // Preload components that are likely to be needed soon
    import('./advanced-search').catch(console.warn)
    import('./breadcrumb-nav').catch(console.warn)
    import('./car-structured-data').catch(console.warn)
  } catch (error) {
    console.warn('Failed to preload critical components:', error)
  }
}

// Preload admin components when needed with error handling
export function preloadAdminComponents() {
  try {
    import('./admin/admin-dashboard').catch(console.warn)
    import('./admin/car-management').catch(console.warn)
    import('./admin/review-management').catch(console.warn)
  } catch (error) {
    console.warn('Failed to preload admin components:', error)
  }
}
