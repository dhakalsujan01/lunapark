import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Package from "@/models/Package"
import { withAuth } from "@/lib/auth-middleware"

// GET /api/admin/packages/[id] - Get package by ID
async function getPackage(req: NextRequest, { params }: { params: Promise<{ id: string }> }, { session }: any) {
  try {
    await connectDB()

    const { id } = await params
    const packageDoc = await Package.findById(id).populate("rides", "title price")

    if (!packageDoc) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    return NextResponse.json({
      package: {
        _id: packageDoc._id,
        name: packageDoc.name,
        description: packageDoc.description,
        price: packageDoc.price,
        rides: packageDoc.rides,
        isPublished: packageDoc.isPublished,
        maxUsage: packageDoc.maxUsage,
        validityDays: packageDoc.validityDays,
        image: packageDoc.image,
        createdAt: packageDoc.createdAt,
        updatedAt: packageDoc.updatedAt,
      }
    })
  } catch (error) {
    console.error("Error fetching package:", error)
    return NextResponse.json({ error: "Failed to fetch package" }, { status: 500 })
  }
}

// PUT /api/admin/packages/[id] - Update package
async function updatePackage(req: NextRequest, { params }: { params: Promise<{ id: string }> }, { session }: any) {
  try {
    await connectDB()

    const { id } = await params
    const updateData = await req.json()

    const packageDoc = await Package.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("rides", "title price")

    if (!packageDoc) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    return NextResponse.json({
      package: {
        _id: packageDoc._id,
        name: packageDoc.name,
        description: packageDoc.description,
        price: packageDoc.price,
        rides: packageDoc.rides,
        isPublished: packageDoc.isPublished,
        maxUsage: packageDoc.maxUsage,
        validityDays: packageDoc.validityDays,
        image: packageDoc.image,
        createdAt: packageDoc.createdAt,
        updatedAt: packageDoc.updatedAt,
      }
    })
  } catch (error) {
    console.error("Error updating package:", error)
    return NextResponse.json({ error: "Failed to update package" }, { status: 500 })
  }
}

// DELETE /api/admin/packages/[id] - Delete package
async function deletePackage(req: NextRequest, { params }: { params: Promise<{ id: string }> }, { session }: any) {
  try {
    await connectDB()

    const { id } = await params
    const packageDoc = await Package.findByIdAndDelete(id)

    if (!packageDoc) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Package deleted successfully" })
  } catch (error) {
    console.error("Error deleting package:", error)
    return NextResponse.json({ error: "Failed to delete package" }, { status: 500 })
  }
}

export const GET = withAuth(getPackage, "admin")
export const PUT = withAuth(updatePackage, "admin")
export const DELETE = withAuth(deletePackage, "admin")