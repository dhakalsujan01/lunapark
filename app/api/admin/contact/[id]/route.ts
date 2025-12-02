import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Contact from "@/models/Contact"
import { withAuth } from "@/lib/auth-middleware"

// GET /api/admin/contact/[id] - Get a specific contact by ID
async function getContactById(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Contact ID is required" },
        { status: 400 }
      )
    }

    const contact = await Contact.findById(id).lean()

    if (!contact) {
      return NextResponse.json(
        { success: false, error: "Contact not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: contact,
    })
  } catch (error) {
    console.error("Error fetching contact:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch contact" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/contact/[id] - Update a contact
async function updateContact(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Contact ID is required" },
        { status: 400 }
      )
    }

    const data = await req.json()

    // Remove fields that shouldn't be updated directly
    delete data._id
    delete data.createdAt
    delete data.updatedAt

    const contact = await Contact.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).lean()

    if (!contact) {
      return NextResponse.json(
        { success: false, error: "Contact not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: contact,
      message: "Contact updated successfully",
    })
  } catch (error) {
    console.error("Error updating contact:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update contact" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/contact/[id] - Delete a contact
async function deleteContact(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Contact ID is required" },
        { status: 400 }
      )
    }

    const contact = await Contact.findByIdAndDelete(id).lean()

    if (!contact) {
      return NextResponse.json(
        { success: false, error: "Contact not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Contact deleted successfully",
      data: { id: contact._id },
    })
  } catch (error) {
    console.error("Error deleting contact:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete contact" },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/contact/[id] - Update specific fields (like status, priority, notes)
async function patchContact(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Contact ID is required" },
        { status: 400 }
      )
    }

    const data = await req.json()

    // Only allow specific fields to be updated via PATCH
    const allowedFields = ["status", "priority", "adminNotes"]
    const updateData: any = {}

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 }
      )
    }

    updateData.updatedAt = new Date()

    const contact = await Contact.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).lean()

    if (!contact) {
      return NextResponse.json(
        { success: false, error: "Contact not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: contact,
      message: "Contact updated successfully",
    })
  } catch (error) {
    console.error("Error patching contact:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update contact" },
      { status: 500 }
    )
  }
}

// Export handlers with auth middleware
export const GET = withAuth(getContactById, "admin")
export const PUT = withAuth(updateContact, "admin")
export const PATCH = withAuth(patchContact, "admin")
export const DELETE = withAuth(deleteContact, "admin")
