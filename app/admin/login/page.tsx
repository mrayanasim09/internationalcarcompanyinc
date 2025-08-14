"use client"
import { EmailAdminLogin } from "@/components/admin/email-admin-login"
import { ErrorBoundary } from '@/components/error-boundary'

// Client page: let it be purely CSR; avoid static generation flags here

export default function AdminLoginPage() {
  return (
    <>
      <ErrorBoundary>
        <EmailAdminLogin />
      </ErrorBoundary>
    </>
  )
} 
