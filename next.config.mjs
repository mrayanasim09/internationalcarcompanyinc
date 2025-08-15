import bundleAnalyzer from '@next/bundle-analyzer'

// CSP Configuration
const cspConfig = {
  // Default source restrictions
  defaultSrc: ["'self'"],
  
  // Script sources - allow necessary external scripts
  scriptSrc: [
    "'self'",
    "'unsafe-inline'", // Required for Next.js
    "'unsafe-eval'",   // Required for Next.js development
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://www.gstatic.com",
    "https://unpkg.com" // Allow web-vitals script
  ],
  
  // Script source elements - specifically for script tags
  scriptSrcElem: [
    "'self'",
    "'unsafe-inline'",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://www.gstatic.com",
    "https://unpkg.com"
  ],
  
  // Style sources - allow Google Fonts and inline styles
  styleSrc: [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind CSS
    "https://fonts.googleapis.com"
  ],
  
  // Font sources - allow Google Fonts
  fontSrc: [
    "'self'",
    "https://fonts.gstatic.com",
    "data:"
  ],
  
  // Image sources - allow various image sources
  imgSrc: [
    "'self'",
    "data:",
    "https:",
    "blob:",
    "https://*.supabase.co"
  ],
  
  // Media sources
  mediaSrc: ["'self'"],
  
  // Connect sources - allow external connections for analytics
  connectSrc: [
    "'self'",
    "https://www.google-analytics.com",
    "https://region1.google-analytics.com",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://www.google.com",
    "https://maps.googleapis.com",
    "https://www.googletagmanager.com"
  ],
  
  // Object sources - block potentially dangerous objects
  objectSrc: ["'none'"],
  
  // Base URI - restrict base tag usage
  baseUri: ["'self'"],
  
  // Form actions - restrict form submissions
  formAction: ["'self'"],
  
  // Frame ancestors - prevent clickjacking
  frameAncestors: ["'none'"],
  
  // Upgrade insecure requests
  upgradeInsecureRequests: true,
  
  // Block mixed content
  blockAllMixedContent: true
}

function generateCSPHeader() {
  const directives = [
    `default-src ${cspConfig.defaultSrc.join(' ')}`,
    `script-src ${cspConfig.scriptSrc.join(' ')}`,
    `script-src-elem ${cspConfig.scriptSrcElem.join(' ')}`,
    `style-src ${cspConfig.styleSrc.join(' ')}`,
    `font-src ${cspConfig.fontSrc.join(' ')}`,
    `img-src ${cspConfig.imgSrc.join(' ')}`,
    `media-src ${cspConfig.mediaSrc.join(' ')}`,
    `connect-src ${cspConfig.connectSrc.join(' ')}`,
    `object-src ${cspConfig.objectSrc.join(' ')}`,
    `base-uri ${cspConfig.baseUri.join(' ')}`,
    `form-action ${cspConfig.formAction.join(' ')}`,
    `frame-ancestors ${cspConfig.frameAncestors.join(' ')}`,
    'upgrade-insecure-requests',
    'block-all-mixed-content'
  ]
  
  // Add CSP report-uri for monitoring violations
  if (process.env.NODE_ENV === 'development') {
    directives.push(`report-uri /api/csp-report`)
  }
  
  return directives.join('; ')
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    SKIP_ENV_VALIDATION: 'true',
  },
  trailingSlash: false,
  generateEtags: false,
  output: 'standalone',
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-icons', 
      'react-icons',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast'
    ],
    // Remove all problematic experimental features
    optimizeCss: false,
    // Disable RSC query parameters
    serverComponentsExternalPackages: [],
    // Disable RSC query parameters
    ppr: false,
    // Disable RSC query parameters in URLs
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Disable RSC query parameters and optimize for production
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: undefined,
    unoptimized: false,
    loader: 'default',
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Content Security Policy (CSP)
          {
            key: 'Content-Security-Policy',
            value: generateCSPHeader()
          },
          // CSP Report-Only for development (monitors violations without blocking)
          ...(process.env.NODE_ENV === 'development' ? [{
            key: 'Content-Security-Policy-Report-Only',
            value: generateCSPHeader()
          }] : []),
          // Referrer Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // X-Frame-Options (replaced by CSP frame-ancestors)
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // Cross Origin Resource Policy
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin'
          },
          // Cross Origin Opener Policy
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          // Cross Origin Embedder Policy - disabled to avoid breaking third-party resources
          // {
          //   key: 'Cross-Origin-Embedder-Policy',
          //   value: 'require-corp'
          // },
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()'
          },
          {
            key: 'Report-To',
            value: JSON.stringify({
              group: 'csp-endpoint',
              max_age: 10886400,
              endpoints: [{ url: process.env.CSP_REPORT_URI || 'https://internationalcarcompanyinc.com/api/csp-report' }]
            })
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none'
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
          // Additional security headers for API routes
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          // Security headers for static assets
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ],
      },
    ]
  },
  async rewrites() {
    return []
  },
  async redirects() {
    return [
      {
        source: '/listings',
        destination: '/inventory',
        permanent: true,
      },
    ]
  },
  // Simplified webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Silence known harmless warning from @supabase/realtime-js dynamic import
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /@supabase[\\/]realtime-js[\\/]/,
        message: /Critical dependency: the request of a dependency is an expression/
      }
    ]
    
    if (!dev && !isServer) {
      // Basic optimization without aggressive chunking
      config.optimization.usedExports = true
      config.optimization.minimize = true
      
      // Simplified chunk splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        maxSize: 500000, // Increased to 500KB for stability
        minSize: 20000,
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
        },
      }
      
      // Realistic performance limits
      config.performance = {
        hints: 'warning',
        maxEntrypointSize: 1000000, // 1MB
        maxAssetSize: 500000, // 500KB
      }
    }
    
    // Optimize for mobile
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    return config
  },
  compress: true,
  swcMinify: true,
  generateEtags: false,
  trailingSlash: false,
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })
export default withBundleAnalyzer(nextConfig)