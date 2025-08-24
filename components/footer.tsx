"use client"

import Link from "next/link"
import { BrandNameUser } from "@/components/brand-name-user"
import { Phone, MessageCircle } from "lucide-react"
import { Mail, MapPin } from "lucide-react"
import { CookiePreferences } from "@/components/cookie-preferences"
import Image from "next/image"
 
const phoneNumbers = [
  { e164: "+13103507709", label: "+1 310-350-7709", type: "Mobile", features: ["Call", "SMS", "WhatsApp"] },
  { e164: "+14242509663", label: "+1 424-250-9663", type: "Landline", features: ["Call"] },
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
              {/* Logo Image */}
              <div className="relative w-28 h-28 md:w-24 md:h-24 footer-logo">
                <Image src="/prestige-auto-sales-logo.png" alt="Prestige Auto Sales LLC Logo" fill className="object-contain" priority sizes="(max-width: 768px) 112px, 96px" />
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">
                  International Car Company Inc
                </div>
                 <div className="text-xs text-foreground/70 dark:text-foreground/90">Professional vehicles. Modern experience.</div>
              </div>
            </Link>
            <p className="text-sm text-foreground/70 dark:text-foreground/90">Professional car sales with transparent pricing and a modern experience.</p>
          </div>

          {/* Contact & Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary mt-1" aria-hidden="true" />
                <div className="text-sm text-foreground/70 dark:text-foreground/90">
                  <div className="font-medium text-foreground">Our Location</div>
                  <div><BrandNameUser className="inline" /></div>
                  <div>24328 S Vermont Ave Suite #215</div>
                  <div>Harbor City, CA 90710</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-primary mt-1 flex-shrink-0" aria-hidden="true" />
                <a className="text-sm text-foreground/70 dark:text-foreground/90 hover:text-primary leading-relaxed break-words" href="mailto:info@internationalcarcompanyinc.com">info@internationalcarcompanyinc.com</a>
              </div>
              {/* Both phone numbers displayed horizontally */}
              <div className="pt-2 space-y-3">
                {phoneNumbers.map((phone) => (
                  <div key={phone.e164} className="border border-border rounded-xl p-4 bg-card/60 hover:bg-card/80 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-foreground">{phone.label}</span>
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">{phone.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {phone.features.includes("Call") && (
                        <a
                          href={`tel:${phone.e164}`}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
                          aria-label={`Call ${phone.label}`}
                        >
                          <Phone className="h-4 w-4" />
                          Call
                        </a>
                      )}
                      {phone.features.includes("SMS") && (
                        <a
                          href={`sms:${phone.e164}`}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-sm font-medium"
                          aria-label={`SMS ${phone.label}`}
                        >
                          <MessageCircle className="h-4 w-4" />
                          SMS
                        </a>
                      )}
                      {phone.features.includes("WhatsApp") && (
                        <a
                          href={`https://wa.me/${phone.e164}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium"
                          aria-label={`WhatsApp ${phone.label}`}
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.86 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                          </svg>
                          WhatsApp
                        </a>
                      )}
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
              <li><Link href="/" className="text-foreground/70 dark:text-foreground/90 hover:text-primary">Home</Link></li>
              <li><Link href="/about" className="text-foreground/70 dark:text-foreground/90 hover:text-primary">About Us</Link></li>
              <li><Link href="/inventory" className="text-foreground/70 dark:text-foreground/90 hover:text-primary">Inventory</Link></li>
              <li><Link href="/contact" className="text-foreground/70 dark:text-foreground/90 hover:text-primary">Contact</Link></li>
            </ul>
          </div>

          {/* Business Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Business Hours</h3>
            <div className="text-sm text-foreground/70 dark:text-foreground/90 space-y-2">
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
            <p className="text-sm text-foreground/70 dark:text-foreground/90">© 2025 <BrandNameUser className="inline" /> All rights reserved.</p>
            <div className="flex gap-6 text-sm items-center">
              <CookiePreferences />
              <Link href="/privacy" className="text-foreground/70 dark:text-foreground/90 hover:text-primary">Privacy Policy</Link>
              <Link href="/terms" className="text-foreground/70 dark:text-foreground/90 hover:text-primary">Terms & Conditions</Link>
              <Link href="/sitemap.xml" className="text-foreground/70 dark:text-foreground/90 hover:text-primary">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
