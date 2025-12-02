import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Contact from "@/models/Contact"
import { withAuth } from "@/lib/auth-middleware"

// GET /api/admin/contact - Get all contacts with filtering and pagination
async function getContacts(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") || ""
    const category = searchParams.get("category") || ""
    const priority = searchParams.get("priority") || ""
    const search = searchParams.get("search") || ""
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const skip = (page - 1) * limit

    // Build filter query
    const filter: any = {}
    if (status) filter.status = status
    if (category) filter.category = category
    if (priority) filter.priority = priority
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ]
    }
    if (dateFrom || dateTo) {
      filter.createdAt = {}
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom)
      if (dateTo) filter.createdAt.$lte = new Date(dateTo)
    }

    // Build sort object
    const sort: any = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    // Get contacts with pagination
    const contacts = await Contact.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()

    // Get total count for pagination
    const total = await Contact.countDocuments(filter)
    const totalPages = Math.ceil(total / limit)

    // Get statistics
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          new: { $sum: { $cond: [{ $eq: ["$status", "new"] }, 1, 0] } },
          read: { $sum: { $cond: [{ $eq: ["$status", "read"] }, 1, 0] } },
          replied: { $sum: { $cond: [{ $eq: ["$status", "replied"] }, 1, 0] } },
          archived: { $sum: { $cond: [{ $eq: ["$status", "archived"] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ["$priority", "medium"] }, 1, 0] } },
          low: { $sum: { $cond: [{ $eq: ["$priority", "low"] }, 1, 0] } },
        },
      },
    ])

    return NextResponse.json({
      success: true,
      data: {
        contacts,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        stats: stats[0] || {
          total: 0,
          new: 0,
          read: 0,
          replied: 0,
          archived: 0,
          high: 0,
          medium: 0,
          low: 0,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching contacts:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch contacts" },
      { status: 500 }
    )
  }
}

// POST /api/admin/contact - Create a new contact (for testing or manual entry)
async function createContact(req: NextRequest) {
  try {
    await connectDB()

    const data = await req.json()

    // Validate required fields
    if (!data.name || !data.email || !data.subject || !data.message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    const contact = new Contact(data)
    await contact.save()

    return NextResponse.json({
      success: true,
      data: contact,
      message: "Contact created successfully",
    })
  } catch (error) {
    console.error("Error creating contact:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create contact" },
      { status: 500 }
    )
  }
}

// Export the handler with auth middleware
export const GET = withAuth(getContacts, "admin")
export const POST = withAuth(createContact, "admin")
