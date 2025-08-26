"use client"

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <div className={cn('relative animate-pulse', sizeClasses[size])}>
        <Image 
          src="/prestige-auto-sales-logo.png" 
          alt="Prestige Auto Sales LLC Logo" 
          fill 
          className="object-contain" 
          priority 
          sizes="(max-width: 768px) 32px, 48px, 64px" 
        />
      </div>
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  )
}

// Full page loading spinner with logo
export function FullPageSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="relative w-24 h-24 md:w-32 md:h-32 animate-pulse">
        <Image 
          src="/prestige-auto-sales-logo.png" 
          alt="Prestige Auto Sales LLC Logo" 
          fill 
          className="object-contain" 
          priority 
          sizes="(max-width: 768px) 96px, 128px" 
        />
      </div>
      {text && (
        <p className="text-lg text-muted-foreground font-medium">{text}</p>
      )}
    </div>
  )
}

// Inline loading spinner
export function InlineSpinner({ size = 'sm', className }: Omit<LoadingSpinnerProps, 'text'>) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }
  
  return (
    <div className={cn('relative animate-pulse', sizeClasses[size], className)}>
      <Image 
        src="/prestige-auto-sales-logo.png" 
        alt="Prestige Auto Sales LLC Logo" 
        fill 
        className="object-contain" 
        priority 
        sizes="16px, 24px, 32px" 
      />
    </div>
  )
}

// Button loading spinner
export function ButtonSpinner({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5', 
    lg: 'h-6 w-6'
  }
  
  return (
    <div className={cn('relative animate-pulse', sizeClasses[size])}>
      <Image 
        src="/prestige-auto-sales-logo.png" 
        alt="Prestige Auto Sales LLC Logo" 
        fill 
        className="object-contain" 
        priority 
        sizes="16px, 20px, 24px" 
      />
    </div>
  )
}

