import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"
import Ticket from "@/models/Ticket"
import User from "@/models/User"
import { withAuth } from "@/lib/auth-middleware"

// GET /api/checkout/session/[sessionId] - Get checkout session and order details
async function getCheckoutSession(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }, { session }: any) {
  try {
    await connectDB()
    
    // Ensure models are registered
    console.log("Models registered:", {
      Order: !!Order,
      Ticket: !!Ticket,
      User: !!User
    })

    const { sessionId } = await params

    // Retrieve the Stripe session
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (!stripeSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Get the order from our database with populated tickets
    console.log("Finding order with session ID:", sessionId)
    const order = await Order.findOne({ stripeSessionId: sessionId })
      .populate("tickets")
      .lean()
    
    if (!order) {
      console.log("No order found for session:", sessionId)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    
    console.log("Found order:", { id: order._id, status: order.status, tickets: order.tickets?.length || 0 })

    // Verify the user owns this order
    if (order.user.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({
      session: stripeSession,
      order: {
        _id: order._id,
        items: order.items,
        totalAmount: order.totalAmount,
        status: order.status,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        paidAt: order.paidAt,
        tickets: order.tickets,
      },
    })
  } catch (error: any) {
    console.error("Error fetching checkout session:", error)
    
    // Handle specific Stripe errors
    if (error.type === 'StripeInvalidRequestError' && error.code === 'resource_missing') {
      return NextResponse.json({ 
        error: "Checkout session not found or expired",
        details: "The session may have expired or was already processed"
      }, { status: 404 })
    }
    
    if (error.type === 'StripeAuthenticationError') {
      return NextResponse.json({ 
        error: "Authentication error with payment provider"
      }, { status: 401 })
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(getCheckoutSession)