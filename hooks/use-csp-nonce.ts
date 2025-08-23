"use client"

import { useNonce } from '@/components/nonce-context'

/**
 * Hook to access CSP nonce for secure inline scripts and styles
 * @returns The current nonce value or undefined if not available
 */
export function useCSPNonce(): string | undefined {
  return useNonce()
}

/**
 * Hook to get nonce with fallback for development
 * @returns The current nonce value or a development fallback
 */
export function useSecureNonce(): string {
  const nonce = useNonce()
  
  // In development, provide a fallback nonce if none is available
  if (process.env.NODE_ENV === 'development' && !nonce) {
    return 'dev-nonce-fallback'
  }
  
  return nonce || ''
}

/**
 * Hook to check if nonce is available
 * @returns True if nonce is available, false otherwise
 */
export function useHasNonce(): boolean {
  const nonce = useNonce()
  return !!nonce
}


