import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"
import { withAuth } from "@/lib/auth-middleware"

// GET /api/user/orders/[orderId] - Get specific order for authenticated user
async function getUserOrder(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }, { session }: any) {
  try {
    await connectDB()

    const { orderId } = await params

    const order = await Order.findOne({ 
      _id: orderId,
      user: session.user.id 
    })
      .populate("tickets")
      .lean()

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({
      _id: order._id,
      items: order.items,
      totalAmount: order.totalAmount,
      status: order.status,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      paidAt: order.paidAt,
      tickets: order.tickets || [],
      createdAt: order.createdAt,
    })
  } catch (error) {
    console.error("Error fetching user order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export const GET = withAuth(getUserOrder, "user")
