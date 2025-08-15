export const cspConfig = {
  // Default source restrictions
  defaultSrc: ["'self'"],
  
  // Script sources - allow necessary external scripts
  scriptSrc: [
    "'self'",
    "'unsafe-inline'", // Required for Next.js
    "'unsafe-eval'",   // Required for Next.js development
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://www.gstatic.com"
  ],
  
  // Style sources - allow Google Fonts and inline styles
  styleSrc: [
    "'self'",
    "'unsafe-inline", // Required for Tailwind CSS
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
  blockAllMixedContent: true,
  
  // Require trusted types (modern browsers)
  requireTrustedTypesFor: ["'script'"]
}

export function generateCSPHeader(nonce?: string): string {
  const directives = [
    `default-src ${cspConfig.defaultSrc.join(' ')}`,
    `script-src ${cspConfig.scriptSrc.join(' ')}${nonce ? ` 'nonce-${nonce}'` : ''}`,
    `style-src ${cspConfig.styleSrc.join(' ')}${nonce ? ` 'nonce-${nonce}'` : ''}`,
    `font-src ${cspConfig.fontSrc.join(' ')}`,
    `img-src ${cspConfig.imgSrc.join(' ')}`,
    `media-src ${cspConfig.mediaSrc.join(' ')}`,
    `object-src ${cspConfig.objectSrc.join(' ')}`,
    `base-uri ${cspConfig.baseUri.join(' ')}`,
    `form-action ${cspConfig.formAction.join(' ')}`,
    `frame-ancestors ${cspConfig.frameAncestors.join(' ')}`,
    'upgrade-insecure-requests',
    'block-all-mixed-content'
  ]
  
  return directives.join('; ')
}

export function generateReportOnlyCSPHeader(): string {
  return generateCSPHeader() + '; report-uri /api/csp-report'
}
