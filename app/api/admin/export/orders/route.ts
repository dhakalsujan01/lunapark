import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"
import { withAuth } from "@/lib/auth-middleware"

// GET /api/admin/export/orders - Export orders as CSV
async function exportOrders(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const format = searchParams.get("format") || "csv"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const status = searchParams.get("status")

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

    // Fetch orders with user details
    const orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("tickets")
      .sort({ createdAt: -1 })
      .lean()

    if (format === "csv") {
      // Generate CSV
      const csvHeaders = [
        "Order ID",
        "Customer Name",
        "Customer Email",
        "Items",
        "Total Amount",
        "Currency",
        "Status",
        "Payment Method",
        "Order Date",
        "Paid Date",
        "Tickets Count"
      ]

      const csvRows = orders.map(order => [
        order._id.toString(),
        order.user?.name || order.customerName,
        order.user?.email || order.customerEmail,
        order.items.map(item => `${item.name} x${item.quantity}`).join("; "),
        order.totalAmount.toFixed(2),
        order.currency.toUpperCase(),
        order.status,
        order.paymentMethod || "N/A",
        new Date(order.createdAt).toLocaleDateString(),
        order.paidAt ? new Date(order.paidAt).toLocaleDateString() : "N/A",
        order.tickets?.length || 0
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
          "Content-Disposition": `attachment; filename="orders-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    // Return JSON format for other uses
    return NextResponse.json({ orders })

  } catch (error) {
    console.error("Error exporting orders:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}

export const GET = withAuth(exportOrders, "admin")
