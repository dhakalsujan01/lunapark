"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Plus,
  Edit,
  Trash2,
  Search,
  PackageIcon,
  Eye,
  EyeOff,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
} from "lucide-react"
import { PackageModal } from "@/components/admin/package-modal"
import { toast } from "@/components/ui/use-toast"

interface Package {
  _id: string
  name: string
  description: string
  price: number
  rides: Array<{
    _id: string
    title: string
  }>
  isPublished: boolean
  maxUsage: number
  validityDays: number
  image?: string
  createdAt: string
  updatedAt: string
}

const PackageCard = ({
  pkg,
  togglePublished,
  handleEdit,
  handleDelete,
}: {
  pkg: Package
  togglePublished: (packageId: string, isPublished: boolean) => void
  handleEdit: (pkg: Package) => void
  handleDelete: (packageId: string) => void
}) => (
  <Card className="group border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card overflow-hidden">
    <CardHeader className="pb-2">
      <div className="flex justify-between items-start gap-3">
        <CardTitle className="text-lg font-semibold text-foreground text-balance leading-tight">
          {pkg.name}
        </CardTitle>
        <Badge
          variant={pkg.isPublished ? "default" : "secondary"}
          className={`${pkg.isPublished ? "bg-green-500 hover:bg-green-600" : "bg-orange-500 hover:bg-orange-600"} text-white border-0 shrink-0 text-xs`}
        >
          {pkg.isPublished ? "Published" : "Draft"}
        </Badge>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">Rides:</span>
          <span className="text-xs font-semibold text-foreground">
            {pkg.rides.length}
          </span>
        </div>
      </div>
    </CardHeader>

    <CardContent className="space-y-4">
      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
        {pkg.description}
      </p>

      <div className="flex items-center gap-2 p-1.5 bg-muted/50 rounded-md">
        <DollarSign className="h-3 w-3 text-green-600" />
        <div>
          <span className="text-muted-foreground text-xs">Price</span>
          <p className="font-semibold text-foreground text-sm">€{(pkg.price || 0).toFixed(2)}</p>
        </div>
      </div>
      
      <div className="p-2 bg-blue-50 rounded-md border border-blue-200">
        <div className="text-xs text-blue-800">
          <p className="font-medium">📦 Package Behavior:</p>
          <p className="text-blue-700">Generates individual ride tickets for selected visit date</p>
        </div>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-border/50">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(pkg)}
            className="hover:bg-primary hover:text-primary-foreground transition-colors h-8 w-8 p-0"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => togglePublished(pkg._id, pkg.isPublished)}
            className={`hover:bg-${pkg.isPublished ? "orange" : "green"}-500 hover:text-white transition-colors h-8 w-8 p-0`}
          >
            {pkg.isPublished ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDelete(pkg._id)}
            className="hover:bg-destructive hover:text-destructive-foreground transition-colors h-8 w-8 p-0"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
)

export default function AdminPackages() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchPackages()
  }, [])

  async function fetchPackages() {
    try {
      const response = await fetch("/api/admin/packages")
      if (response.ok) {
        const data = await response.json()
        setPackages(data.packages)
      }
    } catch (error) {
      console.error("Failed to fetch packages:", error)
      toast({
        title: "Error",
        description: "Failed to fetch packages",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(packageId: string) {
    if (!confirm("Are you sure you want to delete this package?")) return

    try {
      const response = await fetch(`/api/admin/packages/${packageId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setPackages(packages.filter((pkg) => pkg._id !== packageId))
        toast({
          title: "Success",
          description: "Package deleted successfully",
        })
      }
    } catch (error) {
      console.error("Failed to delete package:", error)
      toast({
        title: "Error",
        description: "Failed to delete package",
        variant: "destructive",
      })
    }
  }

  async function togglePublished(packageId: string, isPublished: boolean) {
    try {
      const response = await fetch(`/api/admin/packages/${packageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !isPublished }),
      })

      if (response.ok) {
        setPackages(packages.map((pkg) => (pkg._id === packageId ? { ...pkg, isPublished: !isPublished } : pkg)))
        toast({
          title: "Success",
          description: `Package ${!isPublished ? "published" : "unpublished"} successfully`,
        })
      }
    } catch (error) {
      console.error("Failed to toggle package status:", error)
      toast({
        title: "Error",
        description: "Failed to update package status",
        variant: "destructive",
      })
    }
  }

  function handleEdit(pkg: Package) {
    setSelectedPackage(pkg)
    setIsModalOpen(true)
  }

  function handleCreate() {
    setSelectedPackage(null)
    setIsModalOpen(true)
  }

  function handleModalClose() {
    setIsModalOpen(false)
    setSelectedPackage(null)
    fetchPackages()
  }

  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground text-balance">Package Management</h1>
            <p className="text-muted-foreground mt-1">Create and manage ticket packages for your theme park</p>
          </div>
          <Button
            onClick={handleCreate}
            className="shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add New Package
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Packages</p>
                  <p className="text-2xl font-bold text-foreground">{packages.length}</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <PackageIcon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold text-foreground">{packages.filter((pkg) => pkg.isPublished).length}</p>
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
                  <p className="text-2xl font-bold text-foreground">{packages.filter((pkg) => !pkg.isPublished).length}</p>
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
                    $
                    {packages.length > 0
                      ? (packages.reduce((sum, pkg) => sum + (pkg.price || 0), 0) / packages.length).toFixed(0)
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

        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search packages by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-0 bg-background/80 focus:bg-background transition-colors"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading packages...</p>
            </div>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto space-y-4">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No packages found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first package"}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => (
              <PackageCard
                key={pkg._id}
                pkg={pkg}
                togglePublished={togglePublished}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Package Modal */}
        <PackageModal isOpen={isModalOpen} onClose={handleModalClose} package={selectedPackage} />
      </div>
    </div>
  )
}
