"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Car } from "@/lib/types"
import { ArrowUpDown, Plus, Edit, Trash2, Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CarForm } from "@/components/admin/car-form"

interface CarTableProps {
  cars: Car[]
  setCars: (cars: Car[]) => void
}

type SortKey = keyof Pick<Car, "title" | "make" | "model" | "year" | "mileage" | "price" | "location" | "status">;

export function CarTable({ cars, setCars }: CarTableProps) {
  const { toast } = useToast()
  const [query, setQuery] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("listedAt" as SortKey)
  const [sortAsc, setSortAsc] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingCar, setEditingCar] = useState<Car | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q
      ? cars.filter(c => (
          (c.title || "").toLowerCase().includes(q) ||
          (c.make || "").toLowerCase().includes(q) ||
          (c.model || "").toLowerCase().includes(q) ||
          String(c.year || "").includes(q) ||
          (c.location || "").toLowerCase().includes(q)
        ))
      : cars
    const sorted = [...list].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortKey]
      const bVal = (b as unknown as Record<string, unknown>)[sortKey]
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortAsc ? aVal - bVal : bVal - aVal
      }
      const aStr = String(aVal ?? "").toLowerCase()
      const bStr = String(bVal ?? "").toLowerCase()
      return sortAsc ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
    })
    return sorted
  }, [cars, query, sortKey, sortAsc])

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortAsc(!sortAsc)
    else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  const formatPrice = (price: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(price)

  const handleDelete = async (carId: string) => {
    if (!confirm("Delete this car?")) return
    try {
      // Get CSRF token
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
      setCars(cars.filter(c => c.id !== carId))
      toast({ title: "Car deleted" })
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" })
    }
  }

  const handleApprovalToggle = async (carId: string, approved: boolean) => {
    try {
      // Get CSRF token
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
      setCars(cars.map(c => (c.id === carId ? { ...c, approved } : car)))
      toast({ title: approved ? "Approved" : "Unapproved" })
    } catch {
      toast({ title: "Failed to update", variant: "destructive" })
    }
  }

  const handleStatusToggle = async (carId: string, status: 'available' | 'sold') => {
    try {
      // Get CSRF token
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
        body: JSON.stringify({ id: carId, status })
      })
      if (!res.ok) throw new Error('Update failed')
      setCars(cars.map(c => (c.id === carId ? { ...c, status } : car)))
      toast({ title: status === 'sold' ? "Marked as Sold" : "Marked as Available" })
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <CardTitle>Cars Table</CardTitle>
        <div className="flex gap-2 w-full md:w-auto">
          <Input
            placeholder="Search by title, make, model, year, location"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full md:w-80"
          />
          <Button onClick={() => { setEditingCar(null); setShowForm(true) }} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-1" /> New
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-12 px-3 py-2 text-xs uppercase text-muted-foreground">
            {([
              { key: 'title', label: 'Title' },
              { key: 'make', label: 'Make' },
              { key: 'model', label: 'Model' },
              { key: 'year', label: 'Year' },
              { key: 'mileage', label: 'Mileage' },
              { key: 'price', label: 'Price' },
              { key: 'location', label: 'Location' },
              { key: 'status', label: 'Status' },
            ] as Array<{ key: SortKey; label: string }>).map(({ key, label }) => (
              <button
                key={key}
                className="col-span-2 flex items-center gap-1 text-left"
                onClick={() => toggleSort(key)}
              >
                {label} <ArrowUpDown className="h-3 w-3" />
              </button>
            ))}
            <div className="col-span-2 text-right">Actions</div>
          </div>
          <div className="divide-y divide-border">
            {filtered.map(car => (
              <div key={car.id} className="grid grid-cols-12 items-center px-3 py-3 text-sm">
                <div className="col-span-2 truncate" title={car.title}>{car.title}</div>
                <div className="col-span-2 truncate">{car.make}</div>
                <div className="col-span-2 truncate">{car.model}</div>
                <div className="col-span-2">{car.year}</div>
                <div className="col-span-2">{car.mileage.toLocaleString()} mi</div>
                <div className="col-span-2">{formatPrice(car.price)}</div>
                <div className="col-span-2 truncate" title={car.location}>{car.location}</div>
                <div className="col-span-2">
                  <Badge variant={car.status === 'sold' ? 'destructive' : 'secondary'}>
                    {car.status === 'sold' ? 'Sold' : (car.status || 'Available')}
                  </Badge>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setEditingCar(car); setShowForm(true) }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleApprovalToggle(car.id, !car.approved)}>
                    {car.approved ? <X className="h-4 w-4 text-yellow-600" /> : <Check className="h-4 w-4 text-primary" />}
                  </Button>
                  <Button 
                    size="sm" 
                    variant={car.status === 'sold' ? "destructive" : "outline"}
                    onClick={() => handleStatusToggle(car.id, car.status === 'sold' ? 'available' : 'sold')}
                    title={car.status === 'sold' ? 'Mark as Available' : 'Mark as Sold'}
                    disabled={!car.status}
                  >
                    {car.status === 'sold' ? 'Sold' : 'Mark Sold'}
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(car.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      {showForm && (
        <div className="mt-4">
          <CarForm
            car={editingCar || undefined}
            onSuccess={() => {
              setShowForm(false)
              setEditingCar(null)
              window.location.reload()
            }}
            onCancel={() => {
              setShowForm(false)
              setEditingCar(null)
            }}
          />
        </div>
      )}
    </Card>
  )
}


