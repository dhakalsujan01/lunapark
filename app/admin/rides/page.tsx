"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Clock, Users, DollarSign, Zap, Filter, Grid3X3, List, Download, Upload } from "lucide-react"
import RideModal from "@/components/admin/ride-modal"
import { Pagination } from "@/components/ui/pagination"
import { getCurrencySymbol } from "@/lib/currency-utils"

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
  createdAt: string
}

export default function RidesPage() {
  const [rides, setRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [itemsPerPage] = useState(20) // Show 20 items per page for admin
  const [selectedRides, setSelectedRides] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchRides()
  }, [])

  async function fetchRides() {
    try {
      const response = await fetch("/api/admin/rides")
      if (response.ok) {
        const data = await response.json()
        setRides(data.rides)
      }
    } catch (error) {
      console.error("Failed to fetch rides:", error)
    } finally {
      setLoading(false)
    }
  }

  async function togglePublish(rideId: string, isPublished: boolean) {
    try {
      const response = await fetch(`/api/admin/rides/${rideId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !isPublished }),
      })

      if (response.ok) {
        fetchRides()
      }
    } catch (error) {
      console.error("Failed to toggle publish:", error)
    }
  }

  async function deleteRide(rideId: string) {
    if (!confirm("Are you sure you want to delete this ride?")) return

    try {
      const response = await fetch(`/api/admin/rides/${rideId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchRides()
      }
    } catch (error) {
      console.error("Failed to delete ride:", error)
    }
  }

  const filteredRides = rides.filter(
    (ride) =>
      ride.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calculate pagination
  const totalPages = Math.ceil(filteredRides.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentRides = filteredRides.slice(startIndex, endIndex)

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  // Bulk operations
  const toggleSelectAll = () => {
    if (selectedRides.size === currentRides.length) {
      setSelectedRides(new Set())
    } else {
      setSelectedRides(new Set(currentRides.map(ride => ride._id)))
    }
  }

  const toggleSelectRide = (rideId: string) => {
    const newSelected = new Set(selectedRides)
    if (newSelected.has(rideId)) {
      newSelected.delete(rideId)
    } else {
      newSelected.add(rideId)
    }
    setSelectedRides(newSelected)
  }

  const bulkPublish = async (publish: boolean) => {
    if (selectedRides.size === 0) return
    
    try {
      const response = await fetch("/api/admin/rides/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          rideIds: Array.from(selectedRides), 
          action: "publish", 
          value: publish 
        }),
      })

      if (response.ok) {
        setSelectedRides(new Set())
        fetchRides()
      }
    } catch (error) {
      console.error("Failed to bulk update:", error)
    }
  }

  const bulkDelete = async () => {
    if (selectedRides.size === 0) return
    
    if (!confirm(`Are you sure you want to delete ${selectedRides.size} rides?`)) return

    try {
      const response = await fetch("/api/admin/rides/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rideIds: Array.from(selectedRides) }),
      })

      if (response.ok) {
        setSelectedRides(new Set())
        fetchRides()
      }
    } catch (error) {
      console.error("Failed to bulk delete:", error)
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground text-balance">Ride Management</h1>
            <p className="text-muted-foreground mt-1">Manage your theme park rides and attractions</p>
          </div>
          <Button
            onClick={() => {
              setSelectedRide(null)
              setIsModalOpen(true)
            }}
            className="shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add New Ride
          </Button>
        </div>

        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search rides by name or category..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 border-0 bg-background/80 focus:bg-background transition-colors"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-background/80 rounded-lg p-1 border">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 px-3 rounded-md"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 px-3 rounded-md"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Bulk Operations Toolbar */}
            {selectedRides.size > 0 && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border/50">
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {selectedRides.size} ride{selectedRides.size !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => bulkPublish(true)}
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Publish All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => bulkPublish(false)}
                      className="text-orange-600 border-orange-200 hover:bg-orange-50"
                    >
                      <EyeOff className="h-4 w-4 mr-2" />
                      Unpublish All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={bulkDelete}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete All
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading rides...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Rides</p>
                      <p className="text-2xl font-bold text-foreground">{rides.length}</p>
                    </div>
                    <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Published</p>
                      <p className="text-2xl font-bold text-foreground">{rides.filter((r) => r.isPublished).length}</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Eye className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Draft</p>
                      <p className="text-2xl font-bold text-foreground">{rides.filter((r) => !r.isPublished).length}</p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <EyeOff className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg. Price</p>
                      <p className="text-2xl font-bold text-foreground">
                        {getCurrencySymbol()}
                        {rides.length > 0
                          ? (rides.reduce((sum, r) => sum + r.price, 0) / rides.length).toFixed(0)
                          : "0"}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results Count and Select All */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
              <div className="text-center sm:text-left">
                <p className="text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredRides.length)} of {filteredRides.length} rides
                </p>
              </div>
              
              {filteredRides.length > 0 && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedRides.size === currentRides.length && currentRides.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                  />
                  <span className="text-sm text-muted-foreground">
                    Select all on this page
                  </span>
                </div>
              )}
            </div>

            <div className={
              viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
                : "space-y-4"
            }>
              {currentRides.map((ride) => (
                <Card
                  key={ride._id}
                  className="group border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card overflow-hidden"
                >
                  {/* Select Checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedRides.has(ride._id)}
                      onChange={() => toggleSelectRide(ride._id)}
                      className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                    />
                  </div>
                  {ride.image && (
                    <div className="h-36 bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
                      <img
                        src={ride.image || "/placeholder.svg"}
                        alt={ride.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge
                          variant={ride.isPublished ? "default" : "secondary"}
                          className={`${ride.isPublished ? "bg-green-500 hover:bg-green-600" : "bg-orange-500 hover:bg-orange-600"} text-white border-0 shadow-sm text-xs`}
                        >
                          {ride.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </div>
                  )}

                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-3">
                      <CardTitle className="text-lg font-semibold text-foreground text-balance leading-tight">
                        {ride.title}
                      </CardTitle>
                      {!ride.image && (
                        <Badge
                          variant={ride.isPublished ? "default" : "secondary"}
                          className={`${ride.isPublished ? "bg-green-500 hover:bg-green-600" : "bg-orange-500 hover:bg-orange-600"} text-white border-0 shrink-0 text-xs`}
                        >
                          {ride.isPublished ? "Published" : "Draft"}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`${getCategoryColor(ride.category)} border text-xs font-medium`}>
                        {ride.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">Thrill:</span>
                        <span className={`text-xs font-semibold ${getThrillLevelColor(ride.thrillLevel)}`}>
                          {ride.thrillLevel}/5
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                      {ride.shortDescription}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 p-1.5 bg-muted/50 rounded-md">
                        <DollarSign className="h-3 w-3 text-green-600" />
                        <div>
                          <span className="text-muted-foreground text-xs">Price</span>
                          <p className="font-semibold text-foreground text-sm">€{ride.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-1.5 bg-muted/50 rounded-md">
                        <Users className="h-3 w-3 text-blue-600" />
                        <div>
                          <span className="text-muted-foreground text-xs">Capacity</span>
                          <p className="font-semibold text-foreground text-sm">{ride.capacity}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-1.5 bg-muted/50 rounded-md">
                        <Clock className="h-3 w-3 text-purple-600" />
                        <div>
                          <span className="text-muted-foreground text-xs">Duration</span>
                          <p className="font-semibold text-foreground text-sm">{ride.duration}m</p>
                        </div>
                      </div>
                      {ride.restrictions?.minHeight && (
                        <div className="flex items-center gap-2 p-1.5 bg-muted/50 rounded-md">
                          <div className="h-3 w-3 bg-orange-600 rounded-sm flex items-center justify-center">
                            <span className="text-white text-xs font-bold">H</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs">Min Height</span>
                            <p className="font-semibold text-foreground text-sm">{ride.restrictions.minHeight}cm</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-border/50">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRide(ride)
                            setIsModalOpen(true)
                          }}
                          className="hover:bg-primary hover:text-primary-foreground transition-colors h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => togglePublish(ride._id, ride.isPublished)}
                          className={`hover:bg-${ride.isPublished ? "orange" : "green"}-500 hover:text-white transition-colors h-8 w-8 p-0`}
                        >
                          {ride.isPublished ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteRide(ride._id)}
                          className="hover:bg-destructive hover:text-destructive-foreground transition-colors h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  className="mb-4"
                />
              </div>
            )}

            {filteredRides.length === 0 && (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">No rides found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first ride"}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        <RideModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          ride={selectedRide}
          onSuccess={fetchRides}
        />
      </div>
    </div>
  )
}
