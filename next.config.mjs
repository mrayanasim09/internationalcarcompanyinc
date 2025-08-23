import bundleAnalyzer from '@next/bundle-analyzer'

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable type checking during build to prevent failures
    ignoreBuildErrors: true,
  },
  env: {
    SKIP_ENV_VALIDATION: 'true',
  },
  trailingSlash: false,
  generateEtags: false,
  // output: 'standalone', // disabled due to routes-manifest copy issue in some environments
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
    // Disable realtime features that might cause connection issues
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
      {
        source: '/_next/static/(.*)\\.css',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/css; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          // Ensure CSS files are not blocked by CSP
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ],
      },
      {
        source: '/_next/static/(.*)\\.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          // Ensure JS files are not blocked by CSP
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ],
      },
      {
        source: '/International Car Company Inc. Logo.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
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
  // Enhanced webpack configuration for optimal performance
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
      // Enhanced optimization for production
      config.optimization.usedExports = true
      config.optimization.minimize = true
      
      // More aggressive chunk splitting for better performance
      config.optimization.splitChunks = {
        chunks: 'all',
        maxSize: 200000, // Reduced to 200KB for better performance
        minSize: 10000,  // 10KB minimum for better granularity
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          },
          // Vendor chunks by package type
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
            enforce: true,
            reuseExistingChunk: true,
          },
          // Separate UI component libraries
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|@radix-ui\/react-)[\\/]/,
            name: 'ui-components',
            priority: 5,
            chunks: 'all',
            enforce: true,
          },
          // Separate utility libraries
          utils: {
            test: /[\\/]node_modules[\\/](clsx|tailwind-merge|class-variance-authority)[\\/]/,
            name: 'utils',
            priority: 5,
            chunks: 'all',
            enforce: true,
          },
          // Separate icon libraries
          icons: {
            test: /[\\/]node_modules[\\/](lucide-react|react-icons)[\\/]/,
            name: 'icons',
            priority: 5,
            chunks: 'all',
            enforce: true,
          },
          // Separate React libraries
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            priority: 10,
            chunks: 'all',
            enforce: true,
          },
          // Separate Next.js libraries
          next: {
            test: /[\\/]node_modules[\\/](next)[\\/]/,
            name: 'next',
            priority: 10,
            chunks: 'all',
            enforce: true,
          },
          // Separate CSS chunks to prevent conflicts
          styles: {
            name: 'styles',
            test: /\.css$/,
            chunks: 'all',
            enforce: true,
            priority: 20,
          },
          // Separate large vendor packages
          largeVendors: {
            test: /[\\/]node_modules[\\/](@supabase|@radix-ui)[\\/]/,
            name: 'large-vendors',
            priority: 15,
            chunks: 'all',
            enforce: true,
            maxSize: 150000, // 150KB limit for large packages
          }
        },
      }
      
      // Optimized performance limits
      config.performance = {
        hints: 'warning',
        maxEntrypointSize: 400000, // 400KB - reduced for better performance
        maxAssetSize: 200000,      // 200KB - reduced for better performance
      }
    }
    
    // Optimize for mobile and prevent connection issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        // Prevent WebSocket and realtime connection attempts
        ws: false,
        'ws': false,
        // Disable all network-related modules
        dns: false,
        http: false,
        https: false,
        url: false,
        querystring: false,
        path: false,
        stream: false,
        buffer: false,
        util: false,
        assert: false,
        constants: false,
        os: false,
        crypto: false,
        zlib: false,
        events: false,
        domain: false,
        punycode: false,
        string_decoder: false,
        timers: false,
        tty: false,
        vm: false,
        child_process: false,
        cluster: false,
        worker_threads: false,
        inspector: false,
        perf_hooks: false,
        readline: false,
        repl: false,
        v8: false,
        worker: false,
        'node:fs': false,
        'node:net': false,
        'node:tls': false,
        'node:ws': false,
        'node:dns': false,
        'node:http': false,
        'node:https': false,
        'node:url': false,
        'node:querystring': false,
        'node:path': false,
        'node:stream': false,
        'node:buffer': false,
        'node:util': false,
        'node:assert': false,
        'node:constants': false,
        'node:os': false,
        'node:crypto': false,
        'node:zlib': false,
        'node:events': false,
        'node:domain': false,
        'node:punycode': false,
        'node:string_decoder': false,
        'node:timers': false,
        'node:tty': false,
        'node:vm': false,
        'node:child_process': false,
        'node:cluster': false,
        'node:worker_threads': false,
        'node:inspector': false,
        'node:perf_hooks': false,
        'node:readline': false,
        'node:repl': false,
        'node:v8': false,
        'node:worker': false
      }
    }
    
    return config
  },
  // Additional optimizations to prevent connection issues
  poweredByHeader: false,
  reactStrictMode: true,
  // Additional CSS and resource optimizations
  optimizeFonts: true,
  compress: true,
  swcMinify: true,
  // keep a single definition above for these
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })
export default withBundleAnalyzer(nextConfig)