"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Car } from "@/lib/types"
import { ArrowUpDown, Plus, Edit, Trash2, Check, X, GripVertical } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CarForm } from "@/components/admin/car-form"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface CarTableProps {
  cars: Car[]
  setCars: (cars: Car[]) => void
}

type SortKey = keyof Pick<Car, "title" | "make" | "model" | "year" | "mileage" | "price" | "location">;

// Sortable row component
function SortableCarRow({ car, onEdit, onDelete, onApprovalToggle, onStatusToggle, formatPrice }: {
  car: Car
  onEdit: (car: Car) => void
  onDelete: (id: string) => void
  onApprovalToggle: (id: string, approved: boolean) => void
  onStatusToggle: (id: string, status: 'available' | 'sold') => void
  formatPrice: (price: number) => string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: car.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="grid grid-cols-11 items-center px-4 py-4 text-sm hover:bg-muted/50 transition-colors"
    >
      <div className="col-span-1 flex items-center">
        <button
          {...attributes}
          {...listeners}
          className="p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
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
          onClick={() => onEdit(car)}
          className="h-7 w-7 p-0"
          title="Edit"
        >
          <Edit className="h-3 w-3" />
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onApprovalToggle(car.id, !car.approved)}
          className="h-7 w-7 p-0"
          title={car.approved ? "Unapprove" : "Approve"}
        >
          {car.approved ? <X className="h-3 w-3 text-yellow-600" /> : <Check className="h-3 w-3 text-primary" />}
        </Button>
        <Button 
          size="sm" 
          variant={car.status === 'sold' ? "destructive" : "outline"}
          onClick={() => onStatusToggle(car.id, car.status === 'sold' ? 'available' : 'sold')}
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
          onClick={() => onDelete(car.id)}
          title="Delete"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

export function CarTable({ cars, setCars }: CarTableProps) {
  const { toast } = useToast()
  const [query, setQuery] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("listedAt" as SortKey)
  const [sortAsc, setSortAsc] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingCar, setEditingCar] = useState<Car | null>(null)
  const [isReordering, setIsReordering] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = filtered.findIndex((car) => car.id === active.id)
      const newIndex = filtered.findIndex((car) => car.id === over?.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        // Optimistically update the UI
        const newCars = arrayMove(filtered, oldIndex, newIndex)
        setCars(newCars)

        // Update display order in database
        setIsReordering(true)
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

          // Prepare the reorder data
          const reorderData = newCars.map((car, index) => ({
            id: car.id,
            displayOrder: index + 1
          }))

          const res = await fetch('/api/admin/cars/reorder', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json', 
              'x-csrf-token': csrfToken 
            },
            credentials: 'include',
            body: JSON.stringify({ cars: reorderData })
          })

          if (!res.ok) {
            throw new Error('Failed to update order')
          }

          toast({ title: "Order updated successfully" })
        } catch (error) {
          console.error('Failed to update car order:', error)
          toast({ 
            title: "Failed to update order", 
            description: "Please try again",
            variant: "destructive" 
          })
          // Revert the optimistic update
          setCars(cars)
        } finally {
          setIsReordering(false)
        }
      }
    }
  }

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
            <div className="col-span-1 text-center font-medium">Drag</div>
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={filtered.map(car => car.id)} strategy={verticalListSortingStrategy}>
              <div className="divide-y divide-border">
                {filtered.map(car => (
                  <SortableCarRow
                    key={car.id}
                    car={car}
                    onEdit={(car) => { setEditingCar(car); setShowForm(true) }}
                    onDelete={handleDelete}
                    onApprovalToggle={handleApprovalToggle}
                    onStatusToggle={handleStatusToggle}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          {isReordering && (
            <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
              Updating order...
            </div>
          )}
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


