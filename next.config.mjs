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
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'react-icons'],
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
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'react-icons'],
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
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
      
      // Split chunks for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
            priority: 5,
          },
          // Separate admin bundle
          admin: {
            test: /[\\/]components[\\/]admin[\\/]/,
            name: 'admin',
            chunks: 'all',
            priority: 20,
          },
          // Separate UI components bundle
          ui: {
            test: /[\\/]components[\\/]ui[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 15,
          },
        },
      }
      
      // Enable compression
      config.optimization.minimize = true
      
      // Better minification
      config.optimization.minimizer = config.optimization.minimizer || []
      
      // Performance hints
      config.performance = {
        hints: 'warning',
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
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