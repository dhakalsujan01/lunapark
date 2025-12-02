import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"

// GET /api/health - Health check endpoint
export async function GET() {
  try {
    // Check database connection
    await connectDB()
    
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      services: {
        database: "connected",
        api: "operational"
      }
    })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      services: {
        database: "disconnected",
        api: "operational"
      },
      error: process.env.NODE_ENV === 'development' ? (error as any)?.message : "Service unavailable"
    }, { status: 503 })
  }
}
