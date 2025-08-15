import dynamic from 'next/dynamic'

// Dynamic imports for better code splitting
export const dynamicImports = {
  // Admin components - only load when needed
  AdminDashboard: dynamic(() => import('@/components/admin/admin-dashboard'), {
    loading: () => <div className="skeleton h-64 w-full" />,
    ssr: false,
  }),
  
  AdminLogin: dynamic(() => import('@/components/admin/admin-login'), {
    loading: () => <div className="skeleton h-64 w-full" />,
    ssr: false,
  }),
  
  // UI components - lazy load heavy components
  Carousel: dynamic(() => import('@/components/ui/carousel'), {
    loading: () => <div className="skeleton h-48 w-full" />,
  }),
  
  Chart: dynamic(() => import('@/components/ui/chart'), {
    loading: () => <div className="skeleton h-64 w-full" />,
    ssr: false,
  }),
  
  // Form components - only load when forms are used
  ReviewForm: dynamic(() => import('@/components/review-form'), {
    loading: () => <div className="skeleton h-96 w-full" />,
  }),
  
  // Chat components - load on demand
  AIChatbot: dynamic(() => import('@/components/ai-chatbot'), {
    loading: () => <div className="skeleton h-96 w-full" />,
    ssr: false,
  }),
  
  // Utility components
  DebugPanel: dynamic(() => import('@/components/debug-panel'), {
    loading: () => <div className="skeleton h-32 w-full" />,
    ssr: false,
  }),
}

// Lazy load utilities
export const lazyLoad = {
  // Load components only when in viewport
  whenVisible: (importFn: () => Promise<any>, options = {}) => {
    return dynamic(importFn, {
      loading: () => <div className="skeleton h-32 w-full" />,
      ssr: false,
      ...options,
    })
  },
  
  // Load components after user interaction
  onInteraction: (importFn: () => Promise<any>, options = {}) => {
    return dynamic(importFn, {
      loading: () => <div className="skeleton h-32 w-full" />,
      ssr: false,
      ...options,
    })
  },
  
  // Load components after delay
  afterDelay: (importFn: () => Promise<any>, delay = 1000, options = {}) => {
    return dynamic(importFn, {
      loading: () => <div className="skeleton h-32 w-full" />,
      ssr: false,
      ...options,
    })
  },
}

// Preload critical components
export const preloadComponents = () => {
  // Preload components that are likely to be needed
  if (typeof window !== 'undefined') {
    // Preload admin components if user is likely to access them
    const isAdminRoute = window.location.pathname.startsWith('/admin')
    if (isAdminRoute) {
      import('@/components/admin/admin-dashboard')
      import('@/components/admin/admin-login')
    }
    
    // Preload UI components that are commonly used
    import('@/components/ui/button')
    import('@/components/ui/card')
    import('@/components/ui/input')
  }
}
