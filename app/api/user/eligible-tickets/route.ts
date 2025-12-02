import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Ticket from "@/models/Ticket"
import Testimonial from "@/models/Testimonial"
import Ride from "@/models/Ride"
import Package from "@/models/Package"
import { withAuth } from "@/lib/auth-middleware"

// GET /api/user/eligible-tickets - Get user's tickets eligible for testimonials
async function getEligibleTickets(req: NextRequest, context: any, { session }: any) {
  try {
    await connectDB()

    // Find all used tickets for the user
    const usedTickets = await Ticket.find({
      user: session.user.id,
      status: "used",
    })
      .populate("order")
      .sort({ usedAt: -1 })

    // Get ticket IDs that already have testimonials
    const existingTestimonials = await Testimonial.find({
      user: session.user.id,
      ticket: { $in: usedTickets.map(t => t._id) },
    }).select("ticket")

    const testimonialTicketIds = new Set(
      existingTestimonials.map(t => t.ticket.toString())
    )

    // Filter out tickets that already have testimonials
    const eligibleTickets = usedTickets.filter(
      ticket => !testimonialTicketIds.has(ticket._id.toString())
    )

    // Populate with ride/package details
    const ticketsWithDetails = await Promise.all(
      eligibleTickets.map(async (ticket) => {
        let itemDetails = null
        
        if (ticket.type === "ride") {
          itemDetails = await Ride.findById(ticket.item).select("name description")
        } else {
          itemDetails = await Package.findById(ticket.item).select("name description")
        }

        return {
          _id: ticket._id,
          type: ticket.type,
          usedAt: ticket.usedAt,
          scanLocation: ticket.scanLocation,
          item: itemDetails,
          order: {
            _id: ticket.order._id,
            customerName: ticket.order.customerName,
            paidAt: ticket.order.paidAt,
          },
        }
      })
    )

    return NextResponse.json({
      tickets: ticketsWithDetails,
      total: ticketsWithDetails.length,
    })
  } catch (error) {
    console.error("Error fetching eligible tickets:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export const GET = withAuth(getEligibleTickets, { requireAuth: true })
