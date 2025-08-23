"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressBarProps {
  percentage: number
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

export function ProgressBar({ 
  percentage, 
  className, 
  showLabel = true, 
  size = 'md',
  variant = 'default'
}: ProgressBarProps) {
  // Calculate progress class based on percentage
  const progressClass = React.useMemo(() => {
    const progress = Math.round(percentage / 10) * 10
    return `progress-${Math.min(progress, 100)}`
  }, [percentage])

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500'
  }

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn(
        "w-full bg-secondary rounded-full overflow-hidden",
        sizeClasses[size]
      )}>
        <div 
          className={cn(
            "h-full transition-all duration-300 ease-in-out rounded-full",
            variantClasses[variant],
            progressClass
          )}
        />
      </div>
    </div>
  )
}

