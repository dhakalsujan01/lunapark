import { NextRequest, NextResponse } from "next/server"

// Simple test endpoint to verify webhook connectivity
export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const headers = Object.fromEntries(req.headers.entries())
    
    console.log("🧪 Test webhook received:")
    console.log("Headers:", headers)
    console.log("Body:", body.substring(0, 200) + "...")
    
    return NextResponse.json({ 
      status: "received", 
      timestamp: new Date().toISOString(),
      bodyLength: body.length 
    })
  } catch (error) {
    console.error("Test webhook error:", error)
    return NextResponse.json({ error: "Test webhook failed" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "Test webhook endpoint is active",
    timestamp: new Date().toISOString()
  })
}
