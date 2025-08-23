import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Car card skeleton
function CarCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  )
}

// Form skeleton
function FormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  )
}

// Navigation skeleton
function NavigationSkeleton() {
  return (
    <div className="flex items-center justify-between p-4">
      <Skeleton className="h-8 w-32" />
      <div className="flex gap-4">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  )
}

// Hero skeleton
function HeroSkeleton() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <Skeleton className="h-12 w-96 mx-auto" />
        <Skeleton className="h-6 w-80 mx-auto" />
        <div className="flex gap-4 justify-center">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 w-32" />
        </div>
      </div>
    </div>
  )
}

// Table skeleton
function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-4 p-4 border-b">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-28" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>
      ))}
    </div>
  )
}

export { 
  Skeleton, 
  CarCardSkeleton, 
  FormSkeleton, 
  NavigationSkeleton, 
  HeroSkeleton, 
  TableSkeleton 
}
