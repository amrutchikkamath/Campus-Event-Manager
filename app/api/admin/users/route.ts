import { type NextRequest, NextResponse } from "next/server"
import { withRole } from "@/lib/middleware"
import { getAllUsers } from "@/lib/services/adminService"

export const GET = withRole(["admin"])(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const role = searchParams.get("role") || undefined
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined
    const skip = searchParams.get("skip") ? Number.parseInt(searchParams.get("skip")!) : undefined

    const users = await getAllUsers({ role, limit, skip })

    // Remove passwords from response
    const safeUsers = users.map(({ password, ...user }) => user)

    return NextResponse.json({ users: safeUsers })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
