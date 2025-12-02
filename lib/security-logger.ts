import SecurityLog from "@/models/SecurityLog"
import TicketScanLog from "@/models/TicketScanLog"
import WebhookLog from "@/models/WebhookLog"
import ActivityLog from "@/models/ActivityLog"
import User from "@/models/User"
import { connectDB } from "@/lib/mongodb"

export class SecurityLogger {
  static async logSecurityEvent(data: {
    type: "login_success" | "login_failed" | "password_reset" | "account_locked" | "role_changed" | "account_suspended"
    userId?: string
    email: string
    ipAddress: string
    userAgent: string
    details?: any
    severity?: "low" | "medium" | "high" | "critical"
  }) {
    try {
      await connectDB()

      const log = new SecurityLog({
        type: data.type,
        userId: data.userId,
        email: data.email,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        details: data.details,
        severity: data.severity || "low",
      })

      await log.save()
      return log
    } catch (error) {
      console.error("Failed to log security event:", error)
    }
  }

  static async logTicketScan(data: {
    ticketId: string
    scannedBy: string
    scanResult: "valid" | "invalid" | "expired" | "already_used" | "cancelled"
    location?: string
    device?: string
    ipAddress: string
    qrCode: string
    errorMessage?: string
  }) {
    try {
      await connectDB()

      const log = new TicketScanLog(data)
      await log.save()
      return log
    } catch (error) {
      console.error("Failed to log ticket scan:", error)
    }
  }

  static async logWebhookEvent(data: {
    provider: "stripe" | "paypal" | "other"
    eventType: string
    eventId: string
    status: "success" | "failed" | "pending" | "retry"
    httpStatus: number
    payload: any
    response?: any
    errorMessage?: string
    processingTime: number
    retryCount?: number
    ipAddress: string
    signature?: string
    signatureValid: boolean
  }) {
    try {
      await connectDB()

      const log = new WebhookLog({
        ...data,
        retryCount: data.retryCount || 0,
      })

      await log.save()
      return log
    } catch (error) {
      console.error("Failed to log webhook event:", error)
    }
  }

  static async logActivity(data: {
    userId: string
    action: string
    resource: string
    resourceId?: string
    details?: any
    ipAddress: string
    userAgent: string
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
    endpoint: string
    statusCode: number
    responseTime: number
  }) {
    try {
      await connectDB()

      const log = new ActivityLog(data)
      await log.save()
      return log
    } catch (error) {
      console.error("Failed to log activity:", error)
    }
  }

  static async getSecurityLogs(
    filters: {
      type?: string
      userId?: string
      email?: string
      severity?: string
      startDate?: Date
      endDate?: Date
      limit?: number
      page?: number
    } = {},
  ) {
    try {
      await connectDB()

      const query: any = {}

      if (filters.type) query.type = filters.type
      if (filters.userId) query.userId = filters.userId
      if (filters.email) query.email = new RegExp(filters.email, "i")
      if (filters.severity) query.severity = filters.severity

      if (filters.startDate || filters.endDate) {
        query.createdAt = {}
        if (filters.startDate) query.createdAt.$gte = filters.startDate
        if (filters.endDate) query.createdAt.$lte = filters.endDate
      }

      const limit = filters.limit || 50
      const page = filters.page || 1
      const skip = (page - 1) * limit

      const logs = await SecurityLog.find(query)
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)

      const total = await SecurityLog.countDocuments(query)

      return {
        logs,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      }
    } catch (error) {
      console.error("Failed to get security logs:", error)
      return { logs: [], pagination: { total: 0, page: 1, pages: 0, limit: 50 } }
    }
  }
}
