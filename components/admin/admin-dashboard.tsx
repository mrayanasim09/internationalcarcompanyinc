"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import dynamic from 'next/dynamic'
const CarManagement = dynamic(() => import("@/components/admin/car-management").then(m => m.CarManagement), { ssr: false, loading: () => <div /> })
const ReviewManagement = dynamic(() => import("@/components/admin/review-management").then(m => m.ReviewManagement), { ssr: false, loading: () => <div /> })
const DebugPanel = dynamic(() => import("@/components/debug-panel").then(m => m.DebugPanel), { ssr: false, loading: () => <div /> })
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import type { Car, Review } from "@/lib/types"
// Data fetched via API routes instead of direct server client in browser
import { LogOut, CarIcon, MessageSquare, BarChart3, Settings, Users as UsersIcon } from "lucide-react"
import { CarLoader } from "@/components/ui/car-loader"
const UserManagement = dynamic(() => import("@/components/admin/session-management").then(m => m.UserManagement), { ssr: false })
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

  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('DEBUG: AdminDashboard rendering, user:', user)
    console.log('DEBUG: AdminDashboard loading:', loading)
    console.log('DEBUG: AdminDashboard error:', error)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('DEBUG: Dashboard fetching data...')
        }
        setError(null)
        
        const [carsRes, reviewsRes] = await Promise.all([
          fetch('/api/admin/cars', { cache: 'no-store' }),
          fetch('/api/reviews', { cache: 'no-store' })
        ])
        
        if (process.env.NODE_ENV === 'development') {
          console.log('DEBUG: Cars response status:', carsRes.status)
          console.log('DEBUG: Reviews response status:', reviewsRes.status)
        }
        
        if (!carsRes.ok) {
          const carsError = await carsRes.text()
          console.error('Cars API error:', carsRes.status, carsError)
          setError(`Failed to fetch cars: ${carsRes.status}`)
          return // Don't continue if cars failed
        }
        
        if (!reviewsRes.ok) {
          const reviewsError = await reviewsRes.text()
          console.error('Reviews API error:', reviewsRes.status, reviewsError)
          setError(`Failed to fetch reviews: ${reviewsRes.status}`)
          return // Don't continue if reviews failed
        }
        
        const carsJson = await carsRes.json().catch((e) => {
          console.error('Error parsing cars JSON:', e)
          return { cars: [] }
        })
        const reviewsJson = await reviewsRes.json().catch((e) => {
          console.error('Error parsing reviews JSON:', e)
          return { reviews: [] }
        })
        
        console.log('Cars data received:', carsJson)
        console.log('Reviews data received:', reviewsJson)
        console.log('Setting loading to false...')
        
        // Types kept minimal; mapping happens at usage
        setCars(((carsJson?.cars || []) as unknown as Car[]))
        // Types kept minimal; mapping happens at usage
        setReviews(((reviewsJson?.reviews || []) as unknown as Review[]))
      } catch (error) {
        console.error("DEBUG: Dashboard fetch error:", error)
        setError(`Fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleLogout = async () => {
    try {
      // Stateless logout handled by API; just navigate
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

  // Show loading state while user data is being fetched
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
      <div className="bg-card shadow-sm border-b border-border hidden lg:block">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
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
        {/* Status section removed (Firebase references deleted) */}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cars</CardTitle>
              <CarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCars}</div>
              <p className="text-xs text-muted-foreground">Admin data</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Cars</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approvedCars}</div>
              <p className="text-xs text-muted-foreground">Ready for display</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <BarChart3 className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingCars}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReviews}</div>
              <p className="text-xs text-muted-foreground">Customer feedback</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="cars" className="space-y-4">
          <TabsList className="w-full overflow-x-auto whitespace-nowrap -mx-4 px-4 lg:mx-0 lg:px-0 sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
            <TabsTrigger className="min-w-[9rem]" value="cars">Car Management</TabsTrigger>
            <TabsTrigger className="min-w-[9rem]" value="reviews">Reviews</TabsTrigger>
            <TabsTrigger className="min-w-[9rem]" value="sessions">Sessions</TabsTrigger>
            <TabsTrigger className="min-w-[9rem]" value="debug">Debug</TabsTrigger>
            {user?.role === 'super_admin' && (
              <TabsTrigger className="min-w-[9rem]" value="users">
                <div className="flex items-center gap-1"><UsersIcon className="h-4 w-4" /> Users</div>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="cars">
            <CarManagement cars={cars} setCars={setCars} />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewManagement reviews={reviews} />
          </TabsContent>

          <TabsContent value="sessions">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Session Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SessionManagement />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="debug">
            <DebugPanel />
          </TabsContent>

          {user?.role === 'super_admin' && (
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
} 
