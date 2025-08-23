import DOMPurify from 'dompurify'
import type { Config as DOMPurifyConfig } from 'dompurify'

export interface SanitizationOptions {
  allowedTags?: string[]
  allowedAttributes?: Record<string, string[]>
  allowedSchemes?: string[]
  stripEmpty?: boolean
}

export class InputSanitizer {
  private static defaultOptions: SanitizationOptions = {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    allowedAttributes: {
      'a': ['href', 'title', 'target'],
      'img': ['src', 'alt', 'title']
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    stripEmpty: true
  }

  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  static sanitizeHTML(html: string, options?: SanitizationOptions): string {
    if (typeof html !== 'string') return ''
    
    const sanitizeOptions = { ...this.defaultOptions, ...options }
    
    try {
      // Server-side sanitization
      if (typeof window === 'undefined') {
        return this.sanitizeHTMLServer(html, sanitizeOptions)
      }

      // Map to DOMPurify expected config shape
      const allowedAttrsList = Object.values(sanitizeOptions.allowedAttributes || {})
        .reduce<string[]>((acc, arr) => acc.concat(arr), [])
      const purifyConfig: DOMPurifyConfig = {
        ALLOWED_TAGS: sanitizeOptions.allowedTags,
        ALLOWED_ATTR: Array.from(new Set(allowedAttrsList)),
      }

      return DOMPurify.sanitize(html, purifyConfig) as unknown as string
    } catch (error) {
      console.warn('HTML sanitization failed, using fallback:', error)
      return this.sanitizeHTMLFallback(html)
    }
  }

  /**
   * Sanitize plain text input
   */
  static sanitizeText(text: string, maxLength: number = 1000): string {
    if (typeof text !== 'string') return ''
    
    return text
      .trim()
      .slice(0, maxLength)
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
  }

  /**
   * Sanitize email addresses
   */
  static sanitizeEmail(email: string): string {
    if (typeof email !== 'string') return ''
    
    const sanitized = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    return emailRegex.test(sanitized) ? sanitized : ''
  }

  /**
   * Sanitize phone numbers
   */
  static sanitizePhone(phone: string): string {
    if (typeof phone !== 'string') return ''
    
    return phone
      .replace(/[^\d+\-\(\)\s]/g, '') // Keep only digits, +, -, (, ), and spaces
      .trim()
      .slice(0, 20) // Limit length
  }

  /**
   * Sanitize URLs
   */
  static sanitizeURL(url: string): string {
    if (typeof url !== 'string') return ''
    
    const sanitized = url.trim()
    
    // Check if it's a valid URL
    try {
      const urlObj = new URL(sanitized)
      // Only allow http, https, mailto, tel protocols
      if (['http:', 'https:', 'mailto:', 'tel:'].includes(urlObj.protocol)) {
        return sanitized
      }
    } catch {
      // If not a valid URL, return empty string
    }
    
    return ''
  }

  /**
   * Sanitize form data object
   */
  static sanitizeFormData<T extends Record<string, unknown>>(data: T): T {
    const result = { ...data }
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        ;(result as Record<string, unknown>)[key] = this.sanitizeText(value)
      } else if (typeof value === 'object' && value !== null) {
        ;(result as Record<string, unknown>)[key] = this.sanitizeFormData(value as Record<string, unknown>)
      } else {
        ;(result as Record<string, unknown>)[key] = value
      }
    }
    return result
  }

  /**
   * Server-side HTML sanitization fallback
   */
  private static sanitizeHTMLServer(html: string, options: SanitizationOptions): string {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove object tags
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '') // Remove embed tags
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .replace(/data:/gi, '') // Remove data: protocol
  }

  /**
   * Basic fallback sanitization
   */
  private static sanitizeHTMLFallback(html: string): string {
    return html.replace(/[<>]/g, '')
  }
}

// Export convenience functions
export const sanitizeHTML = InputSanitizer.sanitizeHTML
export const sanitizeText = InputSanitizer.sanitizeText
export const sanitizeEmail = InputSanitizer.sanitizeEmail
export const sanitizePhone = InputSanitizer.sanitizePhone
export const sanitizeURL = InputSanitizer.sanitizeURL
export const sanitizeFormData = InputSanitizer.sanitizeFormData
