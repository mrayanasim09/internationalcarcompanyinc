"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Settings, Cookie } from 'lucide-react'
import { useAnalyticsConsent } from '@/hooks/use-analytics-consent'

export function CookiePreferences() {
  const { hasConsent, acceptAnalytics, declineAnalytics, clearConsent } = useAnalyticsConsent()
  const [isOpen, setIsOpen] = useState(false)
  const [localConsent, setLocalConsent] = useState<boolean | null>(null)

  useEffect(() => {
    setLocalConsent(hasConsent)
  }, [hasConsent])

  const handleSave = () => {
    if (localConsent === true) {
      acceptAnalytics()
    } else if (localConsent === false) {
      declineAnalytics()
    }
    setIsOpen(false)
  }

  const handleReset = () => {
    clearConsent()
    setLocalConsent(null)
    setIsOpen(false)
  }

  if (hasConsent === null) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <Settings className="h-3 w-3" />
          Cookie Settings
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-md"
        aria-describedby="cookie-preferences-dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5" />
            Cookie Preferences
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="essential" className="text-sm font-medium">
                  Essential Cookies
                </Label>
                <p className="text-xs text-muted-foreground">
                  Required for site functionality
                </p>
              </div>
              <Switch
                id="essential"
                checked={true}
                disabled
                className="opacity-50"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="analytics" className="text-sm font-medium">
                  Analytics Cookies
                </Label>
                <p className="text-xs text-muted-foreground">
                  Help us improve site performance
                </p>
              </div>
              <Switch
                id="analytics"
                checked={localConsent === true}
                onCheckedChange={(checked) => setLocalConsent(checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="marketing" className="text-sm font-medium">
                  Marketing Cookies
                </Label>
                <p className="text-xs text-muted-foreground">
                  Show relevant vehicle offers
                </p>
              </div>
              <Switch
                id="marketing"
                checked={localConsent === true}
                onCheckedChange={(checked) => setLocalConsent(checked)}
              />
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                size="sm"
              >
                Reset Preferences
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                disabled={localConsent === hasConsent}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
