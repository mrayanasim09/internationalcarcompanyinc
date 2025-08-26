"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
// type import kept for reference of shape; not used directly
// import type { LoginResult } from "@/lib/simple-admin-auth"
import { Mail, Lock, Shield, ArrowLeft, RefreshCw } from "lucide-react"
import Image from "next/image"

export function EmailAdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'login' | 'verification'>('login')
  const [currentEmail, setCurrentEmail] = useState("")

  const [csrfToken, setCsrfToken] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  // Fetch CSRF token on component mount
  useEffect(() => {
    const fetchCSRFToken = async () => {
      try {
        const res = await fetch('/api/csrf-debug', {
          method: 'GET',
          credentials: 'include'
        })
        const data = await res.json()
        if (data.success && data.token) {
          setCsrfToken(data.token)
          console.log('CSRF token fetched for verification')
        }
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error)
      }
    }
    fetchCSRFToken()
  }, [])

  // Function to refresh CSRF token
  const refreshCSRFToken = async () => {
    try {
      const res = await fetch('/api/csrf-debug', {
        method: 'GET',
        credentials: 'include'
      })
      const data = await res.json()
      if (data.success && data.token) {
        setCsrfToken(data.token)
        console.log('CSRF token refreshed')
        return data.token
      }
    } catch (error) {
      console.error('Failed to refresh CSRF token:', error)
    }
    return null
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!csrfToken) {
      toast({
        title: "Error",
        description: "Security token not available. Please refresh the page.",
        variant: "destructive"
      })
      return
    }
    
    setIsLoading(true)

    try {
      // Refresh CSRF token before making the request
      const freshToken = await refreshCSRFToken()
      if (!freshToken) {
        toast({
          title: "Error",
          description: "Failed to refresh security token. Please refresh the page.",
          variant: "destructive",
        })
        return
      }

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)

      const start = await fetch('/api/admin/login-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': freshToken },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      
      if (start.status === 403) {
        // CSRF token issue - try to refresh and retry once
        const retryToken = await refreshCSRFToken()
        if (retryToken) {
          const retryStart = await fetch('/api/admin/login-start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-csrf-token': retryToken },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
            signal: controller.signal,
          })
          const retryResult = await retryStart.json().catch(() => ({} as unknown)) as { success?: boolean; requiresEmailVerification?: boolean; trusted?: boolean; message?: string; error?: string; debugCode?: string | number }
          
          if (retryStart.ok && retryResult?.success) {
            if (retryResult.trusted || retryResult.requiresEmailVerification) {
              setCurrentEmail(email)
              setStep('verification')
              if (retryResult.debugCode && process.env.NODE_ENV !== 'production') {
                // Autofill debug only when explicitly enabled on server AND not in production
                setVerificationCode(String(retryResult.debugCode))
              }
              if (!retryResult.trusted) {
                toast({ title: 'Verification Required', description: 'Please check your email for the verification code.', duration: 5000 })
              }
              return
            }
            // Fallback: treat as verification path
            setCurrentEmail(email)
            setStep('verification')
            return
          }
        }
        toast({
          title: "Security Error",
          description: "Security token expired. Please refresh the page and try again.",
          variant: "destructive",
        })
        return
      }

      const result = await start.json().catch(() => ({} as unknown)) as { success?: boolean; requiresEmailVerification?: boolean; trusted?: boolean; message?: string; error?: string; debugCode?: string | number }

      if (start.ok && result?.success) {
        if (result.trusted || result.requiresEmailVerification) {
          setCurrentEmail(email)
          setStep('verification')
          if (result.debugCode && process.env.NODE_ENV !== 'production') {
            // Autofill debug only when explicitly enabled on server AND not in production
            setVerificationCode(String(result.debugCode))
          }
          if (!result.trusted) {
            toast({ title: 'Verification Required', description: 'Please check your email for the verification code.', duration: 5000 })
          }
          return
        }
        // Fallback: treat as verification path
        setCurrentEmail(email)
        setStep('verification')
        return
      }
      toast({ title: 'Login Failed', description: result?.error || result?.message || 'Invalid credentials or blocked by rate limit', variant: 'destructive' })
    } catch (err) {
      console.error('Login error:', err)
      toast({
        title: "Error",
        description: (err instanceof Error && err.name === 'AbortError') ? 'Request timed out. Please try again.' : 'An unexpected error occurred. Please try again.',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Refresh CSRF token before making the request
      const freshToken = await refreshCSRFToken()
      if (!freshToken) {
        toast({
          title: "Error",
          description: "Failed to refresh security token. Please refresh the page.",
          variant: "destructive",
        })
        return
      }

      const verify = await fetch('/api/admin/login-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': freshToken
        },
        credentials: 'include',
        body: JSON.stringify({ email: currentEmail, code: verificationCode })
      })
      
      if (verify.status === 403) {
        // CSRF token issue - try to refresh and retry once
        const retryToken = await refreshCSRFToken()
        if (retryToken) {
          const retryVerify = await fetch('/api/admin/login-verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-csrf-token': retryToken
            },
            credentials: 'include',
            body: JSON.stringify({ email: currentEmail, code: verificationCode })
          })
          const retryResult = await retryVerify.json()
          if (retryVerify.ok && retryResult.success) {
            toast({
              title: "Verification Successful",
              description: "Welcome to the admin dashboard!",
            })
            
            // Debug: Check what cookies are set after verification
            if (process.env.NODE_ENV === 'development') {
              console.log('DEBUG: Verification successful, checking cookies...')
              console.log('DEBUG: All cookies:', document.cookie)
              console.log('DEBUG: Has icc_admin_verified:', document.cookie.includes('icc_admin_verified=1'))
            }
            
            // Simple redirect after successful verification
            setTimeout(() => {
              router.replace("/admin/dashboard")
            }, 1000)
            return
          }
        }
        toast({
          title: "Security Error",
          description: "Security token expired. Please refresh the page and try again.",
          variant: "destructive",
        })
        return
      }

      const result = await verify.json().catch(() => ({} as unknown)) as { success?: boolean; error?: string }

      if (verify.ok && result.success) {
        toast({
          title: "Verification Successful",
          description: "Welcome to the admin dashboard!",
        })
        
        // Debug: Check what cookies are set after verification
        if (process.env.NODE_ENV === 'development') {
          console.log('DEBUG: Verification successful, checking cookies...')
          console.log('DEBUG: All cookies:', document.cookie)
          console.log('DEBUG: Has icc_admin_verified:', document.cookie.includes('icc_admin_verified=1'))
        }
        
        // Simple redirect after successful verification
        setTimeout(() => {
          router.replace("/admin/dashboard")
        }, 1000)
      } else {
        const message = result.error || 'Invalid or expired code'
        // Auto-resend in cases where the server indicates no/expired code
        if (/No verification code|expired/i.test(message)) {
          try {
            await handleResendCode()
            toast({ title: 'New Code Sent', description: 'We sent you a new 6-digit code. Please check your email.' })
          } catch {}
        }
        toast({ title: "Verification Failed", description: message, variant: "destructive" })
      }
    } catch (err) {
      console.error('Verification error:', err)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // If already verified (short-lived flag), auto-redirect away from login
  useEffect(() => {
    const checkVerification = async () => {
      try {
        // Check if user has already verified 2FA in this session
        const hasFlag = typeof document !== 'undefined' && document.cookie.includes('icc_admin_verified=1')
        
        if (hasFlag) {
          // Simple redirect if verification flag is present
          router.replace('/admin/dashboard')
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.log('DEBUG: Verification check error:', error)
        }
      }
    }
    
    // Check once on mount
    void checkVerification()
  }, [router])

  const handleResendCode = async () => {
    setIsLoading(true)
    try {
      // Refresh CSRF token before making the request
      const freshToken = await refreshCSRFToken()
      if (!freshToken) {
        toast({
          title: "Error",
          description: "Failed to refresh security token. Please refresh the page.",
          variant: "destructive",
        })
        return
      }

      const res = await fetch('/api/admin/login-resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': freshToken },
        credentials: 'include',
        body: JSON.stringify({ email: currentEmail })
      })
      
      if (res.status === 403) {
        // CSRF token issue - try to refresh and retry once
        const retryToken = await refreshCSRFToken()
        if (retryToken) {
          const retryRes = await fetch('/api/admin/login-resend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-csrf-token': retryToken },
            credentials: 'include',
            body: JSON.stringify({ email: currentEmail })
          })
          const retryResult = await retryRes.json()
          if (retryRes.ok && retryResult.success) {
            toast({
              title: "Code Resent",
              description: "A new verification code has been sent to your email.",
            })
            return
          }
        }
        toast({
          title: "Security Error",
          description: "Security token expired. Please refresh the page and try again.",
          variant: "destructive",
        })
        return
      }

      const result = await res.json()
      if (result.success) {
        toast({
          title: "Code Resent",
          description: "A new verification code has been sent to your email.",
        })
      } else {
        toast({
          title: "Failed to Resend",
          description: result.message || result.error || "Failed to resend verification code.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Resend code error:', error)
      toast({
        title: "Error",
        description: "Failed to resend verification code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const goBackToLogin = () => {
    setStep('login')
    setVerificationCode("")
    setCurrentEmail("")

  }



  if (step === 'verification') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <h1 className="text-3xl font-bold text-foreground">
              International Car Company Inc
            </h1>
            <h2 className="mt-2 text-xl text-muted-foreground">Email Verification</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                We&apos;ve sent a 6-digit verification code to <strong>{currentEmail}</strong>. 
                Please enter the code below to complete your login.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleVerification} className="space-y-4">
              <div>
                <Label htmlFor="verification-code">Verification Code</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="verification-code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center font-mono text-lg tracking-wider"
                    maxLength={6}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendCode}
                    disabled={isLoading}
                    size="sm"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBackToLogin}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || verificationCode.length !== 6}
                  className="flex-1"
                >
                  {isLoading ? "Verifying..." : "Verify & Login"}
                </Button>
              </div>
              

              
              {/* Debug information */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                  <div className="font-semibold mb-2">Debug Info:</div>
                  <div>Email: {currentEmail}</div>
                  <div>Step: {step}</div>
                  <div>Cookies: {typeof document !== 'undefined' ? document.cookie : 'N/A'}</div>
                </div>
              )}
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Didn&apos;t receive the code? Check your spam folder or{" "}
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="text-primary hover:underline"
                >
                  request a new one
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {/* Logo Image */}
          <div className="flex justify-center mb-4">
            <div className="relative w-16 h-12">
                      <Image
          src="/prestige-auto-sales-logo.png"
          alt="Prestige Auto Sales LLC Logo"
                fill
                sizes="64px"
                priority
                className="object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            International Car Company Inc
          </h1>
          <h2 className="mt-2 text-xl text-muted-foreground">Admin Login</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@internationalcarcompanyinc.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              You&apos;ll receive a verification code via email
            </p>
          </div>

          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="text-sm"
            >
              ← Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
