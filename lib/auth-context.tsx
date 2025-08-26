"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { usePathname } from "next/navigation"

interface AuthUser {
  email: string
  role: 'viewer' | 'editor' | 'admin' | 'super_admin'
  permissions?: string[]
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('DEBUG: AuthProvider mounted, pathname:', pathname)
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('DEBUG: AuthProvider checking authentication...')
        const response = await fetch('/api/admin/me', {
          credentials: 'include',
          cache: 'no-store'
        })
        
        console.log('DEBUG: AuthProvider response status:', response.status)
        console.log('DEBUG: AuthProvider response ok:', response.ok)
        
        if (response.ok) {
          const data = await response.json()
          console.log('DEBUG: AuthProvider received data:', data)
          console.log('DEBUG: AuthProvider data.authenticated:', data.authenticated)
          console.log('DEBUG: AuthProvider data.email:', data.email)
          console.log('DEBUG: AuthProvider data.role:', data.role)
          console.log('DEBUG: AuthProvider response headers:', Object.fromEntries(response.headers.entries()))
          
          if (data.authenticated && data.email) {
            setUser({
              email: data.email,
              role: data.role || 'viewer',
              permissions: data.permissions
            })
            console.log('DEBUG: AuthProvider set user:', data.email)
          } else {
            setUser(null)
            console.log('DEBUG: AuthProvider: not authenticated - data:', data)
          }
        } else {
          console.log('DEBUG: AuthProvider: /me endpoint returned', response.status)
          const errorText = await response.text()
          console.log('DEBUG: AuthProvider error response:', errorText)
          setUser(null)
        }
      } catch (error) {
        console.error('DEBUG: AuthProvider error:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [pathname])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

