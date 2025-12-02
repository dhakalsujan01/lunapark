import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth-middleware"
import { monitoring } from "@/lib/monitoring"

// GET /api/admin/monitoring - Get system monitoring data
async function getMonitoringData(req: NextRequest, context: any, { session }: any) {
  try {
    // Update metrics
    await monitoring.updateMetrics()

    // Get health status
    const health = await monitoring.checkSystemHealth()

    // Get metrics
    const metrics = monitoring.getMetrics()

    // Get active alerts
    const alerts = monitoring.getActiveAlerts()

    return NextResponse.json({
      health,
      metrics,
      alerts,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching monitoring data:", error)
    return NextResponse.json({ error: "Failed to fetch monitoring data" }, { status: 500 })
  }
}

// POST /api/admin/monitoring - Resolve alert or trigger health check
async function handleMonitoringAction(req: NextRequest, context: any, { session }: any) {
  try {
    const { action, alertId } = await req.json()

    switch (action) {
      case 'resolve_alert':
        if (!alertId) {
          return NextResponse.json({ error: "Alert ID required" }, { status: 400 })
        }
        
        const resolved = await monitoring.resolveAlert(alertId)
        if (resolved) {
          return NextResponse.json({ message: "Alert resolved successfully" })
        } else {
          return NextResponse.json({ error: "Alert not found" }, { status: 404 })
        }

      case 'health_check':
        const health = await monitoring.checkSystemHealth()
        return NextResponse.json({ health })

      case 'update_metrics':
        await monitoring.updateMetrics()
        const metrics = monitoring.getMetrics()
        return NextResponse.json({ metrics })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error handling monitoring action:", error)
    return NextResponse.json({ error: "Failed to process action" }, { status: 500 })
  }
}

export const GET = withAuth(getMonitoringData, "admin")
export const POST = withAuth(handleMonitoringAction, "admin")
