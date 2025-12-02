import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Testimonial from "@/models/Testimonial"
import Ticket from "@/models/Ticket"
import Order from "@/models/Order"
import Ride from "@/models/Ride"
import Package from "@/models/Package"
import User from "@/models/User"
import { withAuth } from "@/lib/auth-middleware"

// GET /api/testimonials - Get approved testimonials for public display
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "10")
    const page = parseInt(searchParams.get("page") || "1")
    const rating = searchParams.get("rating")

    const query: any = { status: "approved" }
    if (rating) {
      query.rating = parseInt(rating)
    }

    const testimonials = await Testimonial.find(query)
      .populate("user", "name")
      .sort({ approvedAt: -1, createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()

    const total = await Testimonial.countDocuments(query)

    return NextResponse.json({
      testimonials,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/testimonials - Create new testimonial (authenticated users only)
async function createTestimonial(req: NextRequest, context: any, { session }: any) {
  try {
    await connectDB()

    const { ticketId, rating, title, content } = await req.json()

    // Validate input
    if (!ticketId || !rating || !title || !content) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    if (title.length > 100 || content.length > 1000) {
      return NextResponse.json(
        { error: "Title or content too long" },
        { status: 400 }
      )
    }

    // Find and validate ticket
    const ticket = await Ticket.findById(ticketId)
      .populate("order")
      .populate("item")

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      )
    }

    // Verify ticket belongs to user
    if (ticket.user.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized - ticket does not belong to you" },
        { status: 403 }
      )
    }

    // Verify ticket has been used (user has actually experienced the ride/package)
    if (ticket.status !== "used") {
      return NextResponse.json(
        { error: "You can only review rides/packages you have experienced" },
        { status: 400 }
      )
    }

    // Check if testimonial already exists for this ticket
    const existingTestimonial = await Testimonial.findOne({
      user: session.user.id,
      ticket: ticketId,
    })

    if (existingTestimonial) {
      return NextResponse.json(
        { error: "You have already submitted a testimonial for this ticket" },
        { status: 400 }
      )
    }

    // Get ride or package name
    let rideName, packageName
    if (ticket.type === "ride") {
      const ride = await Ride.findById(ticket.item)
      rideName = ride?.name
    } else {
      const packageDoc = await Package.findById(ticket.item)
      packageName = packageDoc?.name
    }

    // Create testimonial
    const testimonial = new Testimonial({
      user: session.user.id,
      order: ticket.order,
      ticket: ticketId,
      rating,
      title: title.trim(),
      content: content.trim(),
      rideName,
      packageName,
      isVerifiedPurchase: true,
    })

    await testimonial.save()

    return NextResponse.json({
      success: true,
      message: "Testimonial submitted successfully and is pending approval",
      testimonial: {
        id: testimonial._id,
        status: testimonial.status,
      },
    })
  } catch (error) {
    console.error("Error creating testimonial:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export const POST = withAuth(createTestimonial, { requireAuth: true })
