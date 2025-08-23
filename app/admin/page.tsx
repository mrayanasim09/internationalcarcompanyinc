"use client"

import { useState, useEffect } from "react"

import dynamic from 'next/dynamic'
const EmailAdminLogin = dynamic(() => import("@/components/admin/email-admin-login").then(m => m.EmailAdminLogin), { ssr: false })
const AdminDashboard = dynamic(() => import("@/components/admin/admin-dashboard").then(m => m.AdminDashboard), { ssr: false })
import { useAuth } from "@/lib/auth-context"
import Image from "next/image"

export default function AdminPage() {
  const { user, loading } = useAuth()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Force client rendering, avoid RSC hydration errors
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('DEBUG: AdminPage auth state changed:', { user, loading, isAuthenticated })
    }
    if (!loading) {
      setIsAuthenticated(Boolean(user))
    }
  }, [user, loading])

  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('DEBUG: AdminPage render:', { mounted, loading, isAuthenticated, user })
  }

  // Loading fallback without inline scripts
  const Fallback = (
    <div className="p-4 text-sm text-muted-foreground">
      Admin portal is loading...
    </div>
  )

  if (!mounted) {
    if (process.env.NODE_ENV === 'development') {
      console.log('DEBUG: AdminPage not mounted yet')
    }
    return Fallback
  }

  if (loading) {
    if (process.env.NODE_ENV === 'development') {
      console.log('DEBUG: AdminPage loading...')
    }
    return (
      <>
        {Fallback}
        <div className="min-h-screen flex items-center justify-center">
          <div className="relative w-24 h-24 md:w-32 md:h-32 animate-pulse">
                    <Image
          src="/prestige-auto-sales-logo.png"
          alt="Prestige Auto Sales LLC Logo" 
              fill 
              className="object-contain" 
              priority 
              sizes="(max-width: 768px) 96px, 128px" 
            />
          </div>
        </div>
      </>
    )
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('DEBUG: AdminPage rendering:', isAuthenticated ? 'AdminDashboard' : 'EmailAdminLogin')
  }
  return isAuthenticated ? <AdminDashboard /> : <EmailAdminLogin />
} 
