import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import TicketScanLog from "@/models/TicketScanLog"
import { withAuth } from "@/lib/auth-middleware"

// GET /api/checker/stats - Get checker's scan statistics
async function getStats(req: NextRequest, context: any, { session }: any) {
  try {
    await connectDB()
    
    console.log('Stats API - session user ID:', session.user.id)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    console.log('Stats API - date range:', { today, tomorrow })

    const [todayScans, successfulScans, failedScans] = await Promise.all([
      // Today's scans
      TicketScanLog.countDocuments({
        scannedBy: session.user.id,
        scannedAt: { $gte: today, $lt: tomorrow },
      }),
      
      // Today's successful scans
      TicketScanLog.countDocuments({
        scannedBy: session.user.id,
        scannedAt: { $gte: today, $lt: tomorrow },
        success: true,
      }),
      
      // Today's failed scans
      TicketScanLog.countDocuments({
        scannedBy: session.user.id,
        scannedAt: { $gte: today, $lt: tomorrow },
        success: false,
      }),
    ])

    return NextResponse.json({
      stats: {
        todayScans,
        successfulScans,
        failedScans,
      },
    })
  } catch (error) {
    console.error("Error fetching checker stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(getStats, "checker")
