"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { ImageUpload } from "@/components/ui/image-upload"
import { Settings, Globe, Clock, MapPin, Phone, Mail, Facebook, Instagram, Twitter } from "lucide-react"

interface ParkSettings {
  _id?: string
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

const defaultSettings: ParkSettings = {
  general: {
    parkName: "Luna Amusement Park",
    description: "Experience the magic at Luna Park - where fun never ends!",
    address: "123 Fun Street, Entertainment City, EC 12345",
    phone: "(555) 123-PARK",
    email: "info@lunapark.com",
    website: "https://lunapark.com",
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
    twitterImage: "https://lunapark.com/twitter-image.jpg",
  },
  social: {
    facebook: "https://facebook.com/lunapark",
    instagram: "https://instagram.com/lunapark",
    twitter: "https://twitter.com/lunapark",
    youtube: "https://youtube.com/lunapark",
    tiktok: "https://tiktok.com/@lunapark",
  },
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<ParkSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const response = await fetch("/api/admin/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings({ ...defaultSettings, ...data.settings })
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    } finally {
      setLoading(false)
    }
  }

  async function saveSettings() {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Settings saved successfully",
        })
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  function updateSettings(section: keyof ParkSettings, field: string, value: any) {
    setSettings(prev => {
      if (!prev) return prev
      
      const currentSection = prev[section]
      if (currentSection && typeof currentSection === 'object') {
        return {
          ...prev,
          [section]: {
            ...currentSection,
            [field]: value
          }
        }
      }
      return prev
    })
  }

  if (loading) {
    return <div className="text-center py-8">Loading settings...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your park settings and configuration</p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Park Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="parkLogo">Park Logo</Label>
                <ImageUpload
                  value={settings.general.logo || ""}
                  onChange={(url) => updateSettings("general", "logo", url)}
                  placeholder="Upload park logo"
                  showPreview={true}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="parkName">Park Name</Label>
                  <Input
                    id="parkName"
                    value={settings.general.parkName}
                    onChange={(e) => updateSettings("general", "parkName", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={settings.general.website}
                    onChange={(e) => updateSettings("general", "website", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={settings.general.description}
                  onChange={(e) => updateSettings("general", "description", e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={settings.general.address}
                  onChange={(e) => updateSettings("general", "address", e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={settings.general.phone}
                    onChange={(e) => updateSettings("general", "phone", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.general.email}
                    onChange={(e) => updateSettings("general", "email", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={settings.seo.metaTitle}
                  onChange={(e) => updateSettings("seo", "metaTitle", e.target.value)}
                  placeholder="Your site title"
                />
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={settings.seo.metaDescription}
                  onChange={(e) => updateSettings("seo", "metaDescription", e.target.value)}
                  placeholder="Brief description of your site"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="keywords">Keywords (comma separated)</Label>
                <Input
                  id="keywords"
                  value={settings.seo.keywords.join(", ")}
                  onChange={(e) => updateSettings("seo", "keywords", e.target.value.split(", ").filter(k => k.trim()))}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>

              <div>
                <Label htmlFor="canonicalUrl">Canonical URL</Label>
                <Input
                  id="canonicalUrl"
                  value={settings.seo.canonicalUrl}
                  onChange={(e) => updateSettings("seo", "canonicalUrl", e.target.value)}
                  placeholder="https://yoursite.com"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Open Graph Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ogTitle">OG Title</Label>
                <Input
                  id="ogTitle"
                  value={settings.seo.ogTitle}
                  onChange={(e) => updateSettings("seo", "ogTitle", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="ogDescription">OG Description</Label>
                <Textarea
                  id="ogDescription"
                  value={settings.seo.ogDescription}
                  onChange={(e) => updateSettings("seo", "ogDescription", e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="ogImage">Open Graph Image</Label>
                <ImageUpload
                  value={settings.seo.ogImage}
                  onChange={(url) => updateSettings("seo", "ogImage", url)}
                  placeholder="Upload Open Graph image (1200x630px recommended)"
                  showPreview={true}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Twitter Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="twitterTitle">Twitter Title</Label>
                <Input
                  id="twitterTitle"
                  value={settings.seo.twitterTitle}
                  onChange={(e) => updateSettings("seo", "twitterTitle", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="twitterDescription">Twitter Description</Label>
                <Textarea
                  id="twitterDescription"
                  value={settings.seo.twitterDescription}
                  onChange={(e) => updateSettings("seo", "twitterDescription", e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="twitterImage">Twitter Image</Label>
                <ImageUpload
                  value={settings.seo.twitterImage}
                  onChange={(url) => updateSettings("seo", "twitterImage", url)}
                  placeholder="Upload Twitter card image (1200x600px recommended)"
                  showPreview={true}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={settings.social.facebook}
                    onChange={(e) => updateSettings("social", "facebook", e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={settings.social.instagram}
                    onChange={(e) => updateSettings("social", "instagram", e.target.value)}
                    placeholder="https://instagram.com/yourhandle"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={settings.social.twitter}
                    onChange={(e) => updateSettings("social", "twitter", e.target.value)}
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>
                <div>
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    value={settings.social.youtube}
                    onChange={(e) => updateSettings("social", "youtube", e.target.value)}
                    placeholder="https://youtube.com/yourchannel"
                  />
                </div>
                <div>
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    value={settings.social.tiktok}
                    onChange={(e) => updateSettings("social", "tiktok", e.target.value)}
                    placeholder="https://tiktok.com/@yourhandle"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}