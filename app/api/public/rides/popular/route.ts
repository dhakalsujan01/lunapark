import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Ride from "@/models/Ride"

// GET /api/public/rides/popular - Get 3 most popular rides based on bookings
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const limit = Number.parseInt(searchParams.get("limit") || "3")

    // First, try to get rides ordered by bookings (most popular)
    let rides = await Ride.find({ isPublished: true })
      .select("title description shortDescription category price image duration capacity thrillLevel analytics")
      .sort({ "analytics.bookings": -1, "analytics.views": -1 })
      .limit(limit)
      .lean()

    // If we don't have enough rides with bookings, fill with random rides
    if (rides.length < limit) {
      const existingIds = rides.map(ride => ride._id)
      const additionalRides = await Ride.find({ 
        isPublished: true, 
        _id: { $nin: existingIds } 
      })
        .select("title description shortDescription category price image duration capacity thrillLevel analytics")
        .limit(limit - rides.length)
        .lean()

      rides = [...rides, ...additionalRides]
    }

    // If still not enough, get any published rides
    if (rides.length < limit) {
      const existingIds = rides.map(ride => ride._id)
      const moreRides = await Ride.find({ 
        isPublished: true, 
        _id: { $nin: existingIds } 
      })
        .select("title description shortDescription category price image duration capacity thrillLevel analytics")
        .limit(limit - rides.length)
        .lean()

      rides = [...rides, ...moreRides]
    }

    // Shuffle the array to randomize when there are no bookings yet
    if (rides.every(ride => ride.analytics?.bookings === 0 || !ride.analytics?.bookings)) {
      rides = rides.sort(() => Math.random() - 0.5)
    }

    return NextResponse.json({
      success: true,
      data: {
        rides: rides.slice(0, limit),
        total: rides.length
      }
    })
  } catch (error) {
    console.error("Error fetching popular rides:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch popular rides" },
      { status: 500 }
    )
  }
}
