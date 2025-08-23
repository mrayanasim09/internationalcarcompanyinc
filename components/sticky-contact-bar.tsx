"use client"

import { Phone, MessageSquare } from "lucide-react"
import { usePathname } from "next/navigation"

export function StickyContactBar() {
  type ContactFeature = "Call" | "SMS" | "WhatsApp"
  
  const contacts = [
    { n: "+13103507709", l: "+1 310-350-7709", type: "Mobile", features: ["Call", "SMS", "WhatsApp"] as ContactFeature[] },
    { n: "+14242509663", l: "+1 424-250-9663", type: "Landline", features: ["Call"] as ContactFeature[] },
  ]

  const call = (num: string) => {
    window.location.href = `tel:${num}`
  }

  const sms = (num: string) => {
    window.location.href = `sms:${num}`
  }

  const whatsapp = (num: string) => {
    window.open(`https://wa.me/${num}`, '_blank')
  }

  // Hide on car detail pages (prevent overlap with floating CTA)
  const pathname = usePathname()
  const isCarDetail = pathname?.startsWith('/car/')
  const isAdminPage = pathname?.startsWith('/admin')
  
  // Don't show on car detail pages or admin pages
  if (isCarDetail || isAdminPage) return null

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-5xl mx-auto px-4 py-3">
        {/* Display both numbers horizontally in a flex layout */}
        <div className="flex flex-wrap justify-center gap-4">
          {contacts.map(({ n, l, type, features }) => (
            <div key={n} className="flex flex-col items-center gap-2 text-center min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <button
                    onClick={() => call(n)}
                    aria-label={`Call ${l}`}
                    className="text-foreground text-sm font-medium hover:text-primary transition-colors break-words"
                  >
                    {l}
                  </button>
                  <div className="text-xs text-muted-foreground">{type}</div>
                </div>
              </div>
              <div className="flex gap-2 justify-center flex-wrap">
                {features.includes("Call") && (
                  <button
                    onClick={() => call(n)}
                    aria-label={`Call ${l}`}
                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Phone className="h-3 w-3" />
                    Call
                  </button>
                )}
                {features.includes("SMS") && (
                  <button
                    onClick={() => sms(n)}
                    aria-label={`SMS ${l}`}
                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
                  >
                    <MessageSquare className="h-3 w-3" />
                    SMS
                  </button>
                )}
                {features.includes("WhatsApp") && (
                  <button
                    onClick={() => whatsapp(n)}
                    aria-label={`WhatsApp ${l}`}
                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors"
                  >
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    WhatsApp
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


