import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware"
import { createEvent, getEvents } from "@/lib/services/eventService"
import type { CreateEventData } from "@/lib/models/Event"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") || undefined
    const category = searchParams.get("category") || undefined
    const featured = searchParams.get("featured") === "true" ? true : undefined
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined
    const skip = searchParams.get("skip") ? Number.parseInt(searchParams.get("skip")!) : undefined

    const events = await getEvents({ status, category, featured, limit, skip })
    return NextResponse.json({ events })
  } catch (error) {
    console.error("Get events error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const POST = withAuth(async (req: NextRequest, user: any) => {
  try {
    if (user.role !== "organizer" && user.role !== "admin") {
      return NextResponse.json({ error: "Only organizers and admins can create events" }, { status: 403 })
    }

    const eventData: CreateEventData = await req.json()

    // Validate required fields
    if (!eventData.title || !eventData.description || !eventData.date || !eventData.time || !eventData.location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get user name from database for organizer name
    const { getUserById } = await import("@/lib/auth")
    const organizer = await getUserById(user.userId)
    if (!organizer) {
      return NextResponse.json({ error: "Organizer not found" }, { status: 404 })
    }

    const event = await createEvent(eventData, user.userId, organizer.name)

    return NextResponse.json({ message: "Event created successfully", event }, { status: 201 })
  } catch (error: any) {
    console.error("Create event error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
})
