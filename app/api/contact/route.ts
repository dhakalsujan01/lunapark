import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Contact from "@/models/Contact"
import nodemailer from "nodemailer"

interface ContactFormData {
  name: string
  email: string
  phone?: string
  subject: string
  category?: string
  message: string
}

// POST /api/contact - Handle contact form submissions
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const data: ContactFormData = await req.json()

    // Validate required fields
    if (!data.name || !data.email || !data.subject || !data.message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || "gmail",
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT || "465"),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    // Email content for admin notification
    const adminEmailHtml = `
      <h2>New Contact Form Submission</h2>
      <p><strong>From:</strong> ${data.name} (${data.email})</p>
      ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ''}
      <p><strong>Category:</strong> ${data.category || 'General Inquiry'}</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p><strong>Message:</strong></p>
      <div style="border-left: 3px solid #ccc; padding-left: 15px; margin: 15px 0;">
        ${data.message.replace(/\n/g, '<br>')}
      </div>
      <hr>
      <p><small>Submitted at: ${new Date().toLocaleString()}</small></p>
    `

    // Email content for customer confirmation
    const customerEmailHtml = `
      <h2>Thank you for contacting Luna Amusement Park!</h2>
      <p>Dear ${data.name},</p>
      <p>We have received your message and will respond within 24 hours.</p>
      
      <h3>Your Message:</h3>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p><strong>Category:</strong> ${data.category || 'General Inquiry'}</p>
      <div style="border-left: 3px solid #ff6b35; padding-left: 15px; margin: 15px 0; background-color: #f9f9f9; padding: 15px;">
        ${data.message.replace(/\n/g, '<br>')}
      </div>
      
      <p>If you have any urgent questions, please call us at (555) 123-4567.</p>
      
      <p>Best regards,<br>
      Luna Amusement Park Team</p>
      
      <hr>
      <p><small>This is an automated confirmation. Please do not reply to this email.</small></p>
    `

    // Send email to admin
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Send to admin email
      subject: `Contact Form: ${data.subject}`,
      html: adminEmailHtml,
      replyTo: data.email,
    })

    // Send confirmation email to customer
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: data.email,
      subject: "Thank you for contacting Luna Amusement Park",
      html: customerEmailHtml,
    })

    // Store in database
    const contact = new Contact({
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      category: data.category || "general",
      message: data.message,
      status: "new",
      priority: "medium",
    })
    await contact.save()

    return NextResponse.json({ 
      success: true, 
      message: "Your message has been sent successfully!" 
    })

  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ 
      error: "Failed to send message. Please try again later." 
    }, { status: 500 })
  }
}
