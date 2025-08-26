"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CarTable } from './car-table'
import { CarForm } from './car-form'
import { Car } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { Plus } from 'lucide-react'

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

  const handleAddCar = () => {
    if (!(role === 'editor' || role === 'admin' || role === 'super_admin')) {
      toast({ title: "Not allowed", description: "You don't have permission to add cars", variant: "destructive" })
      return
    }
    setShowForm(true)
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
