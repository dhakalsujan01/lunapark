import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import Order from "@/models/Order"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const popularRides = await Order.aggregate([
      { $match: { status: "completed" } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "rides",
          localField: "items.rideId",
          foreignField: "_id",
          as: "ride",
        },
      },
      { $unwind: "$ride" },
      {
        $group: {
          _id: "$ride._id",
          name: { $first: "$ride.title" },
          bookings: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
        },
      },
      { $sort: { bookings: -1 } },
      { $limit: 10 },
    ])

    return NextResponse.json({ data: popularRides })
  } catch (error) {
    console.error("Popular rides analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch popular rides" }, { status: 500 })
  }
}
