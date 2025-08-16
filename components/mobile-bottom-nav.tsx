"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Car, Phone, User } from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileBottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/inventory", icon: Car, label: "Cars" },
    { href: "/contact", icon: Phone, label: "Contact" },
    { href: "/about", icon: User, label: "About" },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around py-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center p-2 min-h-[48px] justify-center transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={label}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1 font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
