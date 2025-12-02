import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"
import Ticket from "@/models/Ticket"
import { withAuth } from "@/lib/auth-middleware"

// GET /api/user/orders - Get user's orders
async function getUserOrders(req: NextRequest, context: any, { session }: any) {
  try {
    await connectDB()

    // PERFORMANCE FIX: Add pagination and optimize query
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "20"), 100) // Max 100 per page
    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      Order.find({ user: session.user.id })
        .populate("tickets", "type status validUntil maxUsage currentUsage") // Only populate needed fields
        .select("items totalAmount currency status createdAt paidAt tickets orderNumber") // Include currency and orderNumber
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() for better performance
      Order.countDocuments({ user: session.user.id })
    ])

    return NextResponse.json({
      orders: orders.map(order => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        items: order.items,
        totalAmount: order.totalAmount, // Use correct field name
        currency: order.currency || "eur",
        status: order.status,
        createdAt: order.createdAt,
        paidAt: order.paidAt,
        tickets: order.tickets || [],
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching user orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export const GET = withAuth(getUserOrders, "user")
