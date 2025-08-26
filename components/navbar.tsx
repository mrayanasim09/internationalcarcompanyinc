"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { BrandNameUser } from "@/components/brand-name-user"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, X } from "lucide-react"
import Image from "next/image"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 10)
  }, [])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev)
  }, [])

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
  }, [])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-background/95 backdrop-blur-sm shadow-lg border-b border-border" : "bg-background/90 backdrop-blur-sm"
        }`}
        aria-label="Primary"
      >
        <div className="container mx-auto px-0 md:px-4">
          <div className="flex items-center justify-between h-24 md:h-32 lg:h-36">
            {/* Brand - Made bigger and more clickable */}
            <div className="flex items-center gap-1 md:gap-3 shrink-0 mr-2 md:mr-0">
              <Link href="/" className="flex items-center gap-1 md:gap-3 group" aria-label="International Car Company Inc Home" onClick={closeMenu}>
                {/* Logo Image - Made bigger on all screens */}
                <div className="relative w-28 h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 navbar-logo">
                  <Image 
                    src="/prestige-auto-sales-logo.png" 
                    alt="Prestige Auto Sales LLC Logo" 
                    fill 
                    className="object-contain transition-transform group-hover:scale-105" 
                    priority 
                    sizes="(max-width:768px) 112px, (max-width:1024px) 128px, 160px" 
                  />
                </div>
                {/* Brand text - Always visible on mobile, smaller font size */}
                <div className="block leading-tight">
                  <div className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-foreground tracking-tight">
                    <BrandNameUser />
                  </div>
                  <div className="hidden sm:block text-xs md:text-sm lg:text-base text-muted-foreground">
                    Professional vehicles. Modern experience.
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-10 lg:gap-12 flex-1 justify-end overflow-x-auto">
              <Link href="/" className="text-foreground/80 hover:text-primary transition-colors font-medium px-2 py-1">
                Home
              </Link>
              <Link href="/inventory" className="text-foreground/80 hover:text-primary transition-colors font-medium px-2 py-1">
                Inventory
              </Link>
              <Link href="/about" className="text-foreground/80 hover:text-primary transition-colors font-medium px-2 py-1">
                About
              </Link>
              <Link href="/contact" className="text-foreground/80 hover:text-primary transition-colors font-medium px-2 py-1">
                Contact
              </Link>
            </div>

            {/* Theme Toggle only */}
            <div className="hidden md:flex items-center gap-2 shrink-0 ml-4">
              <ThemeToggle />
            </div>

            {/* Mobile: show Theme Toggle + Menu with proper spacing */}
            <div className="md:hidden flex items-center gap-2 shrink-0">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMenu}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-controls="mobile-nav"
                aria-expanded={isMenuOpen}
                className="p-2 text-foreground hover:text-primary touch-button min-w-[40px] min-h-[40px]"
                type="button"
              >
                {isMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu - Fixed positioning and structure */}
          {isMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-background border-t border-border shadow-lg z-50">
              <div id="mobile-nav" className="px-6 py-4 space-y-4" aria-label="Mobile navigation">
                <Link 
                  href="/" 
                  className="block text-lg font-medium text-foreground hover:text-primary transition-colors py-3 border-b border-border/50" 
                  onClick={closeMenu}
                >
                  Home
                </Link>
                <Link 
                  href="/inventory" 
                  className="block text-lg font-medium text-foreground hover:text-primary transition-colors py-3 border-b border-border/50" 
                  onClick={closeMenu}
                >
                  Inventory
                </Link>
                <Link 
                  href="/about" 
                  className="block text-lg font-medium text-foreground hover:text-primary transition-colors py-3 border-b border-border/50" 
                  onClick={closeMenu}
                >
                  About
                </Link>
                <Link 
                  href="/contact" 
                  className="block text-lg font-medium text-foreground hover:text-primary transition-colors py-3 border-b border-border/50" 
                  onClick={closeMenu}
                >
                  Contact
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}