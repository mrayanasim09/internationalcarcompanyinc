"use client"
import { EmailAdminLogin } from "@/components/admin/email-admin-login"
import { ErrorBoundary } from '@/components/error-boundary'
import { useEffect } from 'react'

// Client page: let it be purely CSR; avoid static generation flags here

export default function AdminLoginPage() {
  useEffect(() => {
    // Generate CSRF token on page load
    const generateCsrfToken = async () => {
      try {
        const response = await fetch('/api/csrf-debug', { method: 'GET' })
        if (response.ok) {
          const data = await response.json()
          // CSRF token will be set as a cookie automatically
          console.log('CSRF token generated successfully')
        }
      } catch (error) {
        console.warn('Failed to generate CSRF token:', error)
      }
    }
    
    generateCsrfToken()
  }, [])

  return (
    <>
      <ErrorBoundary>
        <EmailAdminLogin />
      </ErrorBoundary>
    </>
  )
} 
