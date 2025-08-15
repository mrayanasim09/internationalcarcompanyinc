"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)

    try {
      const res = await fetch('/api/admin/login-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': (document.cookie.match(/(?:^|; )csrf_token=([^;]*)/)?.[1] ?? '') },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Login failed')
      
      // Set admin access for error monitoring
      localStorage.setItem('icc-admin-access', 'true')
      localStorage.setItem('icc-admin-login-time', new Date().toISOString())
      
      toast({
        title: "Success",
        description: data?.requiresEmailVerification ? 'Verification code sent to your email' : 'Logged in successfully',
      })
      // Redirect to admin dashboard after successful login
      if (data?.requiresEmailVerification) {
        router.push('/admin/login')
      } else {
        router.push("/admin/dashboard")
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Firebase removed; always show standard login form

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">
            International Car Company Inc
          </h1>
          <h2 className="mt-2 text-xl text-muted-foreground">Admin Login</h2>
        </div>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

          </form>
        </CardContent>
      </div>
    </div>
  )
} 
