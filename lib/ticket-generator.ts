import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"
import Ticket from "@/models/Ticket"
import Package from "@/models/Package"
import Ride from "@/models/Ride"

export async function generateTicketsForOrder(orderId: string) {
  await connectDB()
  
  const order = await Order.findById(orderId).populate('items')
  if (!order) {
    throw new Error(`Order not found: ${orderId}`)
  }

  // Prevent duplicate tickets if order was already processed
  const existingTickets = await Ticket.find({ order: orderId })
  if (existingTickets.length > 0) {
    console.log(`Tickets already exist for order ${orderId} (${existingTickets.length} tickets)`)
    // Update order with tickets if missing
    if (order.tickets.length === 0) {
      order.tickets = existingTickets.map(t => t._id)
      await order.save()
    }
    return
  }

  console.log("🎫 ===== GENERATING TICKETS FOR ORDER =====")
  console.log(`📋 Order ID: ${order._id}`)
  console.log(`📋 Order Items Count: ${order.items.length}`)
  
  try {
    const tickets = []

    for (const item of order.items) {
      for (let i = 0; i < item.quantity; i++) {
        let maxUsage = 1
        let itemDetails = null

        if (item.type === "package") {
          itemDetails = await Package.findById(item.item)
        } else if (item.type === "ride") {
          itemDetails = await Ride.findById(item.item)
        }

        let visitDate = new Date()
        if (item.metadata && item.metadata.visitDate) {
          visitDate = new Date(item.metadata.visitDate)
        }
        visitDate.setHours(0, 0, 0, 0)
        
        const validUntil = new Date(visitDate)
        validUntil.setHours(23, 59, 59, 999)

        if (item.type === "package") {
          if (itemDetails && itemDetails.rides && itemDetails.rides.length > 0) {
            const packageRides = await Ride.find({ _id: { $in: itemDetails.rides } })
            
            for (const ride of packageRides) {
              const rideTicket = new Ticket({
                user: order.user,
                order: order._id,
                type: "ride",
                item: ride._id,
                visitDate: visitDate,
                validUntil,
                maxUsage: 1,
                purchasePrice: 0,
                currency: order.currency || "eur",
                metadata: {
                  purchaseChannel: "online",
                  customerNotes: `Part of package: ${itemDetails.name}`,
                  visitDate: visitDate.toISOString(),
                  packageId: item.item,
                  packageName: itemDetails.name,
                }
              })
              
              await rideTicket.save()
              rideTicket.generateQRCode()
              rideTicket.generateSimpleCode()
              await rideTicket.save()
              tickets.push(rideTicket)
            }
          }
        } else {
          const ticket = new Ticket({
            user: order.user,
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
          
          await ticket.save()
          ticket.generateQRCode()
          ticket.generateSimpleCode()
          await ticket.save()
          tickets.push(ticket)
        }
      }
    }

    order.tickets = tickets.map((t) => t._id)
    await order.save()

    try {
      const { sendTicketEmail } = await import("@/lib/email")
      const ticketData = tickets.map(ticket => ({
        id: ticket._id.toString(),
        type: ticket.type,
        itemName: ticket.item?.title || ticket.item?.name || 'Attraction',
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
      } else {
        await Ticket.updateMany(
          { _id: { $in: tickets.map(t => t._id) } },
          { emailSent: false, emailSentAt: null, emailFailedAt: new Date() }
        )
      }
    } catch (emailError) {
      console.error("Failed to send ticket email:", emailError)
    }

  } catch (error) {
    console.error("Error generating tickets:", error)
    await Order.findByIdAndUpdate(orderId, { 
      status: "ticket_generation_failed",
      failureReason: `Ticket generation failed: ${error instanceof Error ? error.message : String(error)}`
    })
    throw error
  }
}
