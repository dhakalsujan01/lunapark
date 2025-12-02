import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"
import Ticket from "@/models/Ticket"
import User from "@/models/User"
import Ride from "@/models/Ride"
import Package from "@/models/Package"
import { withAuth } from "@/lib/auth-middleware"

// GET /api/admin/analytics - Get dashboard analytics
async function getAnalytics(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") || "30" // days
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number.parseInt(period))

    // Get basic counts
    const [
      totalRides,
      totalPackages,
      totalUsers,
      totalOrders,
      totalTickets,
      revenueData,
      ticketStatusData,
      popularRides,
      recentOrders,
    ] = await Promise.all([
      Ride.countDocuments({ isPublished: true }),
      Package.countDocuments({ isPublished: true }),
      User.countDocuments({ isActive: true }),
      Order.countDocuments({ status: "paid" }),
      Ticket.countDocuments(),

      // Revenue analytics
      Order.aggregate([
        { $match: { status: "paid", createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            revenue: { $sum: "$totalAmount" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Ticket status breakdown
      Ticket.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      // Popular rides/packages
      Order.aggregate([
        { $match: { status: "paid" } },
        { $unwind: "$items" },
        {
          $group: {
            _id: { item: "$items.item", type: "$items.type", name: "$items.name" },
            totalSold: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
      ]),

      // Recent orders
      Order.find({ status: "paid" })
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ])

    // Calculate total revenue
    const totalRevenue = await Order.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ])

    return NextResponse.json({
      overview: {
        totalRides,
        totalPackages,
        totalUsers,
        totalOrders,
        totalTickets,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      charts: {
        revenue: revenueData,
        ticketStatus: ticketStatusData,
        popularItems: popularRides,
      },
      recentOrders,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(getAnalytics, "admin")
