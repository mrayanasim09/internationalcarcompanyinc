"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import dynamic from 'next/dynamic'
const CarManagement = dynamic(() => import("@/components/admin/car-management").then(m => m.CarManagement), { ssr: false, loading: () => <div /> })
const ReviewManagement = dynamic(() => import("@/components/admin/review-management").then(m => m.ReviewManagement), { ssr: false, loading: () => <div /> })
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import type { Car, Review } from "@/lib/types"
import { LogOut, CarIcon, MessageSquare, BarChart3, Settings, Users as UsersIcon, Globe } from "lucide-react"
import { CarLoader } from "@/components/ui/car-loader"
const UserManagement = dynamic(() => import("@/components/admin/session-management").then(m => m.UserManagement), { ssr: false })
const ManualSitemapSubmitter = dynamic(() => import("@/components/auto-sitemap-trigger").then(m => m.ManualSitemapSubmitter), { ssr: false })
import { SessionManagement } from "./session-management"

interface DashboardStats {
  totalCars: number
  approvedCars: number
  pendingCars: number
  totalReviews: number
}

export function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [cars, setCars] = useState<Car[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Generate CSRF token on component mount
  useEffect(() => {
    const generateCSRFToken = async () => {
      try {
        const response = await fetch('/api/csrf-debug', { method: 'GET' })
        if (response.ok) {
          console.log('CSRF token generated successfully')
        }
      } catch (error) {
        console.warn('Failed to generate CSRF token:', error)
      }
    }
    generateCSRFToken()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null)
        
        const [carsRes, reviewsRes] = await Promise.all([
          fetch('/api/admin/cars', { cache: 'no-store' }),
          fetch('/api/reviews', { cache: 'no-store' })
        ])
        
        if (!carsRes.ok) {
          const carsError = await carsRes.text()
          console.error('Cars API error:', carsRes.status, carsError)
          setError(`Failed to fetch cars: ${carsRes.status}`)
          return
        }
        
        if (!reviewsRes.ok) {
          const reviewsError = await reviewsRes.text()
          console.error('Reviews API error:', reviewsRes.status, reviewsError)
          setError(`Failed to fetch reviews: ${reviewsRes.status}`)
          return
        }
        
        const carsJson = await carsRes.json().catch((e) => {
          console.error('Error parsing cars JSON:', e)
          return { cars: [] }
        })
        const reviewsJson = await reviewsRes.json().catch((e) => {
          console.error('Error parsing reviews JSON:', e)
          return { reviews: [] }
        })
        
        setCars(((carsJson?.cars || []) as unknown as Car[]))
        setReviews(((reviewsJson?.reviews || []) as unknown as Review[]))
      } catch (error) {
        console.error("Dashboard fetch error:", error)
        setError(`Fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleLogout = async () => {
    try {
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
      router.push("/")
    }
  }

  const stats: DashboardStats = {
    totalCars: cars.length,
    approvedCars: cars.filter((car) => car.approved).length,
    pendingCars: cars.filter((car) => !car.approved).length,
    totalReviews: reviews.length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <CarLoader />
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <CarLoader />
          <p className="mt-4 text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Dashboard Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage your vehicle inventory and reviews</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-muted-foreground">Welcome, {user?.email || "Admin"}</span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6 py-8 pb-24 max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
              <CarIcon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalCars}</div>
              <p className="text-xs text-muted-foreground">In inventory</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <BarChart3 className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.approvedCars}</div>
              <p className="text-xs text-muted-foreground">Live on site</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <BarChart3 className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.pendingCars}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviews</CardTitle>
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalReviews}</div>
              <p className="text-xs text-muted-foreground">Customer feedback</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="cars" className="space-y-6">
          <TabsList className="w-full overflow-x-auto whitespace-nowrap -mx-4 px-4 lg:mx-0 lg:px-0 sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
            <TabsTrigger className="min-w-[10rem] text-base" value="cars">
              <CarIcon className="h-4 w-4 mr-2" />
              Vehicle Management
            </TabsTrigger>
            <TabsTrigger className="min-w-[10rem] text-base" value="reviews">
              <MessageSquare className="h-4 w-4 mr-2" />
              Reviews
            </TabsTrigger>
            <TabsTrigger className="min-w-[10rem] text-base" value="sessions">
              <Settings className="h-4 w-4 mr-2" />
              Sessions
            </TabsTrigger>
            <TabsTrigger className="min-w-[10rem] text-base" value="seo">
              <Globe className="h-4 w-4 mr-2" />
              SEO & Sitemap
            </TabsTrigger>
            {user?.role === 'super_admin' && (
              <TabsTrigger className="min-w-[10rem] text-base" value="users">
                <UsersIcon className="h-4 w-4 mr-2" />
                User Management
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="cars" className="space-y-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold mb-4">Vehicle Inventory Management</h2>
              <CarManagement cars={cars} setCars={setCars} />
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
              <ReviewManagement reviews={reviews} />
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold mb-4">Session Management</h2>
              <SessionManagement />
            </div>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold mb-4">SEO & Sitemap Management</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Sitemap Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ManualSitemapSubmitter />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        SEO Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Sitemap URL:</span>
                          <a 
                            href="https://internationalcarcompanyinc.com/sitemap.xml" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            View Sitemap
                          </a>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Robots.txt:</span>
                          <a 
                            href="https://internationalcarcompanyinc.com/robots.txt" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            View Robots
                          </a>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Google Search Console:</span>
                          <a 
                            href="https://search.google.com/search-console" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Open Console
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>SEO Best Practices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>✅ <strong>Automatic Indexing:</strong> New pages are automatically added to sitemap</p>
                      <p>✅ <strong>Sitemap Submission:</strong> Automatically submitted to Google every 24 hours</p>
                      <p>✅ <strong>Structured Data:</strong> JSON-LD schema markup for better search results</p>
                      <p>✅ <strong>Meta Tags:</strong> Automatic title, description, and Open Graph tags</p>
                      <p>✅ <strong>Mobile Optimization:</strong> Responsive design for mobile-first indexing</p>
                      <p>✅ <strong>Performance:</strong> Fast loading times for better SEO ranking</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {user?.role === 'super_admin' && (
            <TabsContent value="users" className="space-y-6">
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-xl font-semibold mb-4">User Management</h2>
                <UserManagement />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
} 
