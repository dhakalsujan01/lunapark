import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import TicketScanLog from "@/models/TicketScanLog"
import Ticket from "@/models/Ticket"
import Ride from "@/models/Ride"
import Package from "@/models/Package"
import User from "@/models/User"
import { withAuth } from "@/lib/auth-middleware"

// Ensure models are registered
const models = {
  Ticket,
  TicketScanLog,
  Ride,
  Package,
  User
}

// GET /api/checker/scan-history - Get checker's scan history
async function getScanHistory(req: NextRequest, context: any, { session }: any) {
  try {
    await connectDB()
    
    console.log('Scan history API - session user ID:', session.user.id)

    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const skip = (page - 1) * limit

    // PERFORMANCE FIX: Use aggregation pipeline to avoid N+1 queries
    const [scans, total] = await Promise.all([
      models.TicketScanLog.aggregate([
        { $match: { scannedBy: session.user.id } },
        { $sort: { scannedAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        // Lookup ticket information
        {
          $lookup: {
            from: "tickets",
            localField: "ticket",
            foreignField: "_id",
            as: "ticketInfo",
            pipeline: [
              { $project: { user: 1, type: 1, item: 1 } }
            ]
          }
        },
        // Lookup user information
        {
          $lookup: {
            from: "users",
            localField: "ticketInfo.user",
            foreignField: "_id",
            as: "userInfo",
            pipeline: [
              { $project: { name: 1, email: 1 } }
            ]
          }
        },
        // Lookup ride information
        {
          $lookup: {
            from: "rides",
            localField: "ticketInfo.item",
            foreignField: "_id",
            as: "rideInfo",
            pipeline: [
              { $project: { title: 1, name: 1 } }
            ]
          }
        },
        // Lookup package information
        {
          $lookup: {
            from: "packages",
            localField: "ticketInfo.item",
            foreignField: "_id",
            as: "packageInfo",
            pipeline: [
              { $project: { title: 1, name: 1 } }
            ]
          }
        },
        // Project final result
        {
          $project: {
            _id: 1,
            scannedAt: 1,
            ticket: 1,
            success: 1,
            details: 1,
            location: 1,
            userName: {
              $ifNull: [
                { $arrayElemAt: ["$userInfo.name", 0] },
                "Unknown User"
              ]
            },
            itemName: {
              $cond: {
                if: { $eq: [{ $arrayElemAt: ["$ticketInfo.type", 0] }, "ride"] },
                then: {
                  $ifNull: [
                    { $arrayElemAt: ["$rideInfo.title", 0] },
                    { $arrayElemAt: ["$rideInfo.name", 0] },
                    "Unknown Ride"
                  ]
                },
                else: {
                  $ifNull: [
                    { $arrayElemAt: ["$packageInfo.title", 0] },
                    { $arrayElemAt: ["$packageInfo.name", 0] },
                    "Unknown Package"
                  ]
                }
              }
            }
          }
        }
      ]),
      models.TicketScanLog.countDocuments({ scannedBy: session.user.id }),
    ])

    // Format scans for frontend (now with resolved names)
    const formattedScans = scans.map((scan: any) => ({
      id: scan._id?.toString() || "Unknown",
      timestamp: scan.scannedAt,
      ticketId: scan.ticket || "Unknown",
      userName: scan.userName || "Unknown",
      itemName: scan.itemName || "Unknown",
      success: scan.success,
      message: scan.details || (scan.success ? "Valid ticket scanned" : "Invalid ticket"),
      location: scan.location,
    }))

    return NextResponse.json({
      scans: formattedScans,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching scan history:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(getScanHistory, "checker")
