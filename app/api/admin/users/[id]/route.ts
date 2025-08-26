import { type NextRequest, NextResponse } from "next/server"
import { withRole } from "@/lib/middleware"
import { updateUserRole, deleteUser } from "@/lib/services/adminService"

export const PUT = withRole(["admin"])(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  try {
    const { role } = await req.json()

    if (!["admin", "organizer", "participant"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const updatedUser = await updateUserRole(params.id, role)
    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Remove password from response
    const { password, ...safeUser } = updatedUser

    return NextResponse.json({ message: "User role updated successfully", user: safeUser })
  } catch (error) {
    console.error("Update user role error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

export const DELETE = withRole(["admin"])(
  async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
    try {
      const deleted = await deleteUser(params.id)
      if (!deleted) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      return NextResponse.json({ message: "User deleted successfully" })
    } catch (error) {
      console.error("Delete user error:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  },
)
