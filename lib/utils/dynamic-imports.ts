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
  
  // Heavy UI components
  Dialog: dynamic(() => import('@/components/ui/dialog'), {
    loading: () => <div className="skeleton h-32 w-full" />,
  }),
  
  DropdownMenu: dynamic(() => import('@/components/ui/dropdown-menu'), {
    loading: () => <div className="skeleton h-32 w-full" />,
  }),
  
  Select: dynamic(() => import('@/components/ui/select'), {
    loading: () => <div className="skeleton h-32 w-full" />,
  }),
  
  Tabs: dynamic(() => import('@/components/ui/tabs'), {
    loading: () => <div className="skeleton h-32 w-full" />,
  }),
  
  Toast: dynamic(() => import('@/components/ui/toast'), {
    loading: () => <div className="skeleton h-32 w-full" />,
  }),
  
  // Page components - lazy load non-critical pages
  AboutPage: dynamic(() => import('@/app/about/page'), {
    loading: () => <div className="skeleton h-96 w-full" />,
  }),
  
  ContactPage: dynamic(() => import('@/app/contact/page'), {
    loading: () => <div className="skeleton h-96 w-full" />,
  }),
  
  FAQPage: dynamic(() => import('@/app/faq/page'), {
    loading: () => <div className="skeleton h-96 w-full" />,
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

// Bundle size optimization utilities
export const bundleOptimizations = {
  // Split heavy libraries
  splitLibraries: {
    // Split Radix UI into smaller chunks
    radixUI: {
      accordion: () => import('@radix-ui/react-accordion'),
      dialog: () => import('@radix-ui/react-dialog'),
      dropdown: () => import('@radix-ui/react-dropdown-menu'),
      select: () => import('@radix-ui/react-select'),
      tabs: () => import('@radix-ui/react-tabs'),
      toast: () => import('@radix-ui/react-toast'),
    },
    
    // Split Lucide icons
    lucide: {
      basic: () => import('lucide-react/dist/esm/icons/chevron-down'),
      navigation: () => import('lucide-react/dist/esm/icons/menu'),
      actions: () => import('lucide-react/dist/esm/icons/plus'),
    },
    
    // Split React Icons
    reactIcons: {
      basic: () => import('react-icons/fa'),
      social: () => import('react-icons/io'),
      business: () => import('react-icons/md'),
    },
  },
  
  // Lazy load routes
  lazyRoutes: {
    about: () => import('@/app/about/page'),
    contact: () => import('@/app/contact/page'),
    faq: () => import('@/app/faq/page'),
    inventory: () => import('@/app/inventory/page'),
    browse: () => import('@/app/browse/page'),
    listings: () => import('@/app/listings/page'),
  },
}
