import Script from 'next/script'
import { headers } from 'next/headers'
import { EmailAdminLogin } from "@/components/admin/email-admin-login"
import { ErrorBoundary } from '@/components/error-boundary'

export const metadata = {
  title: "Admin Login - International Car Company Inc",
  description: "Admin access to manage car listings",
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function AdminLoginPage() {
  const nonce = typeof window === 'undefined' ? (headers().get('x-nonce') || undefined) : undefined
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  return (
    <>
      {siteKey ? (
        <Script src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`} strategy="afterInteractive" nonce={nonce} />
      ) : null}
      <ErrorBoundary>
        <EmailAdminLogin />
      </ErrorBoundary>
    </>
  )
} 
