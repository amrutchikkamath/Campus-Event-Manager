import { NextResponse } from "next/server"
import { withRole } from "@/lib/middleware"
import { getDashboardStats } from "@/lib/services/adminService"

export const GET = withRole(["admin"])(async () => {
  try {
    const stats = await getDashboardStats()
    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Get admin stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
