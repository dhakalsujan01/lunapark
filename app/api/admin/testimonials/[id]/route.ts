import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Testimonial from "@/models/Testimonial"
import { withAuth } from "@/lib/auth-middleware"

// PUT /api/admin/testimonials/[id] - Update testimonial status
async function updateTestimonial(
  req: NextRequest,
  { params }: { params: { id: string } },
  { session }: any
) {
  try {
    await connectDB()

    const { action, rejectionReason } = await req.json()

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      )
    }

    if (action === "reject" && !rejectionReason) {
      return NextResponse.json(
        { error: "Rejection reason is required when rejecting testimonials" },
        { status: 400 }
      )
    }

    const testimonial = await Testimonial.findById(params.id)

    if (!testimonial) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      )
    }

    if (testimonial.status !== "pending") {
      return NextResponse.json(
        { error: `Testimonial is already ${testimonial.status}` },
        { status: 400 }
      )
    }

    // Update testimonial status
    testimonial.status = action === "approve" ? "approved" : "rejected"
    testimonial.approvedBy = session.user.id

    if (action === "approve") {
      testimonial.approvedAt = new Date()
    } else {
      testimonial.rejectionReason = rejectionReason
    }

    await testimonial.save()

    return NextResponse.json({
      success: true,
      message: `Testimonial ${action}d successfully`,
      testimonial: {
        id: testimonial._id,
        status: testimonial.status,
        approvedAt: testimonial.approvedAt,
        rejectionReason: testimonial.rejectionReason,
      },
    })
  } catch (error) {
    console.error("Error updating testimonial:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/testimonials/[id] - Delete testimonial
async function deleteTestimonial(
  req: NextRequest,
  { params }: { params: { id: string } },
  { session }: any
) {
  try {
    await connectDB()

    const testimonial = await Testimonial.findByIdAndDelete(params.id)

    if (!testimonial) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Testimonial deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting testimonial:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export const PUT = withAuth(updateTestimonial, { 
  requireAuth: true, 
  requireRole: "admin" 
})

export const DELETE = withAuth(deleteTestimonial, { 
  requireAuth: true, 
  requireRole: "admin" 
})
