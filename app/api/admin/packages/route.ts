import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Package from "@/models/Package"
import { withAuth } from "@/lib/auth-middleware"

// GET /api/admin/packages - Get all packages
async function getPackages(req: NextRequest, context: any, { session }: any) {
  try {
    await connectDB()

    const packages = await Package.find()
      .populate("rides", "title price")
      .sort({ createdAt: -1 })

    return NextResponse.json({
      packages: packages.map(pkg => ({
        _id: pkg._id,
        name: pkg.name,
        description: pkg.description,
        price: pkg.price,
        rides: pkg.rides,
        isPublished: pkg.isPublished,
        totalRideCost: pkg.totalRideCost,
        customPricing: pkg.customPricing,
        rideDetails: pkg.rideDetails,
        image: pkg.image,
        createdAt: pkg.createdAt,
        updatedAt: pkg.updatedAt,
      }))
    })
  } catch (error) {
    console.error("Error fetching packages:", error)
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 })
  }
}

// POST /api/admin/packages - Create package
async function createPackage(req: NextRequest, context: any, { session }: any) {
  try {
    await connectDB()

    const { name, description, price, rides, rideDetails, totalRideCost, customPricing, isPublished, image, category } = await req.json()

    if (!name || !description || price === undefined || !rides || rides.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate rideDetails if provided
    if (rideDetails && (!Array.isArray(rideDetails) || rideDetails.length !== rides.length)) {
      return NextResponse.json({ error: "rideDetails must match rides array length" }, { status: 400 })
    }

    const packageDoc = new Package({
      name,
      description,
      price,
      rides,
      rideDetails: rideDetails || [],
      totalRideCost: totalRideCost || 0,
      customPricing: customPricing || false,
      isPublished: isPublished || false,
      image: image || "/placeholder-package.jpg",
      category: category || "single",
    })

    await packageDoc.save()
    await packageDoc.populate("rides", "title price")

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
    console.error("Error creating package:", error)
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 })
  }
}

export const GET = withAuth(getPackages, "admin")
export const POST = withAuth(createPackage, "admin")