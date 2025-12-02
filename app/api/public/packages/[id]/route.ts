import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Package from "@/models/Package"

// GET /api/public/packages/[id] - Get a specific package by ID
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
        { success: false, error: "Invalid package ID" },
        { status: 400 }
      )
    }

    const packageDoc = await Package.findById(id)
      .populate("rides")
      .lean() as any

    if (!packageDoc) {
      return NextResponse.json(
        { success: false, error: "Package not found" },
        { status: 404 }
      )
    }

    // Check if package is published
    if (!packageDoc.isPublished) {
      return NextResponse.json(
        { success: false, error: "Package not available" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...packageDoc,
        _id: packageDoc._id.toString(),
        rides: packageDoc.rides.map((ride: any) => ({
          ...ride,
          _id: ride._id.toString(),
        })),
      },
    })
  } catch (error) {
    console.error("Error fetching package:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch package" },
      { status: 500 }
    )
  }
}
