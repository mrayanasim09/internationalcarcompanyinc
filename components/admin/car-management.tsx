"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CarForm } from "@/components/admin/car-form"
import { CarTable } from "@/components/admin/car-table"
import Image from "next/image"
import type { Car } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Check, X } from "lucide-react"

interface CarManagementProps {
  cars: Car[]
  setCars: (cars: Car[]) => void
}

export function CarManagement({ cars, setCars }: CarManagementProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingCar, setEditingCar] = useState<Car | null>(null)
  const { toast } = useToast()
  const [role, setRole] = useState<'viewer'|'editor'|'admin'|'super_admin'>('viewer')

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/admin/me', { cache: 'no-store' })
        const data = await res.json()
        if (data?.role) setRole(data.role)
      } catch {
        setRole('viewer')
      }
    })()
  }, [])

  const handleDelete = async (carId: string) => {
    if (!(role === 'admin' || role === 'super_admin')) {
      toast({ title: "Not allowed", description: "You don't have permission to delete cars", variant: "destructive" })
      return
    }
    if (!confirm("Are you sure you want to delete this car?")) return

    try {
      // Get CSRF token from the auth context or fetch it
      let csrfToken = ''
      try {
        const csrfRes = await fetch('/api/csrf-debug', { method: 'GET' })
        if (csrfRes.ok) {
          const csrfData = await csrfRes.json()
          csrfToken = csrfData.token
        }
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error)
      }

      const res = await fetch(`/api/admin/cars?id=${encodeURIComponent(carId)}`, {
        method: 'DELETE',
        headers: { 'x-csrf-token': csrfToken },
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Delete failed')
      setCars(cars.filter((car) => car.id !== carId))
      toast({
        title: "Success",
        description: "Car deleted successfully",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete car",
        variant: "destructive",
      })
    }
  }

  const handleApprovalToggle = async (carId: string, approved: boolean) => {
    if (!(role === 'admin' || role === 'super_admin')) {
      toast({ title: "Not allowed", description: "You don't have permission to approve cars", variant: "destructive" })
      return
    }
    try {
      // Get CSRF token from the auth context or fetch it
      let csrfToken = ''
      try {
        const csrfRes = await fetch('/api/csrf-debug', { method: 'GET' })
        if (csrfRes.ok) {
          const csrfData = await csrfRes.json()
          csrfToken = csrfData.token
        }
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error)
      }

      const res = await fetch(`/api/admin/cars`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
        credentials: 'include',
        body: JSON.stringify({ id: carId, approved })
      })
      if (!res.ok) throw new Error('Update failed')
      setCars(cars.map((car) => (car.id === carId ? { ...car, approved } : car)))
      toast({
        title: "Success",
        description: `Car ${approved ? "approved" : "unapproved"} successfully`,
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to update car approval",
        variant: "destructive",
      })
    }
  }

  const handleAddCar = () => {
    if (!(role === 'editor' || role === 'admin' || role === 'super_admin')) {
      toast({ title: "Not allowed", description: "You don't have permission to add cars", variant: "destructive" })
      return
    }
    setShowForm(true)
  }

  const handleEditCar = (car: Car) => {
    if (!(role === 'editor' || role === 'admin' || role === 'super_admin')) {
      toast({ title: "Not allowed", description: "You don't have permission to edit cars", variant: "destructive" })
      return
    }
    setEditingCar(car)
    setShowForm(true)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Car Inventory</h2>
        <Button onClick={handleAddCar} className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={!(role === 'editor' || role === 'admin' || role === 'super_admin')}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Car
        </Button>
      </div>

      {/* Firebase demo banner removed */}

      {showForm && (
        <CarForm
          car={editingCar || undefined}
          onSuccess={() => {
            setShowForm(false)
            setEditingCar(null)
            // Refresh the cars list
            window.location.reload()
          }}
          onCancel={() => {
            setShowForm(false)
            setEditingCar(null)
          }}
        />
      )}

      <div className="mb-8">
        <CarTable cars={cars} setCars={setCars} />
      </div>
    </div>
  )
}
