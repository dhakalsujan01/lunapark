import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Ticket from "@/models/Ticket"
import User from "@/models/User" // Import User model
import { withAuth } from "@/lib/auth-middleware"

// GET /api/admin/tickets - Get all tickets with filtering
async function getTickets(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") || ""
    const type = searchParams.get("type") || ""
    const search = searchParams.get("search") || ""

    const skip = (page - 1) * limit

    const filter: any = {}
    if (status) filter.status = status
    if (type) filter.type = type
    if (search) {
      // Search by user email or name
      const users = await User.find({
        $or: [{ email: { $regex: search, $options: "i" } }, { name: { $regex: search, $options: "i" } }],
      }).select("_id")

      if (users.length > 0) {
        filter.user = { $in: users.map((u) => u._id) }
      }
    }

    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .populate("user", "name email")
        .populate("order", "totalAmount status")
        .populate("item")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Ticket.countDocuments(filter),
    ])

    return NextResponse.json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching tickets:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(getTickets, "admin")
