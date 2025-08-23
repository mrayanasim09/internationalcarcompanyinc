// app/car/[id]/page.tsx

import { CarPageClient } from '@/components/car-page-client'

// Force dynamic rendering to prevent build-time data fetching
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface CarPageProps {
  params: {
    id: string
  }
}

export default function CarPage({ params }: CarPageProps) {
  return (
    <div className="icc-theme min-h-screen bg-background">
      <main>
        <CarPageClient carId={params.id} />
      </main>
    </div>
  )
}