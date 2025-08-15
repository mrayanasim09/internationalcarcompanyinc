"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('DEBUG: AuthProvider checking authentication...')
        const response = await fetch('/api/admin/me', {
          credentials: 'include',
          cache: 'no-store'
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('DEBUG: AuthProvider received data:', data)
          
          if (data.authenticated && data.email) {
            setUser({
              email: data.email,
              role: data.role || 'viewer',
              permissions: data.permissions
            })
            console.log('DEBUG: AuthProvider set user:', data.email)
          } else {
            setUser(null)
            console.log('DEBUG: AuthProvider: not authenticated')
          }
        } else {
          console.log('DEBUG: AuthProvider: /me endpoint returned', response.status)
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
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

