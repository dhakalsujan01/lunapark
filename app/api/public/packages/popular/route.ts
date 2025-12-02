import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Package from "@/models/Package"

// GET /api/public/packages/popular - Get 3 most popular packages based on purchases
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const limit = Number.parseInt(searchParams.get("limit") || "3")

    // First, try to get packages ordered by purchases (most popular)
    let packages = await Package.find({ isPublished: true })
      .populate("rides", "title price category thrillLevel")
      .select("name description price originalPrice image category analytics promotions validityDays maxUsage")
      .sort({ "analytics.purchases": -1, "analytics.views": -1 })
      .limit(limit)
      .lean()

    // If we don't have enough packages with purchases, fill with random packages
    if (packages.length < limit) {
      const existingIds = packages.map(pkg => pkg._id)
      const additionalPackages = await Package.find({ 
        isPublished: true, 
        _id: { $nin: existingIds } 
      })
        .populate("rides", "title price category thrillLevel")
        .select("name description price originalPrice image category analytics promotions validityDays maxUsage")
        .limit(limit - packages.length)
        .lean()

      packages = [...packages, ...additionalPackages]
    }

    // If still not enough, get any published packages
    if (packages.length < limit) {
      const existingIds = packages.map(pkg => pkg._id)
      const morePackages = await Package.find({ 
        isPublished: true, 
        _id: { $nin: existingIds } 
      })
        .populate("rides", "title price category thrillLevel")
        .select("name description price originalPrice image category analytics promotions validityDays maxUsage")
        .limit(limit - packages.length)
        .lean()

      packages = [...packages, ...morePackages]
    }

    // Shuffle the array to randomize when there are no purchases yet
    if (packages.every(pkg => pkg.analytics?.purchases === 0 || !pkg.analytics?.purchases)) {
      packages = packages.sort(() => Math.random() - 0.5)
    }

    // Calculate savings and format data
    const formattedPackages = packages.slice(0, limit).map(pkg => {
      const savings = pkg.originalPrice ? pkg.originalPrice - pkg.price : 0
      const savingsPercentage = pkg.originalPrice ? Math.round((savings / pkg.originalPrice) * 100) : 0
      
      return {
        ...pkg,
        savings,
        savingsPercentage,
        rideCount: pkg.rides?.length || 0
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        packages: formattedPackages,
        total: formattedPackages.length
      }
    })
  } catch (error) {
    console.error("Error fetching popular packages:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch popular packages" },
      { status: 500 }
    )
  }
}
