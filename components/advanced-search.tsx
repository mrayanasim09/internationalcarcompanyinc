"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Car } from '@/lib/types'
import { Search, Filter, X, ChevronDown, ChevronUp, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export interface AdvancedSearchFilters {
  search: string
  make: string
  model: string
  minPrice: number | null
  maxPrice: number | null
  minYear: number | null
  maxYear: number | null
  minMileage: number | null
  maxMileage: number | null
  location: string
  features: string[]
  transmission: string
  fuelType: string
  bodyStyle: string
}

interface SearchSuggestion {
  text: string
  type: 'make' | 'model' | 'feature' | 'location'
  count: number
}

export function AdvancedSearch({
  onFiltersChange,
  initialFilters,
  cars = [],
  className = ""
}: {
  onFiltersChange: (filters: AdvancedSearchFilters) => void
  initialFilters: AdvancedSearchFilters
  cars?: Car[]
  className?: string
}) {
  const [filters, setFilters] = useState<AdvancedSearchFilters>(initialFilters)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [savedSearches, setSavedSearches] = useState<Array<{ name: string; filters: AdvancedSearchFilters; date: string }>>([])
  const { toast } = useToast()

  // Extract unique values from cars for suggestions
  const uniqueValues = useMemo(() => {
    const makes = Array.from(new Set(cars.map(car => car.make).filter(Boolean)))
    const models = Array.from(new Set(cars.map(car => car.model).filter(Boolean)))
    const locations = Array.from(new Set(cars.map(car => car.location).filter(Boolean)))
    
    return { makes, models, locations }
  }, [cars])

  // Generate search suggestions
  const generateSuggestions = useCallback((query: string): SearchSuggestion[] => {
    if (!query.trim()) return []
    
    const queryLower = query.toLowerCase()
    const suggestions: SearchSuggestion[] = []
    
    // Make suggestions
    uniqueValues.makes.forEach(make => {
      if (make.toLowerCase().includes(queryLower)) {
        suggestions.push({ text: make, type: 'make', count: cars.filter(car => car.make === make).length })
      }
    })
    
    // Model suggestions
    uniqueValues.models.forEach(model => {
      if (model.toLowerCase().includes(queryLower)) {
        suggestions.push({ text: model, type: 'model', count: cars.filter(car => car.model === model).length })
      }
    })
    
    // Location suggestions
    uniqueValues.locations.forEach(location => {
      if (location.toLowerCase().includes(queryLower)) {
        suggestions.push({ text: location, type: 'location', count: cars.filter(car => car.location === location).length })
      }
    })
    
    // Feature suggestions
    const features = ['Bluetooth', 'Backup Camera', 'Leather Seats', 'Sunroof', 'Navigation', 'Heated Seats']
    features.forEach(feature => {
      if (feature.toLowerCase().includes(queryLower)) {
        suggestions.push({ text: feature, type: 'feature', count: Math.floor(Math.random() * 10) + 1 })
      }
    })
    
    return suggestions
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [cars, uniqueValues])

  // Handle search input changes
  const handleSearchChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
    
    if (value.trim()) {
      const newSuggestions = generateSuggestions(value)
      setSuggestions(newSuggestions)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }, [generateSuggestions])

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: SearchSuggestion) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      
      switch (suggestion.type) {
        case 'make':
          newFilters.make = suggestion.text
          break
        case 'model':
          newFilters.model = suggestion.text
          break
        case 'location':
          newFilters.location = suggestion.text
          break
        case 'feature':
          if (!newFilters.features.includes(suggestion.text)) {
            newFilters.features = [...newFilters.features, suggestion.text]
          }
          break
      }
      
      return newFilters
    })
    
    setShowSuggestions(false)
    setFilters(prev => ({ ...prev, search: '' }))
  }, [])

  // Apply filters
  const applyFilters = useCallback(() => {
    onFiltersChange(filters)
    setShowSuggestions(false)
    
    // Track search analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'search', {
        search_term: filters.search,
        make: filters.make,
        model: filters.model,
        min_price: filters.minPrice,
        max_price: filters.maxPrice
      })
    }
  }, [filters, onFiltersChange])

  // Clear all filters
  const clearFilters = useCallback(() => {
    const clearedFilters: AdvancedSearchFilters = {
      search: '',
      make: '',
      model: '',
      minPrice: null,
      maxPrice: null,
      minYear: null,
      maxYear: null,
      minMileage: null,
      maxMileage: null,
      location: '',
      features: [],
      transmission: '',
      fuelType: '',
      bodyStyle: ''
    }
    
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
    setShowSuggestions(false)
  }, [onFiltersChange])

  // Save current search
  const saveSearch = useCallback(() => {
    if (typeof window === 'undefined') return
    
    const searchName = prompt('Enter a name for this search:')
    if (searchName && searchName.trim()) {
      const newSavedSearch = {
        name: searchName.trim(),
        filters: { ...filters },
        date: new Date().toISOString()
      }
      
      const updatedSearches = [...savedSearches, newSavedSearch]
      setSavedSearches(updatedSearches)
      
      // Save to localStorage
      localStorage.setItem('icc-saved-searches', JSON.stringify(updatedSearches))
      
      toast({
        title: 'Search Saved',
        description: `"${searchName}" has been saved to your searches.`,
      })
    }
  }, [filters, savedSearches, toast])

  // Load saved searches from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const saved = localStorage.getItem('icc-saved-searches')
    if (saved) {
      try {
        setSavedSearches(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to load saved searches:', error)
      }
    }
  }, [])

  // Load saved search
  const loadSavedSearch = useCallback((savedSearch: typeof savedSearches[0]) => {
    setFilters(savedSearch.filters)
    onFiltersChange(savedSearch.filters)
    
    toast({
      title: 'Search Loaded',
      description: `"${savedSearch.name}" has been loaded.`,
    })
  }, [onFiltersChange, toast])

  // Delete saved search
  const deleteSavedSearch = useCallback((index: number) => {
    if (typeof window === 'undefined') return
    
    const updatedSearches = savedSearches.filter((_, i) => i !== index)
    setSavedSearches(updatedSearches)
    localStorage.setItem('icc-saved-searches', JSON.stringify(updatedSearches))
    
    toast({
      title: 'Search Deleted',
      description: 'Search has been removed from your saved searches.',
    })
  }, [savedSearches, toast])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for cars, makes, models, or features..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-4 py-3 text-base"
            onFocus={() => {
              if (filters.search.trim()) {
                setShowSuggestions(true)
              }
            }}
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSearchChange('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 bg-background border border-border rounded-lg shadow-lg mt-1 max-h-64 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionSelect(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-accent flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">
                    {suggestion.type}
                  </Badge>
                  <span className="font-medium">{suggestion.text}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {suggestion.count} cars
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {filters.make && (
          <Badge variant="secondary" className="gap-2">
            Make: {filters.make}
            <button onClick={() => setFilters(prev => ({ ...prev, make: '' }))}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {filters.model && (
          <Badge variant="secondary" className="gap-2">
            Model: {filters.model}
            <button onClick={() => setFilters(prev => ({ ...prev, model: '' }))}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {filters.minPrice && (
          <Badge variant="secondary" className="gap-2">
            Min: ${filters.minPrice.toLocaleString()}
            <button onClick={() => setFilters(prev => ({ ...prev, minPrice: null }))}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {filters.maxPrice && (
          <Badge variant="secondary" className="gap-2">
            Max: ${filters.maxPrice.toLocaleString()}
            <button onClick={() => setFilters(prev => ({ ...prev, maxPrice: null }))}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {filters.features.length > 0 && filters.features.map((feature, index) => (
          <Badge key={index} variant="secondary" className="gap-2">
            {feature}
            <button onClick={() => setFilters(prev => ({ 
              ...prev, 
              features: prev.features.filter((_, i) => i !== index) 
            }))}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={applyFilters} className="flex-1 sm:flex-none">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Advanced
          {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        
        <Button variant="outline" onClick={saveSearch}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        
        <Button variant="ghost" onClick={clearFilters}>
          Clear All
        </Button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Advanced Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Make and Model */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="make">Make</Label>
                <Select value={filters.make} onValueChange={(value) => setFilters(prev => ({ ...prev, make: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select make" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Makes</SelectItem>
                    {uniqueValues.makes.map(make => (
                      <SelectItem key={make} value={make}>{make}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="model">Model</Label>
                <Select value={filters.model} onValueChange={(value) => setFilters(prev => ({ ...prev, model: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Models</SelectItem>
                    {uniqueValues.models.map(model => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <Label>Price Range</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Input
                  type="number"
                  placeholder="Min Price"
                  value={filters.minPrice || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    minPrice: e.target.value ? parseInt(e.target.value) : null 
                  }))}
                />
                <Input
                  type="number"
                  placeholder="Max Price"
                  value={filters.maxPrice || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    maxPrice: e.target.value ? parseInt(e.target.value) : null 
                  }))}
                />
              </div>
            </div>

            {/* Year Range */}
            <div>
              <Label>Year Range</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Input
                  type="number"
                  placeholder="Min Year"
                  value={filters.minYear || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    minYear: e.target.value ? parseInt(e.target.value) : null 
                  }))}
                />
                <Input
                  type="number"
                  placeholder="Max Year"
                  value={filters.maxYear || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    maxYear: e.target.value ? parseInt(e.target.value) : null 
                  }))}
                />
              </div>
            </div>

            {/* Mileage Range */}
            <div>
              <Label>Mileage Range</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Input
                  type="number"
                  placeholder="Min Mileage"
                  value={filters.minMileage || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    minMileage: e.target.value ? parseInt(e.target.value) : null 
                  }))}
                />
                <Input
                  type="number"
                  placeholder="Max Mileage"
                  value={filters.maxMileage || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    maxMileage: e.target.value ? parseInt(e.target.value) : null 
                  }))}
                />
              </div>
            </div>

            {/* Additional Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Transmission</Label>
                <Select value={filters.transmission} onValueChange={(value) => setFilters(prev => ({ ...prev, transmission: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Fuel Type</Label>
                <Select value={filters.fuelType} onValueChange={(value) => setFilters(prev => ({ ...prev, fuelType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    <SelectItem value="gasoline">Gasoline</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Body Style</Label>
                <Select value={filters.bodyStyle} onValueChange={(value) => setFilters(prev => ({ ...prev, bodyStyle: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    <SelectItem value="sedan">Sedan</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="truck">Truck</SelectItem>
                    <SelectItem value="hatchback">Hatchback</SelectItem>
                    <SelectItem value="convertible">Convertible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Saved Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {savedSearches.map((savedSearch, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{savedSearch.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(savedSearch.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => loadSavedSearch(savedSearch)}
                    >
                      Load
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteSavedSearch(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
