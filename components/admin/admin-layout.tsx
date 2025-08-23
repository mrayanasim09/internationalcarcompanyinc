"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { BrandName } from "@/components/brand-name"
import dynamic from 'next/dynamic'
const LayoutDashboard = dynamic(() => import('lucide-react').then(m => m.LayoutDashboard))
const CarIcon = dynamic(() => import('lucide-react').then(m => m.Car))
const LogOut = dynamic(() => import('lucide-react').then(m => m.LogOut))
const Menu = dynamic(() => import('lucide-react').then(m => m.Menu))
const X = dynamic(() => import('lucide-react').then(m => m.X))
const Home = dynamic(() => import('lucide-react').then(m => m.Home))
import { ThemeToggle } from "@/components/theme-toggle"
import Image from 'next/image'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Do not render the admin shell on the login page
  if (pathname === '/admin/login') {
    return (
      <main className="min-h-screen bg-background text-foreground p-4 sm:p-6">
        {children}
      </main>
    )
  }

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Vehicle Management", href: "/admin/dashboard", icon: CarIcon },
  ]

  const handleLogout = async () => {
    try {
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
      router.push("/")
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground touch-pan-y lg:grid lg:grid-cols-[18rem_1fr]">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-background/50" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 w-72 bg-card/95 backdrop-blur shadow-xl border-r border-border">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-10">
                <Image src="/International Car Company Inc. Logo.png" alt="Logo" fill className="object-contain" priority sizes="48px" />
              </div>
              <div>
                <div className="text-lg font-bold text-foreground"><BrandName /></div>
                <div className="text-xs text-muted-foreground">Admin Panel</div>
              </div>
            </div>
            <Button onClick={() => setSidebarOpen(false)} variant="ghost" size="sm">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="p-6">
            <ul className="space-y-3">
              {navigation.map((item) => {
                const IconComponent = item.icon
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive 
                          ? "bg-primary/10 text-primary border border-primary/20" 
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <IconComponent className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block lg:col-start-1 lg:row-span-full lg:w-72">
        <div className="flex flex-col h-full bg-card/95 backdrop-blur text-foreground shadow-xl border-r border-border">
          <div className="flex items-center px-8 py-6 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-10">
                <Image src="/International Car Company Inc. Logo.png" alt="Logo" fill className="object-contain" priority sizes="48px" />
              </div>
              <div>
                <div className="text-xl font-bold text-foreground">
                  <BrandName />
                </div>
                <div className="text-sm text-muted-foreground">Administration</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-6 py-8">
            <ul className="space-y-3">
              {navigation.map((item) => {
                const IconComponent = item.icon
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive 
                          ? "bg-primary/10 text-primary border border-primary/20" 
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <IconComponent className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="p-6 border-t border-border">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">
                  {user?.email?.[0]?.toUpperCase() || "A"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.email || "Admin"}
                </p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
              <Button 
                onClick={() => router.push("/")} 
                variant="outline" 
                size="sm" 
                className="w-full justify-start bg-transparent border-border text-muted-foreground hover:bg-accent"
              >
                <Home className="h-4 w-4 mr-2" />
                View Site
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="w-full justify-start text-primary bg-transparent border-primary/20 hover:bg-primary/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-0 lg:col-start-2">
        {/* Top bar - mobile only */}
        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 shadow-sm border-b border-border lg:hidden sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-4">
            <Button onClick={() => setSidebarOpen(true)} variant="ghost" size="lg" className="h-12 w-12 p-0">
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button onClick={handleLogout} variant="ghost" size="lg" className="h-12 w-12 p-0">
                <LogOut className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
