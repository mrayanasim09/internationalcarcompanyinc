'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react';
import { ListingsContent, type ListingsFilters } from '@/components/listings-content';
import { CarLoader, CarGridSkeleton } from '@/components/ui/car-loader';
import { ErrorDisplay } from '@/components/ui/error-display';
import type { Car } from '@/lib/types';
import Script from 'next/script';
import { useCSPNonce } from '@/hooks/use-csp-nonce';
import { DynamicFilterPanel } from '@/components/dynamic-imports';

const getSupabaseClient = () => {
  // Lazy load supabase client to reduce initial bundle size
  if (typeof window === 'undefined') return null;
  
  return import('@/lib/supabase/client').then(mod => mod.supabasePublic);
};

// Separate loading component for better mobile performance
function InventoryLoading() {
  return (
    <div className="icc-theme min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const nonce = useCSPNonce();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<ListingsFilters>({
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
  });

  // Optimized pull-to-refresh functionality
  useEffect(() => {
    let startY = 0;
    let currentY = 0;
    let isRefreshing = false;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      currentY = e.touches[0].clientY;
      const diff = startY - currentY;

      // Only trigger refresh if user pulls down from the very top
      if (window.scrollY === 0 && diff < -50 && !isRefreshing) {
        isRefreshing = true;
        setRefreshing(true);
        
        // Simulate refresh
        setTimeout(() => {
          setRefreshing(false);
          isRefreshing = false;
        }, 1000);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Global runtime error safety net to avoid white screen
  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      setError('Something went wrong while loading this page.');
    };
    const handleRejection = () => {
      setError('A script failed to load. Please try again.');
    };
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchCars() {
      try {
        setLoading(true);
        setError(null);
        
        const supabasePublic = await getSupabaseClient();
        if (!supabasePublic) {
          if (isMounted) {
            setError("Client-side only");
            setLoading(false);
          }
          return;
        }

        const { data, error } = await supabasePublic
          .from('cars')
          .select('*')
          .eq('approved', true)
          .eq('is_inventory', true)
          .order('listed_at', { ascending: false })
          .limit(50); // Limit initial load for better mobile performance

        if (error) {
          console.error('Supabase error:', error);
          if (isMounted) {
            setError('Failed to load inventory. Please try again later.');
            setLoading(false);
          }
          return;
        }

        if (isMounted) {
          const fetchedCars: Car[] = (data || []).map((row: any) => ({
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
            contact: { phone: row.contact_phone || '', whatsapp: row.contact_whatsapp || '' },
            rating: row.rating || 0,
            reviews: row.reviews || [],
            status: row.status || 'available'
          }));

          setCars(fetchedCars);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching cars:', err);
        if (isMounted) {
          setError('Failed to load inventory. Please try again later.');
          setLoading(false);
        }
      }
    }

    fetchCars();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <InventoryLoading />;
  }

  return (
    <div className="icc-theme min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <Script
          id="listings-jsonld"
          type="application/ld+json"
          strategy="afterInteractive"
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "name": "Car Inventory",
              "description": "Browse our selection of quality pre-owned vehicles",
              "numberOfItems": cars.length,
              "itemListElement": cars.map((car, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": "Car",
                  "name": car.title || `${car.year} ${car.make} ${car.model}`,
                  "brand": {
                    "@type": "Brand",
                    "name": car.make
                  },
                  "model": car.model,
                  "vehicleModelDate": car.year?.toString(),
                  "offers": {
                    "@type": "Offer",
                    "price": car.price,
                    "priceCurrency": "USD"
                  },
                  "url": `https://internationalcarcompanyinc.com/car/${car.id}`
                }
              }))
            }).replace(/</g, '\\u003c').replace(/<\/script/gi, '<\\/script')
          }}
        />

        {error ? (
          <ErrorDisplay />
        ) : cars.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">No Vehicles Available</h2>
            <p className="text-muted-foreground mb-6">
              We're currently updating our inventory. Please check back soon or contact us for current availability.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Contact Us
              </a>
              <a
                href="/about"
                className="inline-flex items-center justify-center px-6 py-3 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
            <aside className="lg:w-1/4 lg:sticky lg:top-24 self-start">
              {/* Filter chips for quick access */}
              <div className="mb-4 flex flex-wrap gap-2">
                {filters.make && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20">
                    Make: {filters.make}
                  </span>
                )}
                {filters.model && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20">
                    Model: {filters.model}
                  </span>
                )}
                {filters.minPrice && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20">
                    Min: ${filters.minPrice.toLocaleString()}
                  </span>
                )}
                {filters.maxPrice && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20">
                    Max: ${filters.maxPrice.toLocaleString()}
                  </span>
                )}
              </div>
              
              <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded"></div>}>
                <DynamicFilterPanel
                  initialFilters={filters}
                  onFilter={setFilters}
                />
              </Suspense>
            </aside>
            
            <div className="lg:w-3/4">
              <Suspense fallback={<CarGridSkeleton count={6} />}>
                <ListingsContent
                  initialCars={cars}
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              </Suspense>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}