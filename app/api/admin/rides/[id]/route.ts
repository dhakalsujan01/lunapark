import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Ride from "@/models/Ride"
import { withAuth } from "@/lib/auth-middleware"

// GET /api/admin/rides/[id] - Get single ride
async function getRide(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const { id } = await params
    const ride = await Ride.findById(id)
    if (!ride) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 })
    }

    return NextResponse.json({ ride })
  } catch (error) {
    console.error("Error fetching ride:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/admin/rides/[id] - Update ride
async function updateRide(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const { id } = await params
    const data = await req.json()

    const ride = await Ride.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true },
    )

    if (!ride) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 })
    }

    return NextResponse.json({ ride })
  } catch (error) {
    console.error("Error updating ride:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH /api/admin/rides/[id] - Partial update ride (for toggling publish status, etc.)
async function patchRide(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const { id } = await params
    const data = await req.json()

    const ride = await Ride.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true },
    )

    if (!ride) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 })
    }

    return NextResponse.json({ ride })
  } catch (error) {
    console.error("Error patching ride:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/admin/rides/[id] - Delete ride
async function deleteRide(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const { id } = await params
    const ride = await Ride.findByIdAndDelete(id)
    if (!ride) {
      return NextResponse.json({ error: "Ride not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Ride deleted successfully" })
  } catch (error) {
    console.error("Error deleting ride:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(getRide, "admin")
export const PUT = withAuth(updateRide, "admin")
export const PATCH = withAuth(patchRide, "admin")
export const DELETE = withAuth(deleteRide, "admin")
