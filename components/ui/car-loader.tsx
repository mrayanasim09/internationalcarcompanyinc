"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

export function CarLoader({ size = 96, className }: { size?: number; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-8", className)} role="status" aria-label="Loading">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="text-2xl font-bold text-primary">
          International Car Company Inc
        </div>
        <div className="text-sm text-muted-foreground">
          Loading vehicle details...
        </div>
      </div>
    </div>
  )
}


