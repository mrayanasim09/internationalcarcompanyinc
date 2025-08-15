import { CarCard } from '@/components/car-card'
import type { Car } from '@/lib/types'

export async function FeaturedCarsSSR() {
  // Skip data fetching during build
  if (process.env.SKIP_ENV_VALIDATION === 'true') {
    return (
      <div className="container mx-auto px-4">
        <div className="text-center py-8 md:py-12">
          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
            Featured Vehicles
          </h3>
          <p className="text-muted-foreground text-sm md:text-base">
            Loading featured vehicles...
          </p>
        </div>
      </div>
    )
  }

  // This will only run at runtime, not during build
  return (
    <div className="container mx-auto px-4">
      <div className="text-center py-8 md:py-12">
        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
          Featured Vehicles
        </h3>
        <p className="text-muted-foreground text-sm md:text-base">
          Featured vehicles will load at runtime.
        </p>
      </div>
    </div>
  )
}


