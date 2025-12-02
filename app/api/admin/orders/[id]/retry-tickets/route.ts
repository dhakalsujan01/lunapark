import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"
import Ticket from "@/models/Ticket"
import Ride from "@/models/Ride"
import Package from "@/models/Package"
import { withAuth } from "@/lib/auth-middleware"
import { sendTicketEmail } from "@/lib/email"

// Ticket generation function (copied from webhook logic)
async function generateTicketsForOrderAdmin(order: any) {
  console.log("🎫 ===== GENERATING TICKETS FOR ORDER (ADMIN RETRY) =====")
  const tickets = []

  try {
    for (const item of order.items) {
      console.log(`Processing item: ${item.type} - ${item.name}`)
      
      for (let i = 0; i < item.quantity; i++) {
        let visitDate = new Date()

        // Parse visit date from metadata
        if (item.metadata && item.metadata.visitDate) {
          try {
            visitDate = new Date(item.metadata.visitDate)
            console.log(`Visit date from metadata: ${visitDate.toISOString()}`)
          } catch (error) {
            console.warn(`Invalid visit date in metadata: ${item.metadata.visitDate}`)
            visitDate = new Date()
          }
        }

        // Ensure visit date is set to start of day for consistency
        visitDate.setHours(0, 0, 0, 0)

        if (item.type === "package") {
          // NEW PACKAGE SYSTEM: Create individual ride tickets
          const itemDetails = await Package.findById(item.item)
          if (itemDetails && itemDetails.rides && itemDetails.rides.length > 0) {
            const packageRides = await Ride.find({ _id: { $in: itemDetails.rides } })
            
            for (const ride of packageRides) {
              const validUntil = new Date(visitDate)
              validUntil.setHours(23, 59, 59, 999)

              const rideTicket = new Ticket({
                user: order.user,
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

              console.log(`Creating ride ticket for: ${ride.title} - Package: ${itemDetails.name}`)
              
              await rideTicket.save()
              rideTicket.generateQRCode()
              rideTicket.generateSimpleCode()
              await rideTicket.save()
              tickets.push(rideTicket)
            }
          } else {
            throw new Error(`Package has no rides defined`)
          }
        } else {
          // For individual rides, create a single ticket
          const validUntil = new Date(visitDate)
          validUntil.setHours(23, 59, 59, 999)

          const ticket = new Ticket({
            user: order.user,
            order: order._id,
            type: item.type,
            item: item.item,
            visitDate: visitDate,
            validUntil,
            maxUsage: 1,
            purchasePrice: item.price,
            currency: order.currency || "eur",
            metadata: {
              purchaseChannel: "online",
              customerNotes: "",
              visitDate: visitDate.toISOString(),
            }
          })

          console.log(`Creating ticket for ${item.type}: ${item.name} - Price: €${item.price}`)
          
          await ticket.save()
          ticket.generateQRCode()
          ticket.generateSimpleCode()
          await ticket.save()
          tickets.push(ticket)
        }
      }
    }

    // Update order with ticket references
    console.log(`💾 Updating order with ${tickets.length} ticket references...`)
    order.tickets = tickets.map((t) => t._id)
    await order.save()
    console.log(`✅ Order updated with ticket references`)

    // Send email notification
    console.log(`📧 Sending ticket email notification...`)
    try {
      const ticketData = tickets.map(ticket => ({
        id: ticket._id.toString(),
        type: ticket.type,
        itemName: "Attraction", // Simplified for retry
        visitDate: ticket.visitDate.toISOString(),
        qrCode: ticket.qrCode || '',
        simpleCode: ticket.simpleCode || '',
      }))

      const emailData = {
        customerEmail: order.customerEmail,
        customerName: order.customerName || 'Valued Customer',
        orderNumber: order.orderNumber,
        tickets: ticketData,
        totalAmount: order.totalAmount,
        currency: order.currency || 'eur',
      }

      const emailSent = await sendTicketEmail(emailData)
      
      if (emailSent) {
        await Ticket.updateMany(
          { _id: { $in: tickets.map(t => t._id) } },
          { emailSent: true, emailSentAt: new Date() }
        )
        console.log(`✅ Email sent and tickets marked`)
      }
    } catch (emailError) {
      console.warn(`⚠️ Email sending failed during retry, but tickets were created:`, emailError)
    }

    console.log(`🎉 Generated ${tickets.length} tickets for order ${order._id}`)
    console.log("✅ ===== TICKET GENERATION COMPLETED (ADMIN RETRY) =====")
  } catch (error) {
    console.error("💥 Error in ticket generation:", error)
    throw error
  }
}

// POST /api/admin/orders/[id]/retry-tickets - Retry ticket generation for failed orders
async function retryTicketGeneration(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const { id } = await params
    
    // Find the order
    const order = await Order.findById(id)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if order is in a state where ticket generation can be retried
    if (order.status !== "ticket_generation_failed") {
      return NextResponse.json({ 
        error: "Ticket generation can only be retried for orders with 'ticket_generation_failed' status" 
      }, { status: 400 })
    }

    // Check if tickets already exist
    const existingTickets = await Ticket.find({ order: id })
    if (existingTickets.length > 0) {
      return NextResponse.json({ 
        error: "Tickets already exist for this order. Cannot retry." 
      }, { status: 400 })
    }

    console.log(`🔄 Admin retry: Starting ticket generation for order ${id}...`)
    
    try {
      // Generate tickets using the same logic as webhooks
      await generateTicketsForOrderAdmin(order)
      
      // Update order status back to paid
      await Order.findByIdAndUpdate(id, { 
        status: "paid",
        failureReason: undefined
      })
      
      console.log(`✅ Admin retry: Ticket generation completed for order ${id}`)
      
      return NextResponse.json({ 
        message: "Ticket generation completed successfully",
        orderId: id 
      })
    } catch (ticketError) {
      console.error(`❌ Admin retry: Ticket generation failed again for order ${id}:`, ticketError)
      
      // Keep the failed status but update the failure reason
      await Order.findByIdAndUpdate(id, { 
        failureReason: `Admin retry failed: ${ticketError instanceof Error ? ticketError.message : String(ticketError)}`
      })
      
      return NextResponse.json({ 
        error: "Ticket generation failed again",
        details: ticketError instanceof Error ? ticketError.message : String(ticketError)
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Error retrying ticket generation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const POST = withAuth(retryTicketGeneration, "admin")
