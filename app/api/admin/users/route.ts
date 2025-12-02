import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import Order from "@/models/Order"
import { withAuth } from "@/lib/auth-middleware"

// GET /api/admin/users - Get all users with stats
async function getUsers(req: NextRequest, context: any, { session }: any) {
  try {
    await connectDB()

    const users = await User.find().select("-password").sort({ createdAt: -1 })

    // Get order stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const orders = await Order.countDocuments({ user: user._id })
        const totalSpentResult = await Order.aggregate([
          { $match: { user: user._id, status: "completed" } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ])
        const totalSpent = totalSpentResult[0]?.total || 0

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          orders,
          totalSpent,
        }
      })
    )

    return NextResponse.json({ users: usersWithStats })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export const GET = withAuth(getUsers, "admin")