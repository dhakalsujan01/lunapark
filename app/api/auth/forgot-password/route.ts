import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import crypto from "crypto"
import nodemailer from "nodemailer"

// POST /api/auth/forgot-password - Send password reset email
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
    
    // Always return success to prevent email enumeration attacks
    // Even if user doesn't exist, we pretend to send an email
    if (!user) {
      return NextResponse.json({ 
        success: true, 
        message: "If an account with that email exists, we've sent password reset instructions." 
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpires = new Date(Date.now() + 3600000) // 1 hour from now

    // Hash the token before storing in database
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    // Save reset token to user
    user.resetPasswordToken = hashedToken
    user.resetPasswordExpires = resetTokenExpires
    await user.save()

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password/${resetToken}`

    // Setup email transporter
    const transporter = nodemailer.createTransporter({
      service: process.env.SMTP_SERVICE || "gmail",
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT || "465"),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    // Email content
    const emailHtml = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background-color: #ff6b35; color: white; text-align: center; padding: 30px;">
          <h1 style="margin: 0; font-size: 28px;">Luna Amusement Park</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Password Reset Request</p>
        </div>
        
        <div style="padding: 40px 30px; background-color: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password for your Luna Amusement Park account. 
            Click the button below to reset your password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #ff6b35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset My Password
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This link will expire in 1 hour for security reasons.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If you didn't request this password reset, you can safely ignore this email. 
            Your password will remain unchanged.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #999; font-size: 14px; margin-bottom: 10px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="color: #666; font-size: 14px; word-break: break-all;">
            ${resetUrl}
          </p>
        </div>
        
        <div style="background-color: #333; color: white; text-align: center; padding: 20px;">
          <p style="margin: 0; font-size: 14px;">
            © 2024 Luna Amusement Park. All rights reserved.
          </p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #ccc;">
            123 Fun Street, Entertainment City, EC 12345
          </p>
        </div>
      </div>
    `

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: "Password Reset - Luna Amusement Park",
      html: emailHtml,
    })

    return NextResponse.json({ 
      success: true, 
      message: "Password reset instructions have been sent to your email." 
    })

  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ 
      error: "Failed to send password reset email. Please try again later." 
    }, { status: 500 })
  }
}
