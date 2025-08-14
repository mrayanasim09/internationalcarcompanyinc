"use client"
import { EmailAdminLogin } from "@/components/admin/email-admin-login"
import { ErrorBoundary } from '@/components/error-boundary'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function AdminLoginPage() {
  return (
    <>
      <ErrorBoundary>
        <EmailAdminLogin />
      </ErrorBoundary>
    </>
  )
} 
