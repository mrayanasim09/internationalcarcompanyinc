import bundleAnalyzer from '@next/bundle-analyzer'

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