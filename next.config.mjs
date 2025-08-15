import bundleAnalyzer from '@next/bundle-analyzer'

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false, // Disable for production
  // Unblock CI builds by ignoring ESLint during next build. We will lint in CI separately.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Build-time configuration
  env: {
    // Disable environment validation during build
    SKIP_ENV_VALIDATION: 'true',
  },
  // Skip static generation for problematic routes
  trailingSlash: false,
  generateEtags: false,
  // Disable static generation entirely for dynamic car data
  output: 'standalone',
  // Disable static generation for dynamic routes
  experimental: {
    // optimizeCss: true, // Disabled due to critters module issues
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
    // Enable modern optimizations
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    // Performance optimizations
    optimizeCss: false, // Disabled due to critters issues
    // Modern JavaScript features
    esmExternals: 'loose',
    // Bundle optimization
    bundlePagesExternals: true,
  },
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
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: false,
    // Do not set a conflicting CSP here; it can clash with our middleware CSP
    contentSecurityPolicy: undefined,
    // Enable modern image formats
    unoptimized: false,
    // Better image optimization
    loader: 'default',
    loaderFile: undefined,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // CSP is set dynamically with nonces in middleware
          {
            key: 'Report-To',
            value: JSON.stringify({
              group: 'csp-endpoint',
              max_age: 10886400,
              endpoints: [{ url: process.env.CSP_REPORT_URI || 'https://internationalcarcompanyinc.com/api/csp-report' }]
            })
          },
          // Additional security headers not covered by middleware
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
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  async rewrites() {
    // Use static public/robots.txt
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
  // Optimize bundle size
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
      // Enable tree shaking
      config.optimization.usedExports = true
      config.optimization.sideEffects = false
      
      // Split chunks for better caching and smaller bundles
      config.optimization.splitChunks = {
        chunks: 'all',
        maxSize: 200000, // 200KB to stay well under 250KB limit
        minSize: 20000, // 20KB minimum chunk size
        cacheGroups: {
          // Separate React and core libraries
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 40,
            enforce: true,
            maxSize: 150000, // 150KB for React
          },
          // Separate Next.js with smaller chunks
          next: {
            test: /[\\/]node_modules[\\/]next[\\/]/,
            name: 'next',
            chunks: 'all',
            priority: 35,
            enforce: true,
            maxSize: 100000, // 100KB for Next.js
          },
          // Separate Supabase
          supabase: {
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            name: 'supabase',
            chunks: 'all',
            priority: 30,
            enforce: true,
            maxSize: 150000, // 150KB for Supabase
          },
          // Separate UI libraries with smaller chunks
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|react-icons)[\\/]/,
            name: 'ui-libs',
            chunks: 'all',
            priority: 25,
            enforce: true,
            maxSize: 100000, // 100KB for UI libraries
          },
          // Separate admin bundle
          admin: {
            test: /[\\/]components[\\/]admin[\\/]/,
            name: 'admin',
            chunks: 'all',
            priority: 20,
            enforce: true,
            maxSize: 150000, // 150KB for admin
          },
          // Separate UI components bundle
          uiComponents: {
            test: /[\\/]components[\\/]ui[\\/]/,
            name: 'ui-components',
            chunks: 'all',
            priority: 15,
            enforce: true,
            maxSize: 100000, // 100KB for UI components
          },
          // Vendor bundle for remaining node_modules
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            enforce: true,
            maxSize: 150000, // 150KB for vendors
          },
          // Common bundle for shared code
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
            priority: 5,
            maxSize: 100000, // 100KB for common
          },
        },
      }
      
      // Enable compression
      config.optimization.minimize = true
      
      // Better minification
      config.optimization.minimizer = config.optimization.minimizer || []
      
      // Performance hints with realistic limits
      config.performance = {
        hints: 'warning',
        maxEntrypointSize: 400000, // 400KB to stay under 500KB
        maxAssetSize: 200000, // 200KB per asset
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
  // Enable compression
  compress: true,
  // Optimize for production
  swcMinify: true,
  // Better caching
  generateEtags: false,
  // Optimize static generation
  trailingSlash: false,
  // Better error handling
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}
const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })
export default withBundleAnalyzer(nextConfig)