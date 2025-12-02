import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Ride from "@/models/Ride"

export async function PATCH(request: NextRequest) {
  try {
    const { rideIds, action, value } = await request.json()

    if (!rideIds || !Array.isArray(rideIds) || rideIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid ride IDs provided" },
        { status: 400 }
      )
    }

    if (action !== "publish") {
      return NextResponse.json(
        { error: "Invalid action. Only 'publish' is supported" },
        { status: 400 }
      )
    }

    await connectDB()

    const result = await Ride.updateMany(
      { _id: { $in: rideIds } },
      { $set: { isPublished: value } }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "No rides were updated" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: `Successfully ${value ? 'published' : 'unpublished'} ${result.modifiedCount} ride(s)`,
      modifiedCount: result.modifiedCount
    })

  } catch (error) {
    console.error("Bulk update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { rideIds } = await request.json()

    if (!rideIds || !Array.isArray(rideIds) || rideIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid ride IDs provided" },
        { status: 400 }
      )
    }

    await connectDB()

    const result = await Ride.deleteMany({ _id: { $in: rideIds } })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "No rides were deleted" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: `Successfully deleted ${result.deletedCount} ride(s)`,
      deletedCount: result.deletedCount
    })

  } catch (error) {
    console.error("Bulk delete error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
