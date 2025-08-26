"use client"

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const AdminDashboard = dynamic(() => import("@/components/admin/admin-dashboard").then(m => m.AdminDashboard), { 
  ssr: false,
  loading: () => <LoadingSpinner text="Loading Admin Dashboard..." />
})

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <LoadingSpinner text="Loading Admin Dashboard..." />
  }

  return <AdminDashboard />
}
