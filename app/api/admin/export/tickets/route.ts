import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Ticket from "@/models/Ticket"
import { withAuth } from "@/lib/auth-middleware"

// GET /api/admin/export/tickets - Export tickets as CSV
async function exportTickets(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const format = searchParams.get("format") || "csv"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const status = searchParams.get("status")
    const type = searchParams.get("type")

    // Build filter
    const filter: any = {}
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }
    if (status) {
      filter.status = status
    }
    if (type) {
      filter.type = type
    }

    // PERFORMANCE FIX: Add limit and optimize query for large datasets
    const maxExportLimit = 10000 // Limit exports to prevent memory issues
    
    // Fetch tickets with related data
    const tickets = await Ticket.find(filter)
      .populate("user", "name email")
      .populate("order", "totalAmount status")
      .populate("item", "title name")
      .populate("usedBy", "name")
      .select("type status validUntil maxUsage currentUsage user order item usedBy createdAt usedAt") // Only select needed fields
      .sort({ createdAt: -1 })
      .limit(maxExportLimit)
      .lean()

    if (format === "csv") {
      // Generate CSV
      const csvHeaders = [
        "Ticket ID",
        "Customer Name",
        "Customer Email",
        "Type",
        "Item Name",
        "Status",
        "Valid From",
        "Valid Until",
        "Used At",
        "Used By",
        "Scan Location",
        "Current Usage",
        "Max Usage",
        "Order Amount",
        "Created Date"
      ]

      const csvRows = tickets.map(ticket => [
        ticket._id.toString(),
        ticket.user?.name || "N/A",
        ticket.user?.email || "N/A",
        ticket.type,
        ticket.item?.title || ticket.item?.name || "N/A",
        ticket.status,
        new Date(ticket.validFrom).toLocaleDateString(),
        new Date(ticket.validUntil).toLocaleDateString(),
        ticket.usedAt ? new Date(ticket.usedAt).toLocaleDateString() : "N/A",
        ticket.usedBy?.name || "N/A",
        ticket.scanLocation || "N/A",
        ticket.currentUsage,
        ticket.maxUsage,
        ticket.order?.totalAmount ? `€${ticket.order.totalAmount.toFixed(2)}` : "N/A",
        new Date(ticket.createdAt).toLocaleDateString()
      ])

      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map(row => 
          row.map(cell => 
            typeof cell === "string" && cell.includes(",") 
              ? `"${cell.replace(/"/g, '""')}"` 
              : cell
          ).join(",")
        )
      ].join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="tickets-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    // Return JSON format for other uses
    return NextResponse.json({ tickets })

  } catch (error) {
    console.error("Error exporting tickets:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}

export const GET = withAuth(exportTickets, "admin")
