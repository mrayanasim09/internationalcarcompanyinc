// Subresource Integrity (SRI) hashes for external resources
export const sriHashes: Record<string, string> = {
  // Google Fonts
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap': 'sha384-...', // Add actual hash
  
  // Google Analytics
  'https://www.googletagmanager.com/gtag/js?id=G-SV90G9ZG56': 'sha384-...', // Add actual hash
  
  // Other external resources
  'https://www.google-analytics.com/g/collect': 'sha384-...' // Add actual hash
}

export function getSriHash(url: string): string | undefined {
  return sriHashes[url]
}

export function addSriToScript(src: string): string {
  const hash = getSriHash(src)
  return hash ? `integrity="${hash}" crossorigin="anonymous"` : ''
}

export function addSriToLink(href: string): string {
  const hash = getSriHash(href)
  return hash ? `integrity="${hash}" crossorigin="anonymous"` : ''
}
