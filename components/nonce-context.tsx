"use client"

import React, { createContext, useContext } from 'react'

// Nonce context for CSP compliance
const NonceContext = createContext<string | undefined>(undefined)

// Nonce provider component
export function NonceProvider({ nonce, children }: { nonce?: string; children: React.ReactNode }) {
  return (
    <NonceContext.Provider value={nonce}>
      {children}
    </NonceContext.Provider>
  )
}

// Hook to access nonce in components
export function useNonce(): string | undefined {
  return useContext(NonceContext)
}

// Higher-order component for nonce injection
export function withNonce<P extends { nonce?: string }>(
  Component: React.ComponentType<P>
): React.ComponentType<Omit<P, 'nonce'>> {
  return function NonceWrappedComponent(props: Omit<P, 'nonce'>) {
    const nonce = useNonce()
    return <Component {...(props as P)} nonce={nonce} />
  }
}


