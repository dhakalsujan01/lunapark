import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Testimonial from "@/models/Testimonial"
import { withAuth } from "@/lib/auth-middleware"

// GET /api/admin/testimonials - Get all testimonials for admin management
async function getTestimonials(req: NextRequest, context: any, { session }: any) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") || "all"
    const limit = parseInt(searchParams.get("limit") || "20")
    const page = parseInt(searchParams.get("page") || "1")
    const rating = searchParams.get("rating")

    const query: any = {}
    if (status !== "all") {
      query.status = status
    }
    if (rating) {
      query.rating = parseInt(rating)
    }

    const testimonials = await Testimonial.find(query)
      .populate("user", "name email")
      .populate("approvedBy", "name")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)

    const total = await Testimonial.countDocuments(query)
    const counts = await Testimonial.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    const statusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0,
    }
    counts.forEach((item) => {
      statusCounts[item._id as keyof typeof statusCounts] = item.count
    })

    return NextResponse.json({
      testimonials,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      counts: statusCounts,
    })
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export const GET = withAuth(getTestimonials, { 
  requireAuth: true, 
  requireRole: "admin" 
})
