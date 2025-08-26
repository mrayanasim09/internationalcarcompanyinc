"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MessageCircle, Phone, ArrowUp } from "lucide-react"

interface FloatingActionButtonProps {
  className?: string
}

export function FloatingActionButton({ className }: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleWhatsApp = () => {
    const message = encodeURIComponent("Hi! I'm interested in your vehicles. Can you help me?")
    window.open(`https://wa.me/13103507709?text=${message}`, "_blank")
  }

  const handleCall = () => {
    window.location.href = "tel:+13103507709"
  }

  return (
    <div className={cn("fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3", className)}>
      {/* Expanded Actions */}
      {isExpanded && (
        <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-2 duration-200">
          <Button
            onClick={scrollToTop}
            size="sm"
            className="rounded-full h-12 w-12 bg-gray-600 hover:bg-gray-700 shadow-lg"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
          <Button
            onClick={handleCall}
            size="sm"
            className="rounded-full h-12 w-12 bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <Phone className="h-5 w-5" />
          </Button>
          <Button
            onClick={handleWhatsApp}
            size="sm"
            className="rounded-full h-12 w-12 bg-green-600 hover:bg-green-700 shadow-lg"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Main FAB */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "rounded-full h-14 w-14 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-transform duration-200",
          isExpanded && "rotate-45"
        )}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  )
}

