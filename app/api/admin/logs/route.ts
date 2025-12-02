import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import ActivityLog from "@/models/ActivityLog"
import SecurityLog from "@/models/SecurityLog"
import TicketScanLog from "@/models/TicketScanLog"
import WebhookLog from "@/models/WebhookLog"
import Order from "@/models/Order"
import { withAuth } from "@/lib/auth-middleware"

// GET /api/admin/logs - Get various system logs
async function getLogs(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || "all"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const skip = (page - 1) * limit

    // Build date filter
    const dateFilter: any = {}
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    let logs: any[] = []
    let total = 0

    switch (type) {
      case "activity":
        [logs, total] = await Promise.all([
          ActivityLog.find(dateFilter)
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
          ActivityLog.countDocuments(dateFilter),
        ])
        break

      case "security":
        [logs, total] = await Promise.all([
          SecurityLog.find(dateFilter)
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
          SecurityLog.countDocuments(dateFilter),
        ])
        break

      case "scan":
        [logs, total] = await Promise.all([
          TicketScanLog.find(dateFilter)
            .populate("scannedBy", "name email")
            .populate({
              path: "ticket",
              populate: {
                path: "user",
                select: "name email"
              }
            })
            .sort({ scannedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
          TicketScanLog.countDocuments(dateFilter),
        ])
        break

      case "webhook":
        [logs, total] = await Promise.all([
          WebhookLog.find(dateFilter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
          WebhookLog.countDocuments(dateFilter),
        ])
        break

      case "payment":
        [logs, total] = await Promise.all([
          Order.find(dateFilter)
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
          Order.countDocuments(dateFilter),
        ])
        break

      case "all":
      default:
        // Get recent logs from all types
        const [activityLogs, securityLogs, scanLogs, webhookLogs, paymentLogs] = await Promise.all([
          ActivityLog.find(dateFilter)
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(),
          SecurityLog.find(dateFilter)
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(),
          TicketScanLog.find(dateFilter)
            .populate("scannedBy", "name email")
            .sort({ scannedAt: -1 })
            .limit(10)
            .lean(),
          WebhookLog.find(dateFilter)
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(),
          Order.find(dateFilter)
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(),
        ])

        // Combine and sort all logs with proper field mapping
        const allLogs = [
          ...activityLogs.map(log => ({ 
            ...log, 
            type: "activity",
            // Map security log fields to common structure
            securityType: undefined,
            email: undefined,
            severity: undefined,
            securityDetails: undefined,
            // Map scan log fields to common structure
            success: undefined,
            details: undefined,
            location: undefined,
            device: undefined,
            scannedBy: undefined,
            scannedAt: undefined,
            // Map webhook log fields to common structure
            webhookType: undefined,
            webhookDetails: undefined,
            // Map payment log fields to common structure
            orderNumber: undefined,
            totalAmount: undefined,
            paymentStatus: undefined
          })),
          ...securityLogs.map(log => ({ 
            ...log, 
            type: "security",
            // Map activity log fields to common structure
            action: undefined,
            resource: undefined,
            method: undefined,
            statusCode: undefined,
            responseTime: undefined,
            user: undefined,
            // Map scan log fields to common structure
            success: undefined,
            details: undefined,
            location: undefined,
            device: undefined,
            scannedBy: undefined,
            scannedAt: undefined,
            // Map webhook log fields to common structure
            webhookType: undefined,
            webhookDetails: undefined,
            // Map payment log fields to common structure
            orderNumber: undefined,
            totalAmount: undefined,
            paymentStatus: undefined
          })),
          ...scanLogs.map(log => ({ 
            ...log, 
            type: "scan", 
            createdAt: log.scannedAt,
            // Map activity log fields to common structure
            action: undefined,
            resource: undefined,
            method: undefined,
            statusCode: undefined,
            responseTime: undefined,
            user: undefined,
            // Map security log fields to common structure
            securityType: undefined,
            email: undefined,
            severity: undefined,
            securityDetails: undefined,
            // Map webhook log fields to common structure
            webhookType: undefined,
            webhookDetails: undefined,
            // Map payment log fields to common structure
            orderNumber: undefined,
            totalAmount: undefined,
            paymentStatus: undefined
          })),
          ...webhookLogs.map(log => ({ 
            ...log, 
            type: "webhook",
            // Map activity log fields to common structure
            action: undefined,
            resource: undefined,
            method: undefined,
            statusCode: undefined,
            responseTime: undefined,
            user: undefined,
            // Map security log fields to common structure
            securityType: undefined,
            email: undefined,
            severity: undefined,
            securityDetails: undefined,
            // Map scan log fields to common structure
            success: undefined,
            details: undefined,
            location: undefined,
            device: undefined,
            scannedBy: undefined,
            scannedAt: undefined,
            // Map payment log fields to common structure
            orderNumber: undefined,
            totalAmount: undefined,
            paymentStatus: undefined
          })),
          ...paymentLogs.map(log => ({ 
            ...log, 
            type: "payment",
            // Map activity log fields to common structure
            action: undefined,
            resource: undefined,
            method: undefined,
            statusCode: undefined,
            responseTime: undefined,
            user: undefined,
            // Map security log fields to common structure
            securityType: undefined,
            email: undefined,
            severity: undefined,
            securityDetails: undefined,
            // Map scan log fields to common structure
            success: undefined,
            details: undefined,
            location: undefined,
            device: undefined,
            scannedBy: undefined,
            scannedAt: undefined,
            // Map webhook log fields to common structure
            webhookType: undefined,
            webhookDetails: undefined
          })),
        ].sort((a, b) => {
          const dateA = new Date((a as any).createdAt || (a as any).scannedAt || 0)
          const dateB = new Date((b as any).createdAt || (b as any).scannedAt || 0)
          return dateB.getTime() - dateA.getTime()
        })

        logs = allLogs.slice(skip, skip + limit)
        total = allLogs.length
        break
    }

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })

  } catch (error) {
    console.error("Error fetching logs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(getLogs, "admin")
