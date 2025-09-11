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

type SortKey = keyof Pick<Car, "title" | "make" | "model" | "year" | "mileage" | "price" | "location">;

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
      setCars(cars.map(c => (c.id === carId ? { ...c, approved } : c)))
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
      setCars(cars.map(c => (c.id === carId ? { ...c, status } : c)))
      toast({ title: status === 'sold' ? "Marked as Sold" : "Marked as Available" })
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-6">
        <CardTitle className="text-xl font-semibold">Cars Table</CardTitle>
        <div className="flex gap-3 w-full md:w-auto">
          <Input
            placeholder="Search by title, make, model, year, location"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full md:w-80"
          />
          <Button 
            onClick={() => { setEditingCar(null); setShowForm(true) }} 
            className="bg-primary hover:bg-primary/90 whitespace-nowrap"
          >
            <Plus className="h-4 w-4 mr-2" /> Add New Car
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-11 px-4 py-3 text-xs uppercase text-muted-foreground font-medium">
            {([
              { key: 'title', label: 'Title', span: 2 },
              { key: 'make', label: 'Make', span: 1 },
              { key: 'model', label: 'Model', span: 1 },
              { key: 'year', label: 'Year', span: 1 },
              { key: 'mileage', label: 'Mileage', span: 1 },
              { key: 'price', label: 'Price', span: 1 },
              { key: 'location', label: 'Location', span: 1 },
              { key: 'status', label: 'Status', span: 1 },
            ] as Array<{ key: SortKey; label: string; span: number }>).map(({ key, label, span }) => (
              <button
                key={key}
                className={`col-span-${span} flex items-center gap-1 text-left hover:text-foreground transition-colors`}
                onClick={() => toggleSort(key)}
              >
                {label} <ArrowUpDown className="h-3 w-3" />
              </button>
            ))}
            <div className="col-span-2 text-right font-medium">Actions</div>
          </div>
          <div className="divide-y divide-border">
            {filtered.map(car => (
              <div key={car.id} className="grid grid-cols-11 items-center px-4 py-4 text-sm hover:bg-muted/50 transition-colors">
                <div className="col-span-2 truncate pr-2" title={car.title}>{car.title}</div>
                <div className="col-span-1 truncate pr-2">{car.make}</div>
                <div className="col-span-1 truncate pr-2">{car.model}</div>
                <div className="col-span-1 pr-2">{car.year}</div>
                <div className="col-span-1 pr-2">{car.mileage.toLocaleString()} mi</div>
                <div className="col-span-1 pr-2 font-medium">{formatPrice(car.price)}</div>
                <div className="col-span-1 truncate pr-2" title={car.location}>{car.location}</div>
                <div className="col-span-1 pr-2">
                  <Badge variant={car.status === 'sold' ? 'destructive' : 'secondary'} className="text-xs px-1.5 py-0.5">
                    {car.status === 'sold' ? 'Sold' : (car.status || 'Available')}
                  </Badge>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-1 pr-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => { setEditingCar(car); setShowForm(true) }}
                    className="h-7 w-7 p-0"
                    title="Edit"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleApprovalToggle(car.id, !car.approved)}
                    className="h-7 w-7 p-0"
                    title={car.approved ? "Unapprove" : "Approve"}
                  >
                    {car.approved ? <X className="h-3 w-3 text-yellow-600" /> : <Check className="h-3 w-3 text-primary" />}
                  </Button>
                  <Button 
                    size="sm" 
                    variant={car.status === 'sold' ? "destructive" : "outline"}
                    onClick={() => handleStatusToggle(car.id, car.status === 'sold' ? 'available' : 'sold')}
                    title={car.status === 'sold' ? 'Mark as Available' : 'Mark as Sold'}
                    disabled={!car.status}
                    className={`h-7 ${car.status === 'sold' ? 'px-1.5 text-xs' : 'w-7 p-0'}`}
                  >
                    {car.status === 'sold' ? 'Sold' : <Check className="h-3 w-3" />}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-destructive h-7 w-7 p-0" 
                    onClick={() => handleDelete(car.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
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


