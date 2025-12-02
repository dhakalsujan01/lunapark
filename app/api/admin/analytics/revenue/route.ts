import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import Order from "@/models/Order"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "daily" // daily, weekly, monthly
    const days = Number.parseInt(searchParams.get("days") || "30")

    await connectDB()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    let groupBy: any
    let dateFormat: string

    switch (period) {
      case "weekly":
        groupBy = {
          year: { $year: "$createdAt" },
          week: { $week: "$createdAt" },
        }
        dateFormat = "Week %V %Y"
        break
      case "monthly":
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        }
        dateFormat = "%B %Y"
        break
      default: // daily
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        }
        dateFormat = "%Y-%m-%d"
    }

    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: "completed",
        },
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: "$amount" },
          orders: { $sum: 1 },
          date: { $first: "$createdAt" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
      {
        $project: {
          date: {
            $dateToString: {
              format: dateFormat,
              date: "$date",
            },
          },
          revenue: 1,
          orders: 1,
        },
      },
    ])

    return NextResponse.json({ data: revenueData })
  } catch (error) {
    console.error("Revenue analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch revenue data" }, { status: 500 })
  }
}
