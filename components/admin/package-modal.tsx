"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { ImageUpload } from "@/components/ui/image-upload"
import { X, Plus, DollarSign, Calendar, Users, ImageIcon, Settings, Ticket, Save, Zap } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

interface Ride {
  _id: string
  title: string
  price: number
  isPublished: boolean
}

interface PackageModalProps {
  isOpen: boolean
  onClose: () => void
  package?: any | null
}

export function PackageModal({ isOpen, onClose, package: initialPackage }: PackageModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    rides: [] as string[],
    rideDetails: [] as Array<{ rideId: string; individualPrice: number }>,
    totalRideCost: 0,
    customPricing: false,
    isPublished: false,
    image: "",
    category: "single" as "single" | "family" | "group" | "season",
  })
  const [availableRides, setAvailableRides] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchRides()
      if (initialPackage) {
        setFormData({
          name: initialPackage.name,
          description: initialPackage.description,
          price: initialPackage.price,
          rides: initialPackage.rides.map((r: any) => r._id),
          rideDetails: initialPackage.rideDetails || [],
          totalRideCost: initialPackage.totalRideCost || 0,
          customPricing: initialPackage.customPricing || false,
          isPublished: initialPackage.isPublished,
          image: initialPackage.image || "",
          category: initialPackage.category || "single",
        })
      } else {
        setFormData({
          name: "",
          description: "",
          price: 0,
          rides: [],
          rideDetails: [],
          totalRideCost: 0,
          customPricing: false,
          isPublished: false,
          image: "",
          category: "single",
        })
      }
    }
  }, [isOpen, initialPackage])

  async function fetchRides() {
    try {
      const response = await fetch("/api/admin/rides")
      if (response.ok) {
        const data = await response.json()
        setAvailableRides(data.rides.filter((ride: any) => ride.isPublished))
      }
    } catch (error) {
      console.error("Failed to fetch rides:", error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const url = initialPackage ? `/api/admin/packages/${initialPackage._id}` : "/api/admin/packages"

      const method = initialPackage ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Package ${initialPackage ? "updated" : "created"} successfully`,
        })
        onClose()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to save package",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to save package:", error)
      toast({
        title: "Error",
        description: "Failed to save package",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function handleRideToggle(rideId: string) {
    setFormData((prev) => {
      const isCurrentlySelected = prev.rides.includes(rideId)
      let newRides: string[]
      let newRideDetails: Array<{ rideId: string; individualPrice: number }>
      
      if (isCurrentlySelected) {
        // Remove ride
        newRides = prev.rides.filter((id) => id !== rideId)
        newRideDetails = prev.rideDetails.filter((detail) => detail.rideId !== rideId)
      } else {
        // Add ride
        const ride = availableRides.find((r) => r._id === rideId)
        newRides = [...prev.rides, rideId]
        newRideDetails = [
          ...prev.rideDetails,
          { rideId, individualPrice: ride?.price || 0 }
        ]
      }
      
      // Calculate total ride cost
      const totalRideCost = newRideDetails.reduce((sum, detail) => sum + detail.individualPrice, 0)
      
      return {
        ...prev,
        rides: newRides,
        rideDetails: newRideDetails,
        totalRideCost,
        // If not using custom pricing, set package price to total ride cost
        price: prev.customPricing ? prev.price : totalRideCost
      }
    })
  }

  function handleInputChange(field: string, value: any) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const selectedRides = availableRides.filter((ride) => formData.rides.includes(ride._id))
  const totalValue = selectedRides.reduce((sum, ride) => sum + ride.price, 0)
  const savings = totalValue - formData.price

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            {initialPackage ? (
              <>
                <Zap className="h-6 w-6 text-primary" />
                Edit Package
              </>
            ) : (
              <>
                <Zap className="h-6 w-6 text-primary" />
                Add New Package
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
                    <Label htmlFor="name" className="text-sm font-medium">
                      Package Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter package name"
                      className="border-border/50 focus:border-primary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium">
                      Category
                    </Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger className="border-border/50 focus:border-primary">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="family">Family</SelectItem>
                        <SelectItem value="group">Group</SelectItem>
                        <SelectItem value="season">Season</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe what makes this package special"
                    rows={3}
                    className="border-border/50 focus:border-primary resize-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image" className="text-sm font-medium">
                    Package Image
                  </Label>
                  <ImageUpload
                    value={formData.image}
                    onChange={(url) => handleInputChange("image", url)}
                    placeholder="Upload package image"
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
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="price" className="text-sm font-medium flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        Package Price (EUR)
                      </Label>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="customPricing" className="text-xs text-muted-foreground">
                          Custom Pricing
                        </Label>
                        <Switch
                          id="customPricing"
                          checked={formData.customPricing}
                          onCheckedChange={(checked) => {
                            setFormData((prev) => ({
                              ...prev,
                              customPricing: checked,
                              price: checked ? prev.price : prev.totalRideCost
                            }))
                          }}
                        />
                      </div>
                    </div>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price || ""}
                      onChange={(e) => handleInputChange("price", e.target.value ? Number.parseFloat(e.target.value) : 0)}
                      className="border-border/50 focus:border-primary"
                      required
                    />
                    {!formData.customPricing && (
                      <p className="text-xs text-muted-foreground">
                        Price automatically set to total ride cost
                      </p>
                    )}
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-2">
                      <div className="text-blue-600 mt-0.5">ℹ️</div>
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Package Behavior:</p>
                        <ul className="text-xs space-y-1 text-blue-700">
                          <li>• Each package generates individual ride tickets</li>
                          <li>• Ride tickets are valid for the selected visit date only</li>
                          <li>• Each ride ticket is single-use (one-time use)</li>
                          <li>• Package is automatically one-time use</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {formData.totalRideCost > 0 && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border/50">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Individual ride total:</span>
                        <span className="font-semibold text-foreground">€{formData.totalRideCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Package price:</span>
                        <span className="font-semibold text-foreground">€{formData.price.toFixed(2)}</span>
                      </div>
                      {formData.price < formData.totalRideCost && (
                        <div className="flex justify-between items-center text-green-600 font-semibold">
                          <span>Customer saves:</span>
                          <span>€{(formData.totalRideCost - formData.price).toFixed(2)}</span>
                        </div>
                      )}
                      {formData.price > formData.totalRideCost && (
                        <div className="flex justify-between items-center text-orange-600 font-semibold">
                          <span>Premium pricing:</span>
                          <span>+€{(formData.price - formData.totalRideCost).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-primary" />
                  Ride Selection
                </CardTitle>
                <p className="text-sm text-muted-foreground">Choose which rides to include in this package</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selected Rides Summary */}
                {formData.rideDetails.length > 0 && (
                  <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          Selected Rides ({formData.rideDetails.length})
                        </span>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          Total: €{formData.totalRideCost.toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {formData.rideDetails.map((rideDetail) => {
                        const ride = availableRides.find((r) => r._id === rideDetail.rideId)
                        return (
                          <div key={rideDetail.rideId} className="flex items-center justify-between p-2 bg-background rounded-md">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{ride?.title || 'Unknown Ride'}</span>
                              <Badge variant="secondary" className="text-xs">
                                €{rideDetail.individualPrice.toFixed(2)}
                              </Badge>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => handleRideToggle(rideDetail.rideId)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Available Rides */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">Available Rides</Label>
                  <div className="max-h-60 overflow-y-auto border border-border/50 rounded-lg">
                    <div className="space-y-1 p-2">
                      {availableRides.map((ride) => (
                        <div
                          key={ride._id}
                          className={`flex items-center justify-between p-3 rounded-md transition-all duration-200 ${
                            formData.rides.includes(ride._id)
                              ? "bg-primary/5 border border-primary/20"
                              : "hover:bg-muted/50 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={formData.rides.includes(ride._id)}
                              onChange={() => handleRideToggle(ride._id)}
                              className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                            />
                            <div>
                              <div className="font-medium text-foreground">{ride.title}</div>
                              <div className="text-sm text-muted-foreground">€{ride.price.toFixed(2)}</div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant={formData.rides.includes(ride._id) ? "destructive" : "outline"}
                            onClick={() => handleRideToggle(ride._id)}
                            className="h-8 w-8 p-0"
                          >
                            {formData.rides.includes(ride._id) ? (
                              <X className="h-4 w-4" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {formData.rides.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-border rounded-lg bg-muted/30">
                    <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="font-medium text-foreground">No rides selected</p>
                    <p className="text-sm text-muted-foreground">Select at least one ride to create a package</p>
                  </div>
                )}
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
                      {formData.isPublished ? "Package will be visible to visitors" : "Package will be saved as draft"}
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
                      onCheckedChange={(checked) => handleInputChange("isPublished", checked)}
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
              <Badge variant="outline" className="text-xs">{formData.category}</Badge>
            )}
            {formData.rides.length > 0 && (
              <span className="text-xs font-semibold text-foreground">
                {formData.rides.length} ride{formData.rides.length !== 1 ? 's' : ''} selected
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
              disabled={loading || formData.rides.length === 0}
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
                  {initialPackage ? "Update Package" : "Create Package"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
