import { type NextRequest, NextResponse } from "next/server"
import { withRole } from "@/lib/middleware"
import { toggleEventFeatured } from "@/lib/services/adminService"

export const PUT = withRole(["admin"])(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  try {
    const updatedEvent = await toggleEventFeatured(params.id)
    if (!updatedEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: `Event ${updatedEvent.featured ? "featured" : "unfeatured"} successfully`,
      event: updatedEvent,
    })
  } catch (error) {
    console.error("Toggle event featured error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
