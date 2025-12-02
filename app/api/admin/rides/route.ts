import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Ride from "@/models/Ride"
import { withAuth } from "@/lib/auth-middleware"

// GET /api/admin/rides - Get all rides with pagination and filtering
async function getRides(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const published = searchParams.get("published")

    const skip = (page - 1) * limit

    // Build filter query
    const filter: any = {}
    if (search) {
      filter.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }
    if (category) filter.category = category
    if (published !== null && published !== "") {
      filter.isPublished = published === "true"
    }

    const [rides, total] = await Promise.all([
      Ride.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
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
    console.error("Error fetching rides:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/admin/rides - Create new ride
async function createRide(req: NextRequest) {
  try {
    await connectDB()

    const data = await req.json()

    // Validate required fields
    const requiredFields = [
      "title",
      "description",
      "shortDescription",
      "price",
      "image",
      "category",
      "duration",
      "capacity",
      "thrillLevel",
    ]
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    const ride = new Ride(data)
    await ride.save()

    return NextResponse.json({ ride }, { status: 201 })
  } catch (error) {
    console.error("Error creating ride:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(getRides, "admin")
export const POST = withAuth(createRide, "admin")
