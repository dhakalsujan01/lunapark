import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { withAuth } from "@/lib/auth-middleware"

// PUT /api/admin/users/[id] - Update user
async function updateUser(req: NextRequest, { params }: { params: Promise<{ id: string }> }, { session }: any) {
  try {
    await connectDB()

    const { id } = await params
    const updateData = await req.json()

    // Prevent users from modifying their own role or status
    if (id === session.user.id && (updateData.role || updateData.isActive !== undefined)) {
      return NextResponse.json({ error: "Cannot modify your own role or status" }, { status: 400 })
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password")

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      }
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id] - Delete user (soft delete by deactivating)
async function deleteUser(req: NextRequest, { params }: { params: Promise<{ id: string }> }, { session }: any) {
  try {
    await connectDB()

    const { id } = await params

    // Prevent users from deleting themselves
    if (id === session.user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select("-password")

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User deactivated successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}

export const PUT = withAuth(updateUser, "admin")
export const DELETE = withAuth(deleteUser, "admin")