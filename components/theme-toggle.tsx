"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleQuick = () => {
    const next = resolvedTheme === "dark" ? "light" : "dark"
    setTheme(next)
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="md:hidden border-2 border-border hover:bg-accent bg-background shadow-md hover:shadow-lg transition-all duration-200"
        aria-label="Loading theme toggle"
        disabled
      >
        <div className="h-[1.2rem] w-[1.2rem] animate-pulse bg-muted rounded" />
      </Button>
    )
  }

  return (
    <>
      {/* Quick modern toggle for mobile */}
      <Button
        variant="outline"
        size="icon"
        className="md:hidden border-2 border-border hover:bg-accent bg-background shadow-md hover:shadow-lg transition-all duration-200"
        aria-label="Toggle dark mode"
        aria-pressed={resolvedTheme === "dark"}
        onClick={toggleQuick}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-200 dark:-rotate-90 dark:scale-0 text-yellow-600 dark:text-yellow-400" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-200 dark:rotate-0 dark:scale-100 text-blue-600 dark:text-blue-400" />
        <span className="sr-only">Toggle dark mode</span>
      </Button>

      {/* Full menu on md+ */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="hidden md:inline-flex border-2 border-border hover:bg-accent bg-background shadow-md hover:shadow-lg transition-all duration-200"
            aria-label="Theme options"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-200 dark:-rotate-90 dark:scale-0 text-yellow-600 dark:text-yellow-400" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-200 dark:rotate-0 dark:scale-100 text-blue-600 dark:text-blue-400" />
            <span className="sr-only">Theme options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-card border border-border shadow-lg">
          <DropdownMenuItem 
            onClick={() => setTheme("light")}
            className="hover:bg-accent cursor-pointer"
          >
            <Sun className="h-4 w-4 mr-2 text-yellow-600" />
            Light
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setTheme("dark")}
            className="hover:bg-accent cursor-pointer"
          >
            <Moon className="h-4 w-4 mr-2 text-blue-600" />
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setTheme("system")}
            className="hover:bg-accent cursor-pointer"
          >
            <span className="h-4 w-4 mr-2 flex items-center justify-center">
              <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-blue-600 rounded-full"></div>
            </span>
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

