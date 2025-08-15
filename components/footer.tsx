"use client"

import Link from "next/link"
import Image from "next/image"
import { BrandNameUser } from "@/components/brand-name-user"
import { Phone, MessageCircle } from "lucide-react"
import { Mail, MapPin } from "lucide-react"
import { CookiePreferences } from "@/components/cookie-preferences"
 
const phoneNumbers = [
  { e164: "+13103507709", label: "+1 310-350-7709" },
]

export function Footer() {
  return (
    <footer className="icc-theme bg-background text-foreground border-t border-border" aria-labelledby="site-footer">
      <div className="container mx-auto px-4 py-10">
        <h2 id="site-footer" className="sr-only">Footer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 group" aria-label="International Car Company Inc Home">
              <div>
                <div className="text-lg font-bold text-foreground">
                  International Car Company Inc
                </div>
                 <div className="text-xs text-muted-foreground">Professional vehicles. Modern experience.</div>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">Professional car sales with transparent pricing and a modern experience.</p>
          </div>

          {/* Contact & Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary mt-1" aria-hidden="true" />
                <div className="text-sm text-muted-foreground">
                  <div className="font-medium text-foreground">Our Location</div>
                  <div><BrandNameUser className="inline" /></div>
                  <div>24328 S Vermont Ave Suite #215</div>
                  <div>Harbor City, CA 90710</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
                <a className="text-sm text-muted-foreground hover:text-primary" href="mailto:info@internationalcarcompanyinc.com">info@internationalcarcompanyinc.com</a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 pt-2">
                {phoneNumbers.map(({ e164, label }) => (
                  <div key={e164} className="flex flex-wrap items-center gap-2 border border-border rounded-xl p-2.5 bg-card/60">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-sm font-semibold truncate">{label}</span>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0 w-full sm:w-auto justify-start sm:justify-end">
                      <a
                        href={`tel:${e164}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors min-h-[36px]"
                        aria-label={`Call ${label}`}
                      >
                        <Phone className="h-4 w-4" />
                        <span className="text-xs font-medium">Call</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links (exclude privacy/terms here as they are in the bottom bar) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-foreground/80 hover:text-primary">Home</Link></li>
              <li><Link href="/about" className="text-foreground/80 hover:text-primary">About Us</Link></li>
              <li><Link href="/inventory" className="text-foreground/80 hover:text-primary">Inventory</Link></li>
              <li><Link href="/contact" className="text-foreground/80 hover:text-primary">Contact</Link></li>
            </ul>
          </div>

          {/* Business Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Business Hours</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <div className="flex items-center justify-between"><span className="font-medium text-foreground">Monday</span><span>9:00 AM - 5:00 PM</span></div>
              <div className="flex items-center justify-between"><span className="font-medium text-foreground">Tuesday</span><span>9:00 AM - 5:00 PM</span></div>
              <div className="flex items-center justify-between"><span className="font-medium text-foreground">Wednesday</span><span>9:00 AM - 5:00 PM</span></div>
              <div className="flex items-center justify-between"><span className="font-medium text-foreground">Thursday</span><span>9:00 AM - 5:00 PM</span></div>
              <div className="flex items-center justify-between"><span className="font-medium text-foreground">Friday</span><span>9:00 AM - 5:00 PM</span></div>
              <div className="flex items-center justify-between"><span className="font-medium text-foreground">Saturday</span><span>9:00 AM - 5:00 PM</span></div>
              <div className="flex items-center justify-between"><span className="font-medium text-foreground">Sunday</span><span>9:00 AM - 5:00 PM</span></div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-6 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© 2025 <BrandNameUser className="inline" /> All rights reserved.</p>
            <div className="flex gap-6 text-sm items-center">
              <CookiePreferences />
              <Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link>
              <Link href="/terms" className="text-muted-foreground hover:text-primary">Terms & Conditions</Link>
              <Link href="/sitemap.xml" className="text-muted-foreground hover:text-primary">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
