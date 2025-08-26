import { CarCard } from '@/components/car-card'
import type { Car } from '@/lib/types'
import { supabasePublic, testSupabaseConnection } from '@/lib/supabase/client'

export async function FeaturedCarsSSR() {
  let cars: Car[] = []
  let error: string | null = null

  try {
    // Test database connection first
    const connectionTest = await testSupabaseConnection()
    
    if (connectionTest.connected) {
      // Fetch featured cars from database
      const { data, error: dbError } = await supabasePublic
        .from('cars')
        .select('*')
        .order('listed_at', { ascending: false })
        .limit(6)

      if (dbError) {
        console.error('Database query error:', dbError)
        error = 'Failed to load featured cars from database'
        cars = []
      } else if (data && Array.isArray(data) && data.length > 0) {
        // Transform database rows to Car objects
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cars = (data as Record<string, any>[]).map(row => ({
          id: row.id,
          title: row.title || `${row.year} ${row.make} ${row.model}`,
          make: row.make,
          model: row.model,
          year: row.year,
          mileage: row.mileage,
          price: row.price,
          location: row.location,
          images: row.images || [],
          approved: row.approved,
          isFeatured: Boolean(row.is_featured),
          isInventory: Boolean(row.is_inventory),
          listedAt: row.listed_at ? new Date(row.listed_at) : new Date(),
          description: row.description || '',
          contact: { phone: row.contact?.phone || '', whatsapp: row.contact?.whatsapp || '' },
          rating: row.rating || 0,
          reviews: []
        }))
      } else {
        // No cars in database
        cars = []
      }
    } else {
      // Database not connected
      console.warn('Database not connected:', connectionTest.error)
      error = 'Database connection unavailable'
      cars = []
    }
  } catch (err) {
    console.error('Error in FeaturedCarsSSR:', err)
    error = 'Failed to load featured cars'
    cars = []
  }

  if (cars.length === 0) {
    return (
      <div className="container mx-auto px-4">
        <div className="text-center py-8 md:py-12">
          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
            Featured Vehicles
          </h3>
          <p className="text-muted-foreground text-sm md:text-base">
            {error ? 'Unable to load featured vehicles at the moment.' : 'No featured vehicles available at the moment.'}
          </p>
          <div className="mt-6">
            <p className="text-sm text-muted-foreground">
              Please check back later or contact us for current inventory.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>
      
      {error && (
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Note: {error}
          </p>
        </div>
      )}
    </div>
  )
}


