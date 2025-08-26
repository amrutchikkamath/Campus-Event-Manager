import { type NextRequest, NextResponse } from "next/server"
import { getEventsByDateRange, getEventsByMonth } from "@/lib/services/calendarService"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const year = searchParams.get("year")
    const month = searchParams.get("month")

    let events

    if (year && month) {
      // Get events for a specific month
      events = await getEventsByMonth(Number.parseInt(year), Number.parseInt(month))
    } else if (startDate && endDate) {
      // Get events for a date range
      events = await getEventsByDateRange(new Date(startDate), new Date(endDate))
    } else {
      // Default to current month
      const now = new Date()
      events = await getEventsByMonth(now.getFullYear(), now.getMonth())
    }

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Get calendar events error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
