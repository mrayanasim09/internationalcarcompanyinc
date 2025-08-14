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
    ;(async () => {
      try {
        console.log('DEBUG: AuthContext calling /api/admin/me...')
        const res = await fetch('/api/admin/me', { cache: 'no-store', credentials: 'include' })
        console.log('DEBUG: AuthContext /me response status:', res.status)
        
        if (!res.ok) {
          console.log('DEBUG: AuthContext /me not ok, throwing error')
          throw new Error('not authenticated')
        }
        
        const data = await res.json()
        console.log('DEBUG: AuthContext /me response data:', data)
        
        if (data?.authenticated) {
          console.log('DEBUG: AuthContext setting user:', { email: data.email, role: data.role })
          setUser({ email: data.email, role: data.role, permissions: data.permissions })
        } else {
          console.log('DEBUG: AuthContext no user data, setting null')
          setUser(null)
        }
      } catch (error) {
        console.log('DEBUG: AuthContext error:', error)
        setUser(null)
      } finally {
        console.log('DEBUG: AuthContext setting loading to false')
        setLoading(false)
      }
    })()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

