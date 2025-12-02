import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Ticket from "@/models/Ticket"
import { withAuth } from "@/lib/auth-middleware"

// PUT /api/admin/tickets/[id] - Update ticket status (invalidate/reissue)
async function updateTicket(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { action } = await req.json()

    const ticket = await Ticket.findById(params.id)
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    switch (action) {
      case "invalidate":
        ticket.status = "cancelled"
        break
      case "reissue":
        if (ticket.status === "used" || ticket.status === "expired") {
          ticket.status = "valid"
          ticket.usedAt = undefined
          ticket.usedBy = undefined
          ticket.currentUsage = 0
          // Generate new QR code
          ticket.generateQRCode()
        }
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    await ticket.save()

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error("Error updating ticket:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const PUT = withAuth(updateTicket, "admin")
