"use client"

import { AlertTriangle, Info, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type Variant = "error" | "warning" | "info" | "success"

interface ErrorDisplayProps {
  title: string
  description?: string
  variant?: Variant
  className?: string
  actions?: React.ReactNode
}

const variantStyles: Record<Variant, { wrapper: string; icon: JSX.Element; badge: string }> = {
  error: {
    wrapper: "border-red-300/60 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30",
    icon: <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />,
    badge: "bg-red-600 text-white",
  },
  warning: {
    wrapper: "border-amber-300/60 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30",
    icon: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />,
    badge: "bg-amber-600 text-white",
  },
  info: {
    wrapper: "border-blue-300/60 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/30",
    icon: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />,
    badge: "bg-blue-600 text-white",
  },
  success: {
    wrapper: "border-emerald-300/60 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30",
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />,
    badge: "bg-emerald-600 text-white",
  },
}

export function ErrorDisplay({ title, description, variant = "error", className, actions }: ErrorDisplayProps) {
  const styles = variantStyles[variant]
  return (
    <div className={cn("w-full rounded-xl border p-4 md:p-5", styles.wrapper, className)} role="alert" aria-live="polite">
      <div className="flex items-start gap-3">
        <div className="mt-0.5" aria-hidden>
          {styles.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("px-2 py-0.5 rounded text-xs font-medium", styles.badge)}>
              {variant.toUpperCase()}
            </span>
            <h3 className="font-semibold text-foreground">{title}</h3>
          </div>
          {description ? (
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          ) : null}
          {actions ? <div className="mt-3">{actions}</div> : null}
        </div>
      </div>
    </div>
  )
}


