import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import Order from "@/models/Order"
import User from "@/models/User"
import Ticket from "@/models/Ticket"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "orders"
    const format = searchParams.get("format") || "json"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    await connectDB()

    let data: any[] = []
    const dateFilter: any = {}

    if (startDate) dateFilter.$gte = new Date(startDate)
    if (endDate) dateFilter.$lte = new Date(endDate)

    // PERFORMANCE FIX: Add limits and optimize queries for large datasets
    const maxExportLimit = 10000 // Limit exports to prevent memory issues
    
    switch (type) {
      case "orders":
        data = await Order.find(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {})
          .populate("user", "name email") // Fixed field name from userId to user
          .select("items totalAmount status createdAt paidAt user") // Only select needed fields
          .sort({ createdAt: -1 })
          .limit(maxExportLimit)
          .lean()
        break

      case "users":
        data = await User.find(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {})
          .select("name email role isActive createdAt") // Only select needed fields
          .sort({ createdAt: -1 })
          .limit(maxExportLimit)
          .lean()
        break

      case "tickets":
        data = await Ticket.find(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {})
          .populate("user", "name email") // Fixed field name from userId to user
          .populate("order", "totalAmount") // Fixed field name from orderId to order
          .select("type status validUntil maxUsage currentUsage user order createdAt") // Only select needed fields
          .sort({ createdAt: -1 })
          .limit(maxExportLimit)
          .lean()
        break

      default:
        return NextResponse.json({ error: "Invalid export type" }, { status: 400 })
    }

    if (format === "csv") {
      const csv = convertToCSV(data, type)
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${type}-export-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    return NextResponse.json({
      data,
      total: data.length,
      exportedAt: new Date().toISOString(),
      type,
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}

function convertToCSV(data: any[], type: string): string {
  if (!data.length) return ""

  const headers = Object.keys(data[0]).filter((key) => typeof data[0][key] !== "object" || data[0][key] === null)
  const csvRows = [headers.join(",")]

  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header]
      return typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value
    })
    csvRows.push(values.join(","))
  }

  return csvRows.join("\n")
}
