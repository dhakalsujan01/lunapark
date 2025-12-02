import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import crypto from "crypto"

// GET /api/auth/verify-reset-token/[token] - Verify if reset token is valid
export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    await connectDB()

    const { token } = params

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // Hash the token to match stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }, // Token not expired
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    return NextResponse.json({ valid: true })

  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
