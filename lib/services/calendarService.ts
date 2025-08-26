import { getDatabase } from "@/lib/mongodb"
import type { Event } from "@/lib/models/Event"

export interface CalendarEvent {
  id: string
  title: string
  date: Date
  time: string
  category: string
  status: string
  featured: boolean
  currentParticipants: number
  maxParticipants?: number
}

export async function getEventsByDateRange(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
  const db = await getDatabase()
  const events = db.collection<Event>("events")

  const eventList = await events
    .find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    })
    .sort({ date: 1, time: 1 })
    .toArray()

  return eventList.map((event) => ({
    id: event._id!.toString(),
    title: event.title,
    date: new Date(event.date),
    time: event.time,
    category: event.category,
    status: event.status,
    featured: event.featured,
    currentParticipants: event.currentParticipants,
    maxParticipants: event.maxParticipants,
  }))
}

export async function getEventsByMonth(year: number, month: number): Promise<CalendarEvent[]> {
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0, 23, 59, 59)

  return getEventsByDateRange(startDate, endDate)
}

export async function getEventsForDate(date: Date): Promise<CalendarEvent[]> {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  return getEventsByDateRange(startOfDay, endOfDay)
}
