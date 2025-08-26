import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware"
import { registerForEvent, unregisterFromEvent } from "@/lib/services/eventService"

export const POST = withAuth(async (req: NextRequest, user: any) => {
  try {
    const url = new URL(req.url)
    const pathSegments = url.pathname.split("/")
    const eventId = pathSegments[pathSegments.length - 2] // Get ID from /api/events/[id]/register

    const result = await registerForEvent(eventId, user.userId)

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json({ message: result.message })
  } catch (error) {
    console.error("Register for event error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

export const DELETE = withAuth(async (req: NextRequest, user: any) => {
  try {
    const url = new URL(req.url)
    const pathSegments = url.pathname.split("/")
    const eventId = pathSegments[pathSegments.length - 2] // Get ID from /api/events/[id]/register

    const result = await unregisterFromEvent(eventId, user.userId)

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json({ message: result.message })
  } catch (error) {
    console.error("Unregister from event error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
