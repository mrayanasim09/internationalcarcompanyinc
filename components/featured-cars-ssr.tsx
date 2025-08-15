import { CarCard } from '@/components/car-card'
import type { Car } from '@/lib/types'

// Sample data for when database is not configured
const sampleCars: Car[] = [
  {
    id: '1',
    make: 'BMW',
    model: '3 Series',
    title: '2021 BMW 3 Series',
    year: 2021,
    price: 35000,
    mileage: 25000,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    driveType: 'RWD',
    exteriorColor: 'Black',
    interiorColor: 'Black',
    vin: 'WBA8E9G50JNT12345',
    description: 'Well-maintained BMW 3 Series with premium features and excellent condition.',
    features: ['Leather Seats', 'Navigation', 'Bluetooth', 'Backup Camera'],
    images: ['/bmw-3-series-black.jpg'],
    location: 'Harbor City, CA',
    rating: 4.5,
    approved: true,
    contact: {
      phone: '+13103507709',
      whatsapp: '+13103507709'
    },
    reviews: [],
    listedAt: new Date(),
  },
  {
    id: '2',
    make: 'Toyota',
    model: 'Camry',
    title: '2019 Toyota Camry',
    year: 2019,
    price: 22000,
    mileage: 45000,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    driveType: 'FWD',
    exteriorColor: 'Silver',
    interiorColor: 'Gray',
    vin: '4T1B11HK5JU123456',
    description: 'Reliable Toyota Camry with great fuel economy and comfortable ride.',
    features: ['Bluetooth', 'Backup Camera', 'Cruise Control', 'Keyless Entry'],
    images: ['/toyota-camry-2019.jpg'],
    location: 'Harbor City, CA',
    rating: 4.3,
    approved: true,
    contact: {
      phone: '+13103507709',
      whatsapp: '+13103507709'
    },
    reviews: [],
    listedAt: new Date(),
  },
  {
    id: '3',
    make: 'Ford',
    model: 'F-150',
    title: '2020 Ford F-150',
    year: 2020,
    price: 42000,
    mileage: 30000,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    driveType: '4WD',
    exteriorColor: 'White',
    interiorColor: 'Black',
    vin: '1FTEW1E47LFA12345',
    description: 'Powerful Ford F-150 truck perfect for work and recreation.',
    features: ['4WD', 'Towing Package', 'Bluetooth', 'Backup Camera'],
    images: ['/ford-f150-2020.png'],
    location: 'Harbor City, CA',
    rating: 4.7,
    approved: true,
    contact: {
      phone: '+13103507709',
      whatsapp: '+13103507709'
    },
    reviews: [],
    listedAt: new Date(),
  },
  {
    id: '4',
    make: 'Honda',
    model: 'Civic',
    title: '2021 Honda Civic',
    year: 2021,
    price: 25000,
    mileage: 20000,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    driveType: 'FWD',
    exteriorColor: 'Blue',
    interiorColor: 'Black',
    vin: '2HGFC2F56MH123456',
    description: 'Sporty Honda Civic with excellent handling and modern features.',
    features: ['Apple CarPlay', 'Android Auto', 'Backup Camera', 'Lane Departure Warning'],
    images: ['/honda-civic-2021.jpg'],
    location: 'Harbor City, CA',
    rating: 4.4,
    approved: true,
    contact: {
      phone: '+13103507709',
      whatsapp: '+13103507709'
    },
    reviews: [],
    listedAt: new Date(),
  },
]

export async function FeaturedCarsSSR() {
  // Show sample data when database is not configured
  if (process.env.SKIP_ENV_VALIDATION === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sampleCars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>
    )
  }

  // This will only run at runtime when database is properly configured
  return (
    <div className="container mx-auto px-4">
      <div className="text-center py-8 md:py-12">
        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
          Featured Vehicles
        </h3>
        <p className="text-muted-foreground text-sm md:text-base">
          Featured vehicles will load from database.
        </p>
      </div>
    </div>
  )
}


