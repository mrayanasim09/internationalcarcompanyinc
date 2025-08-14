"use client"

import { useState, useEffect } from "react"

import dynamic from 'next/dynamic'
const EmailAdminLogin = dynamic(() => import("@/components/admin/email-admin-login").then(m => m.EmailAdminLogin), { ssr: false })
const AdminDashboard = dynamic(() => import("@/components/admin/admin-dashboard").then(m => m.AdminDashboard), { ssr: false })
import { useAuth } from "@/lib/auth-context"

export default function AdminPage() {
  const { user, loading } = useAuth()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Force client rendering, avoid RSC hydration errors
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!loading) {
      setIsAuthenticated(Boolean(user))
    }
  }, [user, loading])

  if (!mounted) {
    return <div className="min-h-screen" />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return isAuthenticated ? <AdminDashboard /> : <EmailAdminLogin />
} 
