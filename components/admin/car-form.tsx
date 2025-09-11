"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUpload } from "@/components/image-upload"
import type { Car } from "@/lib/types"
import { toast } from "sonner"
import { Loader2, Plus, X, Eye, EyeOff, CarIcon } from "lucide-react"
import Image from "next/image"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  mileage: z.number().int().min(0),
  price: z.number().positive('Price must be positive'),
  location: z.string().min(1, "Location is required"),
  vin: z.string().optional(),
  phone: z.string().min(1, "Phone is required"),
  whatsapp: z.string().optional(),
  engine: z.string().optional(),
  transmission: z.string().optional(),
  exteriorColor: z.string().optional(),
  interiorColor: z.string().optional(),
  driveType: z.string().optional(),
  fuelType: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  features: z.string().optional(),
  documents: z.string().optional(),
  approved: z.boolean().default(true),
  isInventory: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  status: z.enum(['available', 'sold', 'reserved', 'maintenance']).default('available'),
})

type FormData = z.infer<typeof formSchema>

interface CarFormProps {
  car?: Car
  onSuccess?: () => void
  onCancel?: () => void
}

export function CarForm({ car, onSuccess, onCancel }: CarFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>(car?.images || [])
  const [manualUrls, setManualUrls] = useState<string[]>([])
  const [newManualUrl, setNewManualUrl] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [previewCar, setPreviewCar] = useState<any>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      title: car?.title || "",
      make: car?.make || "",
      model: car?.model || "",
      year: car?.year || new Date().getFullYear(),
      mileage: car?.mileage || 0,
      price: car?.price || 0,
      location: car?.location || "",
      vin: car?.vin || "",
      phone: car?.contact?.phone || "",
      whatsapp: car?.contact?.whatsapp || "",
      engine: car?.engine || "",
      transmission: car?.transmission || "",
      exteriorColor: car?.exteriorColor || "",
      interiorColor: car?.interiorColor || "",
      driveType: car?.driveType || "",
      fuelType: car?.fuelType || "",
      description: car?.description || "",
      features: car?.features?.join("\n") || "",
      documents: car?.documents?.map(d => `${d.name},${d.url}`).join("\n") || "",
      approved: car?.approved ?? true,
      isInventory: car?.isInventory ?? true,
      isFeatured: car?.isFeatured ?? false,
      status: (car?.status as 'available' | 'sold' | 'reserved' | 'maintenance') ?? 'available',
    },
  })

  // Create preview car object from form data
  const createPreviewCar = useCallback(() => {
    const values = form.getValues()
    const allImages = [...imageUrls, ...manualUrls].filter(Boolean)
    const features = values.features
      ? values.features.split("\n").filter(f => f.trim())
      : []
    
    return {
      id: car?.id || 'preview',
      title: values.title || 'Car Title',
      make: values.make || 'Make',
      model: values.model || 'Model',
      year: values.year || new Date().getFullYear(),
      mileage: values.mileage || 0,
      price: values.price || 0,
      location: values.location || 'Location',
      description: values.description || 'Description',
      images: allImages,
      features,
      engine: values.engine || '',
      transmission: values.transmission || '',
      exteriorColor: values.exteriorColor || '',
      interiorColor: values.interiorColor || '',
      driveType: values.driveType || '',
      fuelType: values.fuelType || '',
      vin: values.vin || '',
      contact: {
        phone: values.phone || '',
        whatsapp: values.whatsapp || ''
      },
      approved: values.approved,
      isInventory: values.isInventory,
      isFeatured: values.isFeatured,
      rating: car?.rating || 0,
      reviews: car?.reviews || [],
      listedAt: car?.listedAt || new Date(),
      createdAt: car?.createdAt || new Date()
    }
  }, [form, imageUrls, manualUrls, car])

  // Update preview when form data changes
  useEffect(() => {
    if (!showPreview) return
    const subscription = form.watch(() => {
      const timeoutId = window.setTimeout(() => {
        setPreviewCar(createPreviewCar())
      }, 300)
      return () => window.clearTimeout(timeoutId)
    })
    return () => subscription.unsubscribe()
  }, [showPreview, form, createPreviewCar])

  // Initialize preview car when showing preview
  useEffect(() => {
    if (showPreview && !previewCar) {
      setPreviewCar(createPreviewCar())
    }
  }, [showPreview, previewCar, createPreviewCar])

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      // Combine uploaded images with manual URLs
      const allImages = [...imageUrls, ...manualUrls].filter(Boolean)
      
      // Parse features
      const features = data.features
        ? data.features.split("\n").filter(f => f.trim())
        : []

      // Parse documents
      const documents = data.documents
        ? data.documents.split("\n")
            .filter(d => d.trim())
            .map(d => {
              const [name, url] = d.split(",").map(s => s.trim())
              return { name, url }
            })
        : []

      const carData = {
        ...data,
        images: allImages,
        features,
        documents,
        contact: {
          phone: data.phone,
          whatsapp: data.whatsapp || data.phone,
        },
        rating: car?.rating || 0,
        reviews: car?.reviews || [],
        listedAt: car?.listedAt || new Date(),
        createdAt: car?.createdAt || new Date(),
      }

      if (car) {
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

        const res = await fetch('/api/admin/cars', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
          credentials: 'include',
          body: JSON.stringify({
            id: car.id,
            title: carData.title,
            make: carData.make,
            model: carData.model,
            year: carData.year,
            mileage: carData.mileage,
            price: carData.price,
            location: carData.location,
            vin: carData.vin,
            engine: carData.engine,
            transmission: carData.transmission,
            exteriorColor: carData.exteriorColor,
            interiorColor: carData.interiorColor,
            driveType: carData.driveType,
            fuelType: carData.fuelType,
            description: carData.description,
            features,
            images: allImages,
            documents,
            phone: carData.contact.phone,
            whatsapp: carData.contact.whatsapp,
            isFeatured: carData.isFeatured,
            isInventory: carData.isInventory,
            approved: carData.approved,
            status: carData.status,
          })
        })
        if (!res.ok) {
          let errorMessage = 'Update failed'
          try {
            const errorData = await res.json()
            console.error('DEBUG: Update error response:', errorData)
            if (errorData.error) {
              errorMessage = errorData.error
            }
            if (errorData.details) {
              errorMessage += ` - ${errorData.details}`
            }
          } catch (parseError) {
            console.error('DEBUG: Could not parse error response:', parseError)
          }
          throw new Error(errorMessage)
        }
        toast.success("Car updated successfully!")
      } else {
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

        console.log('DEBUG: Submitting car with CSRF token:', csrfToken ? 'Present' : 'Missing')
        console.log('DEBUG: CSRF token length:', csrfToken?.length || 0)
        
        const res = await fetch('/api/admin/cars', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
          credentials: 'include',
          body: JSON.stringify({
            title: carData.title,
            make: carData.make,
            model: carData.model,
            year: carData.year,
            mileage: carData.mileage,
            price: carData.price,
            location: carData.location,
            vin: carData.vin,
            engine: carData.engine,
            transmission: carData.transmission,
            exteriorColor: carData.exteriorColor,
            interiorColor: carData.interiorColor,
            driveType: carData.driveType,
            fuelType: carData.fuelType,
            features,
            images: allImages,
            documents,
            phone: carData.contact.phone,
            whatsapp: carData.contact.whatsapp,
            isFeatured: carData.isFeatured,
            isInventory: carData.isInventory,
            approved: carData.approved,
            status: carData.status,
            description: carData.description,
          })
        })
        
        console.log('DEBUG: Car submission response status:', res.status)
        console.log('DEBUG: Car submission response ok:', res.ok)
        if (!res.ok) {
          let message = 'Create failed'
          try {
            const err = await res.json()
            if (err?.details && Array.isArray(err.details)) {
              message = err.details.map((d: { message?: string }) => d?.message).filter(Boolean).join('\n') || err.error || message
            } else if (err?.error) {
              message = err.error
            }
          } catch (_) {
            // ignore parse errors
          }
          throw new Error(message)
        }
        toast.success("Car added successfully!")
      }

      onSuccess?.()
    } catch (error) {
      console.error("Error saving car:", error)
      toast.error("Failed to save car. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const addManualUrl = () => {
    if (newManualUrl.trim() && !manualUrls.includes(newManualUrl.trim())) {
      setManualUrls([...manualUrls, newManualUrl.trim()])
      setNewManualUrl("")
    }
  }

  const removeManualUrl = (url: string) => {
    setManualUrls(manualUrls.filter(u => u !== url))
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-white">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="title" className="text-muted-foreground">Title</Label>
              <Input
                id="title"
                {...form.register("title")}
                className="bg-background border-border text-foreground"
                placeholder="e.g., 2023 Honda Civic Sport"
              />
              {form.formState.errors.title && (
                <p className="text-blue-400 text-sm mt-1">{form.formState.errors.title.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="location" className="text-muted-foreground">Location</Label>
              <Input
                id="location"
                {...form.register("location")}
                className="bg-background border-border text-foreground"
                placeholder="e.g., Los Angeles, CA"
              />
              {form.formState.errors.location && (
                <p className="text-blue-400 text-sm mt-1">{form.formState.errors.location.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label htmlFor="make" className="text-muted-foreground">Make</Label>
              <Input
                id="make"
                {...form.register("make")}
                className="bg-background border-border text-foreground"
                placeholder="e.g., Honda"
              />
              {form.formState.errors.make && (
                <p className="text-blue-400 text-sm mt-1">{form.formState.errors.make.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="model" className="text-muted-foreground">Model</Label>
              <Input
                id="model"
                {...form.register("model")}
                className="bg-background border-border text-foreground"
                placeholder="e.g., Civic"
              />
              {form.formState.errors.model && (
                <p className="text-blue-400 text-sm mt-1">{form.formState.errors.model.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="year" className="text-muted-foreground">Year</Label>
              <Input
                id="year"
                type="number"
                {...form.register("year", { valueAsNumber: true })}
                className="bg-background border-border text-foreground"
                placeholder="2023"
                min={1900}
                max={new Date().getFullYear() + 1}
                step={1}
              />
              {form.formState.errors.year && (
                <p className="text-blue-400 text-sm mt-1">{form.formState.errors.year.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="mileage" className="text-muted-foreground">Mileage</Label>
              <Input
                id="mileage"
                type="number"
                {...form.register("mileage", { valueAsNumber: true })}
                className="bg-background border-border text-foreground"
                placeholder="50000"
                min={0}
                step={1}
              />
              {form.formState.errors.mileage && (
                <p className="text-blue-400 text-sm mt-1">{form.formState.errors.mileage.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="price" className="text-muted-foreground">Price ($)</Label>
              <Input
                id="price"
                type="number"
                {...form.register("price", { valueAsNumber: true })}
                className="bg-background border-border text-foreground"
                placeholder="25000"
                min={1}
                step={1}
              />
              {form.formState.errors.price && (
                <p className="text-blue-400 text-sm mt-1">{form.formState.errors.price.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="vin" className="text-muted-foreground">VIN (Optional)</Label>
              <Input
                id="vin"
                {...form.register("vin")}
                className="bg-background border-border text-foreground"
                placeholder="1G1AP5G29J4000001"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-white">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 min-h-[120px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-muted-foreground">Phone</Label>
              <Input
                id="phone"
                {...form.register("phone")}
                className="bg-background border-border text-foreground"
                placeholder="+1 (555) 123-4567"
              />
              {form.formState.errors.phone && (
                <p className="text-blue-400 text-sm mt-1">{form.formState.errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-muted-foreground">WhatsApp (Optional)</Label>
              <Input
                id="whatsapp"
                {...form.register("whatsapp")}
                className="bg-background border-border text-foreground"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Specifications */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-white">Technical Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 min-h-[200px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="engine" className="text-muted-foreground">Engine (Optional)</Label>
              <Input
                id="engine"
                {...form.register("engine")}
                className="bg-background border-border text-foreground"
                placeholder="2.0L I4 Turbo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transmission" className="text-muted-foreground">Transmission (Optional)</Label>
              <Select onValueChange={(value) => form.setValue("transmission", value)} defaultValue={form.getValues("transmission")}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Select transmission" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="Automatic">Automatic</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                  <SelectItem value="CVT">CVT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exteriorColor" className="text-muted-foreground">Exterior Color (Optional)</Label>
              <Input
                id="exteriorColor"
                {...form.register("exteriorColor")}
                className="bg-background border-border text-foreground"
                placeholder="Black"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interiorColor" className="text-muted-foreground">Interior Color (Optional)</Label>
              <Input
                id="interiorColor"
                {...form.register("interiorColor")}
                className="bg-background border-border text-foreground"
                placeholder="Black"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="driveType" className="text-muted-foreground">Drive Type (Optional)</Label>
              <Select onValueChange={(value) => form.setValue("driveType", value)} defaultValue={form.getValues("driveType")}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Select drive type" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="FWD">Front-Wheel Drive</SelectItem>
                  <SelectItem value="RWD">Rear-Wheel Drive</SelectItem>
                  <SelectItem value="AWD">All-Wheel Drive</SelectItem>
                  <SelectItem value="4WD">Four-Wheel Drive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fuelType" className="text-muted-foreground">Fuel Type (Optional)</Label>
              <Select onValueChange={(value) => form.setValue("fuelType", value)} defaultValue={form.getValues("fuelType")}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="Gasoline">Gasoline</SelectItem>
                  <SelectItem value="Diesel">Diesel</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                  <SelectItem value="Electric">Electric</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description & Features */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-white">Description & Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="description" className="text-muted-foreground">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              className="bg-background border-border text-foreground"
              placeholder="Enter detailed car description..."
              rows={3}
            />
            {form.formState.errors.description && (
              <p className="text-blue-400 text-sm mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="features" className="text-muted-foreground">Features (Optional)</Label>
            <Textarea
              id="features"
              {...form.register("features")}
              className="bg-background border-border text-foreground"
              placeholder="Enter each feature on a new line. Example:&#10;Bluetooth Connectivity&#10;Backup Camera&#10;Heated Seats&#10;Sunroof"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="documents" className="text-muted-foreground">Documents (Optional)</Label>
            <Textarea
              id="documents"
              {...form.register("documents")}
              className="bg-background border-border text-foreground"
              placeholder="Enter each document as `name,url` on a new line. Example:&#10;Carfax Report,https://example.com/carfax.pdf&#10;Service History,https://example.com/service.pdf"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Car Images */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-white">Car Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUpload
            onImagesUploaded={setImageUrls}
            existingImages={car?.images || []}
          />
          
          {/* Manual URL Input */}
          <div className="space-y-3">
            <Label className="text-muted-foreground">Add Image URLs (Optional)</Label>
            <div className="flex gap-2 flex-wrap">
              <Input
                value={newManualUrl}
                onChange={(e) => setNewManualUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="bg-background border-border text-foreground flex-1"
              />
              <Button
                type="button"
                onClick={addManualUrl}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Display manual URLs */}
            {manualUrls.length > 0 && (
              <div className="space-y-2">
                <Label className="text-muted-foreground">Manual URLs:</Label>
                {manualUrls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-card rounded border border-border">
                    <span className="text-muted-foreground text-sm flex-1 truncate">{url}</span>
                    <Button
                      type="button"
                      onClick={() => removeManualUrl(url)}
                      size="sm"
                      variant="ghost"
                       className="text-primary hover:text-primary/80"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-white">Display Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="approved"
                checked={form.watch("approved")}
                onCheckedChange={(checked) => form.setValue("approved", checked as boolean)}
              />
              <Label htmlFor="approved" className="text-muted-foreground font-medium">
                Approved
              </Label>
              <Badge variant="outline" className="text-muted-foreground border-border text-xs">
                Mark car as approved for public display
              </Badge>
            </div>
            
            <div className="flex items-center space-x-3">
              <Checkbox
                id="isInventory"
                checked={form.watch("isInventory")}
                onCheckedChange={(checked) => form.setValue("isInventory", checked as boolean)}
              />
              <Label htmlFor="isInventory" className="text-muted-foreground font-medium">
                Show in Inventory
              </Label>
              <Badge variant="outline" className="text-muted-foreground border-border text-xs">
                Display this car in the main inventory list
              </Badge>
            </div>
            
            <div className="flex items-center space-x-3">
              <Checkbox
                id="isFeatured"
                checked={form.watch("isFeatured")}
                onCheckedChange={(checked) => form.setValue("isFeatured", checked as boolean)}
              />
              <Label htmlFor="isFeatured" className="text-muted-foreground font-medium">
                Show in Featured Vehicles
              </Label>
              <Badge variant="outline" className="text-muted-foreground border-border text-xs">
                Highlight this car on the homepage or featured sections
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Label htmlFor="status" className="text-muted-foreground min-w-[100px]">
                Vehicle Status
              </Label>
              <Select
                value={form.watch("status") || "available"}
                onValueChange={(value) => form.setValue("status", value as "available" | "sold" | "reserved" | "maintenance")}
              >
                <SelectTrigger className="w-48 bg-background border-border text-foreground">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-2 ml-[calc(100px+12px)]">
              <Badge variant="outline" className="text-muted-foreground border-border text-xs">
                Current status of the vehicle
              </Badge>
              <Badge variant="outline" className="text-yellow-600 border-yellow-600 text-xs">
                Note: Status column may need to be added to database
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowPreview(!showPreview)}
          className="border-border text-foreground hover:bg-accent"
        >
          {showPreview ? (
            <>
              <EyeOff className="w-4 h-4 mr-2" />
              Hide Preview
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Show Preview
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-border text-foreground hover:bg-accent"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !form.formState.isValid}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {car ? "Update Car" : "Add Car"}
        </Button>
      </div>

      {/* Live Preview */}
      {showPreview && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Live Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-lg mx-auto">
              {previewCar ? (
                <div className="space-y-4">
                  {/* Car Image Preview */}
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    {previewCar.images && previewCar.images[0] ? (
                      <Image
                        src={previewCar.images[0]}
                        alt={previewCar.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 640px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <CarIcon className="w-12 h-12" />
                      </div>
                    )}
                    {/* Price Badge */}
                    <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground font-bold">
                      ${previewCar.price?.toLocaleString() || '0'}
                    </Badge>
                    {/* Featured Badge */}
                    {previewCar.isFeatured && (
                      <Badge variant="warning" className="absolute top-2 right-2">
                        Featured
                      </Badge>
                    )}
                  </div>
                  
                  {/* Car Info */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-foreground">{previewCar.title || 'Car Title'}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Year:</span> {previewCar.year}
                      </div>
                      <div>
                        <span className="font-medium">Mileage:</span> {previewCar.mileage?.toLocaleString()} mi
                      </div>
                      <div>
                        <span className="font-medium">Make:</span> {previewCar.make}
                      </div>
                      <div>
                        <span className="font-medium">Model:</span> {previewCar.model}
                      </div>
                      <div>
                        <span className="font-medium">Location:</span> {previewCar.location}
                      </div>
                      <div>
                        <span className="font-medium">VIN:</span> {previewCar.vin || 'N/A'}
                      </div>
                    </div>
                    
                    {/* Description */}
                    {previewCar.description && (
                      <div>
                        <span className="font-medium text-foreground">Description:</span>
                        <p className="text-sm text-muted-foreground mt-1">{previewCar.description}</p>
                      </div>
                    )}
                    
                    {/* Features */}
                    {previewCar.features && previewCar.features.length > 0 && (
                      <div>
                        <span className="font-medium text-foreground">Features:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {previewCar.features.map((feature: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Contact Info */}
                    <div className="pt-2 border-t border-border">
                      <span className="font-medium text-foreground">Contact:</span>
                      <div className="text-sm text-muted-foreground mt-1">
                        <div>Phone: {previewCar.contact?.phone || 'N/A'}</div>
                        {previewCar.contact?.whatsapp && (
                          <div>WhatsApp: {previewCar.contact.whatsapp}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <div className="relative w-12 h-12 md:w-16 md:h-16 animate-pulse">
                            <Image
          src="/prestige-auto-sales-logo.png"
          alt="Prestige Auto Sales LLC Logo" 
                      fill 
                      className="object-contain" 
                      priority 
                      sizes="(max-width: 768px) 48px, 64px" 
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </form>
  )
}
