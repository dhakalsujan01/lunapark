import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import Order from "@/models/Order"
import Ticket from "@/models/Ticket"
import Ride from "@/models/Ride"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Get current date ranges
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Parallel queries for better performance
    const [
      totalRevenue,
      totalUsers,
      totalTickets,
      totalOrders,
      activeTickets,
      usedTickets,
      monthlyRevenue,
      weeklyRevenue,
      dailyRevenue,
      totalRides,
      publishedRides,
      averageOrderValue,
    ] = await Promise.all([
      Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
      User.countDocuments(),
      Ticket.countDocuments(),
      Order.countDocuments(),
      Ticket.countDocuments({ status: "valid" }),
      Ticket.countDocuments({ status: "used" }),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfWeek } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Ride.countDocuments(),
      Ride.countDocuments({ isPublished: true }),
      Order.aggregate([{ $group: { _id: null, avg: { $avg: "$totalAmount" } } }]),
    ])

    return NextResponse.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      totalUsers,
      totalTickets,
      totalOrders,
      activeTickets,
      usedTickets,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      weeklyRevenue: weeklyRevenue[0]?.total || 0,
      dailyRevenue: dailyRevenue[0]?.total || 0,
      totalRides,
      publishedRides,
      averageOrderValue: averageOrderValue[0]?.avg || 0,
      conversionRate: totalUsers > 0 ? ((totalOrders / totalUsers) * 100).toFixed(2) : 0,
    })
  } catch (error) {
    console.error("Analytics stats error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
