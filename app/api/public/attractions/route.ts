import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Ride from "@/models/Ride"

// GET /api/public/attractions - Get all published attractions
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category") || ""
    const thrillLevel = searchParams.get("thrillLevel") || ""
    const search = searchParams.get("search") || ""
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const page = Number.parseInt(searchParams.get("page") || "1")

    const skip = (page - 1) * limit

    // Build filter query
    const filter: any = { isPublished: true }
    
    if (category) {
      filter.category = { $regex: category, $options: "i" }
    }
    
    if (thrillLevel) {
      filter.thrillLevel = Number.parseInt(thrillLevel)
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ]
    }

    // Get attractions with pagination
    const attractions = await Ride.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Get total count for pagination
    const total = await Ride.countDocuments(filter)
    const totalPages = Math.ceil(total / limit)

    // Get categories for filtering
    const categories = await Ride.distinct("category", { isPublished: true })

    return NextResponse.json({
      success: true,
      data: {
        attractions,
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
    console.error("Error fetching attractions:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch attractions" },
      { status: 500 }
    )
  }
}
