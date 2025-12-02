import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Ride from "@/models/Ride"

// GET /api/public/attractions/[id] - Get a specific attraction by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

    // Validate ID format
    if (!id || id.length !== 24) {
      return NextResponse.json(
        { success: false, error: "Invalid attraction ID" },
        { status: 400 }
      )
    }

    const attraction = await Ride.findById(id).lean() as any

    if (!attraction) {
      return NextResponse.json(
        { success: false, error: "Attraction not found" },
        { status: 404 }
      )
    }

    // Check if attraction is published
    if (!attraction.isPublished) {
      return NextResponse.json(
        { success: false, error: "Attraction not available" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...attraction,
        _id: attraction._id.toString(),
      },
    })
  } catch (error) {
    console.error("Error fetching attraction:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch attraction" },
      { status: 500 }
    )
  }
}
