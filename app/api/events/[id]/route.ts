import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/middleware"
import { getEventById, updateEvent, deleteEvent } from "@/lib/services/eventService"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const event = await getEventById(params.id)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error("Get event error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const PUT = withAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  try {
    const event = await getEventById(params.id)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check if user is the organizer or admin
    if (event.organizer !== user.userId && user.role !== "admin") {
      return NextResponse.json({ error: "Not authorized to update this event" }, { status: 403 })
    }

    const updateData = await req.json()
    const updatedEvent = await updateEvent(params.id, updateData)

    return NextResponse.json({ message: "Event updated successfully", event: updatedEvent })
  } catch (error) {
    console.error("Update event error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})

export const DELETE = withAuth(async (req: NextRequest, user: any, { params }: { params: { id: string } }) => {
  try {
    const event = await getEventById(params.id)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check if user is the organizer or admin
    if (event.organizer !== user.userId && user.role !== "admin") {
      return NextResponse.json({ error: "Not authorized to delete this event" }, { status: 403 })
    }

    const deleted = await deleteEvent(params.id)
    if (!deleted) {
      return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
    }

    return NextResponse.json({ message: "Event deleted successfully" })
  } catch (error) {
    console.error("Delete event error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
