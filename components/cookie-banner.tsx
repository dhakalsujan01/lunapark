"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Cookie, Settings, Shield, BarChart3, Target } from "lucide-react"

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
}

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    functional: false,
  })

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem("cookie-consent")
    if (!cookieConsent) {
      setShowBanner(true)
    } else {
      const savedPreferences = JSON.parse(cookieConsent)
      setPreferences(savedPreferences)
    }
  }, [])

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    }
    setPreferences(allAccepted)
    saveCookiePreferences(allAccepted)
    setShowBanner(false)
  }

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    }
    setPreferences(necessaryOnly)
    saveCookiePreferences(necessaryOnly)
    setShowBanner(false)
  }

  const saveCustomPreferences = () => {
    saveCookiePreferences(preferences)
    setShowBanner(false)
    setShowSettings(false)
  }

  const saveCookiePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem("cookie-consent", JSON.stringify(prefs))
    localStorage.setItem("cookie-consent-date", new Date().toISOString())
    
    // Send preferences to analytics if enabled
    if (prefs.analytics && typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "update", {
        analytics_storage: prefs.analytics ? "granted" : "denied",
        ad_storage: prefs.marketing ? "granted" : "denied",
        functionality_storage: prefs.functional ? "granted" : "denied",
      })
    }
  }

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    if (key === "necessary") return // Can't disable necessary cookies
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  if (!showBanner) return null

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur border-t shadow-lg">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Cookie className="h-8 w-8 text-primary" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">We use cookies</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. 
                  By continuing to browse this site, you agree to our use of cookies.{" "}
                  <a href="/privacy-policy" className="text-primary hover:underline">
                    Learn more in our Privacy Policy
                  </a>
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={acceptAll} className="flex-1 sm:flex-none">
                    Accept All Cookies
                  </Button>
                  <Button onClick={acceptNecessary} variant="outline" className="flex-1 sm:flex-none">
                    Necessary Only
                  </Button>
                  <Dialog open={showSettings} onOpenChange={setShowSettings}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="flex-1 sm:flex-none">
                        <Settings className="h-4 w-4 mr-2" />
                        Customize
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Cookie className="h-5 w-5" />
                          Cookie Preferences
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-6">
                        <p className="text-muted-foreground">
                          We use different types of cookies to provide you with the best experience. 
                          You can choose which categories you'd like to allow.
                        </p>

                        {/* Necessary Cookies */}
                        <div className="flex items-start justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Shield className="h-4 w-4 text-green-600" />
                              <h4 className="font-semibold">Necessary Cookies</h4>
                              <Badge variant="secondary">Required</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Essential for the website to function properly. These cookies enable core functionality 
                              such as authentication and security features.
                            </p>
                          </div>
                          <Switch checked={true} disabled className="ml-4" />
                        </div>

                        {/* Analytics Cookies */}
                        <div className="flex items-start justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <BarChart3 className="h-4 w-4 text-blue-600" />
                              <h4 className="font-semibold">Analytics Cookies</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Help us understand how visitors interact with our website by collecting 
                              and reporting information anonymously.
                            </p>
                          </div>
                          <Switch 
                            checked={preferences.analytics}
                            onCheckedChange={(checked) => updatePreference("analytics", checked)}
                            className="ml-4"
                          />
                        </div>

                        {/* Marketing Cookies */}
                        <div className="flex items-start justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="h-4 w-4 text-purple-600" />
                              <h4 className="font-semibold">Marketing Cookies</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Used to track visitors across websites to display relevant ads and 
                              measure the effectiveness of our advertising campaigns.
                            </p>
                          </div>
                          <Switch 
                            checked={preferences.marketing}
                            onCheckedChange={(checked) => updatePreference("marketing", checked)}
                            className="ml-4"
                          />
                        </div>

                        {/* Functional Cookies */}
                        <div className="flex items-start justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Settings className="h-4 w-4 text-orange-600" />
                              <h4 className="font-semibold">Functional Cookies</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Enable enhanced functionality and personalization, such as remembering 
                              your preferences and settings.
                            </p>
                          </div>
                          <Switch 
                            checked={preferences.functional}
                            onCheckedChange={(checked) => updatePreference("functional", checked)}
                            className="ml-4"
                          />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                          <Button variant="outline" onClick={acceptNecessary}>
                            Necessary Only
                          </Button>
                          <Button onClick={saveCustomPreferences}>
                            Save Preferences
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
