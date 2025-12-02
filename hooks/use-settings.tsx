"use client"

import { useState, useEffect, createContext, useContext } from "react"

interface ParkSettings {
  general: {
    parkName: string
    description: string
    address: string
    phone: string
    email: string
    website: string
    logo?: string
  }
  seo: {
    metaTitle: string
    metaDescription: string
    keywords: string[]
    canonicalUrl: string
    ogTitle: string
    ogDescription: string
    ogImage: string
    twitterTitle: string
    twitterDescription: string
    twitterImage: string
  }
  social: {
    facebook: string
    instagram: string
    twitter: string
    youtube: string
    tiktok: string
  }
}

interface SettingsContextType {
  settings: ParkSettings | null
  loading: boolean
  error: string | null
  refreshSettings: () => Promise<void>
  refreshFromAdmin: () => Promise<void>
}

const defaultSettings: ParkSettings = {
  general: {
    parkName: "Luna Amusement Park",
    description: "Experience the magic at Luna Park - where fun never ends!",
    address: "123 Fun Street, Entertainment City, EC 12345",
    phone: "(555) 123-PARK",
    email: "info@lunapark.com",
    website: "https://lunapark.com",
    logo: ""
  },
  seo: {
    metaTitle: "Luna Amusement Park - Fun for the Whole Family",
    metaDescription: "Visit Luna Amusement Park for thrilling rides, family fun, and unforgettable memories. Open daily with rides for all ages.",
    keywords: ["amusement park", "family fun", "rides", "entertainment", "theme park"],
    canonicalUrl: "https://lunapark.com",
    ogTitle: "Luna Amusement Park - Where Magic Happens",
    ogDescription: "Experience the ultimate family fun at Luna Park with exciting rides and attractions for all ages.",
    ogImage: "https://lunapark.com/og-image.jpg",
    twitterTitle: "Luna Amusement Park",
    twitterDescription: "Come and experience the magic at Luna Park!",
    twitterImage: "https://lunapark.com/twitter-image.jpg"
  },
  social: {
    facebook: "https://facebook.com/lunapark",
    instagram: "https://instagram.com/lunapark",
    twitter: "https://twitter.com/lunapark",
    youtube: "https://youtube.com/lunapark",
    tiktok: "https://tiktok.com/@lunapark"
  }
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ParkSettings | null>(defaultSettings)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch("/api/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      } else {
        throw new Error("Failed to fetch settings")
      }
    } catch (err) {
      console.error("Error fetching settings:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch settings")
      // Keep using default settings on error
    } finally {
      setLoading(false)
    }
  }

  const refreshSettings = async () => {
    await fetchSettings()
  }

  // Function to refresh settings from admin panel
  const refreshFromAdmin = async () => {
    try {
      // Force refresh from server
      const response = await fetch("/api/settings", {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      }
    } catch (err) {
      console.error("Error refreshing settings:", err)
    }
  }

  useEffect(() => {
    // Fetch settings on mount
    fetchSettings()
    
    // Optional: Set up polling to check for updates every 5 minutes
    const interval = setInterval(() => {
      refreshFromAdmin()
    }, 5 * 60 * 1000) // 5 minutes
    
    return () => clearInterval(interval)
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, loading, error, refreshSettings, refreshFromAdmin }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}

// Helper hook for components that need settings with fallback
export function useSettingsWithFallback() {
  const { settings, loading, error } = useSettings()
  
  return {
    settings: settings || defaultSettings,
    loading,
    error,
    hasSettings: !!settings
  }
}
