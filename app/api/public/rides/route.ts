import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Ride from "@/models/Ride"

// GET /api/public/rides - Get published rides for public viewing
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const page = Number.parseInt(searchParams.get("page") || "1")

    const skip = (page - 1) * limit

    const filter: any = { isPublished: true }
    if (category) {
      filter.category = category
    }

    const [rides, total] = await Promise.all([
      Ride.find(filter)
        .select("title description shortDescription category price image restrictions duration capacity thrillLevel")
        .sort({ thrillLevel: -1, title: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Ride.countDocuments(filter),
    ])

    return NextResponse.json({
      rides,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching public rides:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}