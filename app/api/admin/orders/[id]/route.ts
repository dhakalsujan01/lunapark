import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"
import { withAuth } from "@/lib/auth-middleware"

// GET /api/admin/orders/[id] - Get single order
async function getOrder(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const order = await Order.findById(params.id)
      .populate("user", "name email")
      .populate("tickets")
      .lean()

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/admin/orders/[id] - Update order
async function updateOrder(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const data = await req.json()

    const order = await Order.findByIdAndUpdate(
      params.id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
      .populate("user", "name email")
      .populate("tickets")

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(getOrder, "admin")
export const PUT = withAuth(updateOrder, "admin")
