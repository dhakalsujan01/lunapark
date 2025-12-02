import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Package from "@/models/Package"

// GET /api/public/packages - Get all published packages
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category") || ""
    const search = searchParams.get("search") || ""
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const page = Number.parseInt(searchParams.get("page") || "1")

    const skip = (page - 1) * limit

    // Build filter query
    const filter: any = { isPublished: true }
    
    if (category) {
      filter.category = { $regex: category, $options: "i" }
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ]
    }

    // Get packages with populated rides
    const packages = await Package.find(filter)
      .populate("rides")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Get total count for pagination
    const total = await Package.countDocuments(filter)
    const totalPages = Math.ceil(total / limit)

    // Get categories for filtering
    const categories = await Package.distinct("category", { isPublished: true })

    return NextResponse.json({
      success: true,
      data: {
        packages,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        categories,
      },
    })
  } catch (error) {
    console.error("Error fetching packages:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch packages" },
      { status: 500 }
    )
  }
}