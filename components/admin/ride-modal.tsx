"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "@/components/ui/image-upload"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ImageIcon, DollarSign, Clock, Users, Ruler, AlertTriangle, Zap, Save, X } from "lucide-react"

interface Ride {
  _id: string
  title: string
  description: string
  shortDescription: string
  category: string
  restrictions: {
    minHeight?: number
    maxHeight?: number
    minAge?: number
    maxAge?: number
    healthWarnings: string[]
  }
  capacity: number
  duration: number
  price: number
  thrillLevel: number
  isPublished: boolean
  image: string
  images: string[]
}

interface RideModalProps {
  isOpen: boolean
  onClose: () => void
  ride: Ride | null
  onSuccess: () => void
}

export default function RideModal({ isOpen, onClose, ride, onSuccess }: RideModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    category: "",
    restrictions: {
      minHeight: undefined as number | undefined,
      maxHeight: undefined as number | undefined,
      minAge: undefined as number | undefined,
      maxAge: undefined as number | undefined,
      healthWarnings: [] as string[],
    },
    capacity: 0,
    duration: 0,
    price: 0,
    thrillLevel: 1,
    isPublished: false,
    image: "",
    images: [] as string[],
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (ride) {
      setFormData({
        title: ride.title,
        description: ride.description,
        shortDescription: ride.shortDescription,
        category: ride.category,
        restrictions: {
          minHeight: ride.restrictions?.minHeight,
          maxHeight: ride.restrictions?.maxHeight,
          minAge: ride.restrictions?.minAge,
          maxAge: ride.restrictions?.maxAge,
          healthWarnings: ride.restrictions?.healthWarnings || [],
        },
        capacity: ride.capacity,
        duration: ride.duration,
        price: ride.price,
        thrillLevel: ride.thrillLevel,
        isPublished: ride.isPublished,
        image: ride.image,
        images: ride.images,
      })
    } else {
      setFormData({
        title: "",
        description: "",
        shortDescription: "",
        category: "",
        restrictions: {
          minHeight: undefined,
          maxHeight: undefined,
          minAge: undefined,
          maxAge: undefined,
          healthWarnings: [],
        },
        capacity: 0,
        duration: 0,
        price: 0,
        thrillLevel: 1,
        isPublished: false,
        image: "",
        images: [],
      })
    }
  }, [ride])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const url = ride ? `/api/admin/rides/${ride._id}` : "/api/admin/rides"
      const method = ride ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSuccess()
        onClose()
      } else {
        const error = await response.json()
        console.error("Failed to save ride:", error)
        alert(error.error || "Failed to save ride")
      }
    } catch (error) {
      console.error("Failed to save ride:", error)
      alert("Failed to save ride")
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      thrill: "bg-red-100 text-red-800 border-red-200",
      family: "bg-blue-100 text-blue-800 border-blue-200",
      kids: "bg-green-100 text-green-800 border-green-200",
      water: "bg-cyan-100 text-cyan-800 border-cyan-200",
      arcade: "bg-purple-100 text-purple-800 border-purple-200",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getThrillLevelColor = (level: number) => {
    if (level <= 2) return "text-green-600"
    if (level <= 3) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            {ride ? (
              <>
                <Zap className="h-6 w-6 text-primary" />
                Edit Ride
              </>
            ) : (
              <>
                <Zap className="h-6 w-6 text-primary" />
                Add New Ride
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Ride Title
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter ride name"
                      className="border-border/50 focus:border-primary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium">
                      Category
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="border-border/50 focus:border-primary">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="thrill">🎢 Thrill</SelectItem>
                        <SelectItem value="family">👨‍👩‍👧‍👦 Family</SelectItem>
                        <SelectItem value="kids">🧸 Kids</SelectItem>
                        <SelectItem value="water">🌊 Water</SelectItem>
                        <SelectItem value="arcade">🎮 Arcade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription" className="text-sm font-medium">
                    Short Description
                  </Label>
                  <Input
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="Brief description for cards (max 200 chars)"
                    className="border-border/50 focus:border-primary"
                    maxLength={200}
                    required
                  />
                  <p className="text-xs text-muted-foreground">{formData.shortDescription.length}/200 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Full Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed description of the ride experience"
                    rows={4}
                    className="border-border/50 focus:border-primary resize-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image" className="text-sm font-medium">
                    Main Image
                  </Label>
                  <ImageUpload
                    value={formData.image}
                    onChange={(url) => setFormData({ ...formData, image: url })}
                    placeholder="Upload ride main image"
                    showPreview={true}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Pricing & Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      Price (EUR)
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price || ""}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value ? Number.parseFloat(e.target.value) : 0 })}
                      className="border-border/50 focus:border-primary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-600" />
                      Duration (minutes)
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={formData.duration || ""}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value ? Number.parseInt(e.target.value) : 0 })}
                      className="border-border/50 focus:border-primary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity" className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      Capacity
                    </Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      value={formData.capacity || ""}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value ? Number.parseInt(e.target.value) : 0 })}
                      className="border-border/50 focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-2">
                  <Label htmlFor="thrillLevel" className="text-sm font-medium flex items-center gap-2">
                    <Zap className="h-4 w-4 text-orange-600" />
                    Thrill Level
                  </Label>
                  <Select
                    value={formData.thrillLevel.toString()}
                    onValueChange={(value) => setFormData({ ...formData, thrillLevel: Number.parseInt(value) })}
                  >
                    <SelectTrigger className="border-border/50 focus:border-primary">
                      <SelectValue placeholder="Select thrill level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">⭐ 1 - Very Mild</SelectItem>
                      <SelectItem value="2">⭐⭐ 2 - Mild</SelectItem>
                      <SelectItem value="3">⭐⭐⭐ 3 - Moderate</SelectItem>
                      <SelectItem value="4">⭐⭐⭐⭐ 4 - High</SelectItem>
                      <SelectItem value="5">⭐⭐⭐⭐⭐ 5 - Extreme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Safety Restrictions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-orange-600" />
                      Height Requirements
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="minHeight" className="text-sm">
                          Min Height (cm)
                        </Label>
                        <Input
                          id="minHeight"
                          type="number"
                          min="0"
                          value={formData.restrictions.minHeight || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              restrictions: {
                                ...formData.restrictions,
                                minHeight: e.target.value ? Number.parseInt(e.target.value) : undefined,
                              },
                            })
                          }
                          className="border-border/50 focus:border-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxHeight" className="text-sm">
                          Max Height (cm)
                        </Label>
                        <Input
                          id="maxHeight"
                          type="number"
                          min="0"
                          value={formData.restrictions.maxHeight || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              restrictions: {
                                ...formData.restrictions,
                                maxHeight: e.target.value ? Number.parseInt(e.target.value) : undefined,
                              },
                            })
                          }
                          className="border-border/50 focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      Age Requirements
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="minAge" className="text-sm">
                          Min Age
                        </Label>
                        <Input
                          id="minAge"
                          type="number"
                          min="0"
                          value={formData.restrictions.minAge || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              restrictions: {
                                ...formData.restrictions,
                                minAge: e.target.value ? Number.parseInt(e.target.value) : undefined,
                              },
                            })
                          }
                          className="border-border/50 focus:border-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxAge" className="text-sm">
                          Max Age
                        </Label>
                        <Input
                          id="maxAge"
                          type="number"
                          min="0"
                          value={formData.restrictions.maxAge || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              restrictions: {
                                ...formData.restrictions,
                                maxAge: e.target.value ? Number.parseInt(e.target.value) : undefined,
                              },
                            })
                          }
                          className="border-border/50 focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="isPublished" className="text-sm font-medium">
                      Publication Status
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {formData.isPublished ? "Ride will be visible to visitors" : "Ride will be saved as draft"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={formData.isPublished ? "default" : "secondary"}
                      className={`${formData.isPublished ? "bg-green-500" : "bg-orange-500"} text-white`}
                    >
                      {formData.isPublished ? "Published" : "Draft"}
                    </Badge>
                    <Switch
                      id="isPublished"
                      checked={formData.isPublished}
                      onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                      className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600 [&>span]:bg-white [&>span]:border [&>span]:border-gray-200 dark:[&>span]:bg-gray-100 dark:[&>span]:border-gray-400"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {formData.category && (
              <Badge className={`${getCategoryColor(formData.category)} border text-xs`}>{formData.category}</Badge>
            )}
            {formData.thrillLevel > 0 && (
              <span className={`text-xs font-semibold ${getThrillLevelColor(formData.thrillLevel)}`}>
                Thrill: {formData.thrillLevel}/5
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="hover:bg-muted transition-colors bg-transparent"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className="shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {ride ? "Update Ride" : "Create Ride"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
