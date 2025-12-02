import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"
import Ticket from "@/models/Ticket"
import { withAuth } from "@/lib/auth-middleware"

// POST /api/orders/[id]/refund - Process refund for an order
async function processRefund(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { reason, amount } = await req.json()

    const order = await Order.findById(params.id)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.status !== "paid") {
      return NextResponse.json({ error: "Order must be paid to process refund" }, { status: 400 })
    }

    if (!order.paymentIntentId) {
      return NextResponse.json({ error: "No payment intent found for this order" }, { status: 400 })
    }

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: order.paymentIntentId,
      amount: amount || order.totalAmount, // Partial or full refund
      reason: reason || "requested_by_customer",
      metadata: {
        orderId: order._id.toString(),
      },
    })

    // Update order status
    order.status = "refunded"
    await order.save()

    // Cancel all associated tickets
    await Ticket.updateMany({ order: order._id }, { status: "cancelled" })

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount,
        status: refund.status,
        reason: refund.reason,
      },
      order: {
        id: order._id,
        status: order.status,
      },
    })
  } catch (error) {
    console.error("Error processing refund:", error)
    return NextResponse.json({ error: "Failed to process refund" }, { status: 500 })
  }
}

export const POST = withAuth(processRefund, "admin")
