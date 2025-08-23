// Debug configuration for the application
export const DEBUG_CONFIG = {
  // Enable debug logging only in development
  ENABLED: process.env.NODE_ENV === 'development',
  
  // Log levels
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Specific debug categories
  AUTH: process.env.NODE_ENV === 'development',
  API: process.env.NODE_ENV === 'development',
  ADMIN: process.env.NODE_ENV === 'development',
  PERFORMANCE: process.env.NODE_ENV === 'development',
  
  // Helper function for conditional logging
  log: (category: keyof typeof DEBUG_CONFIG, message: string, data?: any) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG[category]) {
      console.log(`DEBUG [${category.toUpperCase()}]:`, message, data || '')
    }
  },
  
  // Helper function for conditional error logging
  error: (category: keyof typeof DEBUG_CONFIG, message: string, error?: any) => {
    if (DEBUG_CONFIG.ENABLED && DEBUG_CONFIG[category]) {
      console.error(`DEBUG [${category.toUpperCase()}] ERROR:`, message, error || '')
    }
  }
}

// Environment-specific overrides
if (process.env.NODE_ENV === 'production') {
  // Force disable all debug logging in production
  Object.keys(DEBUG_CONFIG).forEach(key => {
    if (typeof DEBUG_CONFIG[key as keyof typeof DEBUG_CONFIG] === 'boolean') {
      (DEBUG_CONFIG as any)[key] = false
    }
  })
}
