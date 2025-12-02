import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Ticket from "@/models/Ticket"
import Order from "@/models/Order"
import Package from "@/models/Package"
import Ride from "@/models/Ride"
import User from "@/models/User"
import { withAuth } from "@/lib/auth-middleware"
import mongoose from "mongoose"

// POST /api/tickets/generate - Generate tickets for paid order
async function generateTickets(req: NextRequest, context: any, { session: userSession }: any) {
  try {
    await connectDB()

    const { orderId } = await req.json()

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    // Find the order
    const order = await Order.findById(orderId).populate("user")
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if order belongs to user (unless admin)
    if (userSession.user.role !== "admin" && order.user._id.toString() !== userSession.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if order is paid
    if (order.status !== "paid") {
      return NextResponse.json({ error: "Order must be paid to generate tickets" }, { status: 400 })
    }

    // SECURITY: Atomic check and create to prevent race conditions
    // Use MongoDB transaction for atomic operations
    const mongoSession = await mongoose.startSession()
    
    try {
      await mongoSession.withTransaction(async () => {
        // Double-check within transaction to prevent race conditions
        const existingTickets = await Ticket.find({ order: orderId }).session(mongoSession)
        if (existingTickets.length > 0) {
          throw new Error("Tickets already generated for this order")
        }
        
        // Generate tickets within the transaction
        await generateTicketsInTransaction(order, mongoSession)
      })
    } finally {
      await mongoSession.endSession()
    }

    return NextResponse.json({
      success: true,
      message: "Tickets generated successfully",
    })
  } catch (error) {
    console.error("Error generating tickets:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Transaction-safe ticket generation function - UPDATED FOR NEW PACKAGE SYSTEM
async function generateTicketsInTransaction(order: any, mongoSession: any) {
  const tickets = []

  // Generate tickets for each item in the order
  for (const item of order.items) {
    for (let i = 0; i < item.quantity; i++) {
      let maxUsage = 1
      let itemDetails = null

      // Get item details for usage rules
      if (item.type === "package") {
        itemDetails = await Package.findById(item.item).session(mongoSession)
        if (itemDetails) {
          // NEW PACKAGE SYSTEM: Create individual ride tickets
          if (itemDetails.rides && itemDetails.rides.length > 0) {
            const packageRides = await Ride.find({ _id: { $in: itemDetails.rides } }).session(mongoSession)
            
            for (const ride of packageRides) {
              // Use visitDate from order item metadata when available
              let visitDate = new Date()
              if (item.metadata && item.metadata.visitDate) {
                try {
                  visitDate = new Date(item.metadata.visitDate)
                } catch {}
              }
              visitDate.setHours(0, 0, 0, 0)
              
              const validUntil = new Date(visitDate)
              validUntil.setHours(23, 59, 59, 999)

              const rideTicket = new Ticket({
                user: order.user._id,
                order: order._id,
                type: "ride", // Individual ride ticket
                item: ride._id,
                visitDate: visitDate,
                validUntil,
                maxUsage: 1, // Each ride ticket is single use
                purchasePrice: 0, // Individual ride tickets are free (paid via package)
                currency: order.currency || "eur",
                metadata: {
                  purchaseChannel: "online",
                  customerNotes: `Part of package: ${itemDetails.name}`,
                  visitDate: visitDate.toISOString(),
                  packageId: item.item,
                  packageName: itemDetails.name,
                }
              })

              await rideTicket.save({ session: mongoSession })
              rideTicket.generateQRCode()
              rideTicket.generateSimpleCode()
              await rideTicket.save({ session: mongoSession })
              tickets.push(rideTicket)
            }
          } else {
            throw new Error(`Package has no rides defined`)
          }
        }
      } else {
        // For individual rides, create a single ticket
        itemDetails = await Ride.findById(item.item).session(mongoSession)
        maxUsage = 1 // Single ride usage

        // Use visitDate from order item metadata when available
        let visitDate = new Date()
        if (item.metadata && item.metadata.visitDate) {
          try {
            visitDate = new Date(item.metadata.visitDate)
          } catch {}
        }
        visitDate.setHours(0, 0, 0, 0)
        
        const validUntil = new Date(visitDate)
        validUntil.setHours(23, 59, 59, 999)

        const ticket = new Ticket({
          user: order.user._id,
          order: order._id,
          type: item.type,
          item: item.item,
          visitDate: visitDate,
          validUntil,
          maxUsage,
          purchasePrice: item.price,
          currency: order.currency || "eur",
          metadata: {
            purchaseChannel: "online",
            customerNotes: itemDetails?.description || "",
            visitDate: visitDate.toISOString(),
          }
        })

        await ticket.save({ session: mongoSession })
        ticket.generateQRCode()
        ticket.generateSimpleCode()
        await ticket.save({ session: mongoSession })
        tickets.push(ticket)
      }
    }
  }

  // Update order with ticket references
  order.tickets = tickets.map((t) => t._id)
  await order.save({ session: mongoSession })

  return tickets
}

export const POST = withAuth(generateTickets)
