"use client"

import { useState, useEffect } from "react"
import { CalendarView } from "@/components/calendar/calendar-view"
import { EventTimeline } from "@/components/calendar/event-timeline"
import { useRouter } from "next/navigation"

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const handleEventCreated = () => {
      setRefreshKey((prev) => prev + 1)
    }

    window.addEventListener("eventCreated", handleEventCreated)
    return () => window.removeEventListener("eventCreated", handleEventCreated)
  }, [])

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`)
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-primary mb-2">Event Calendar</h1>
          <p className="text-muted-foreground">View and manage campus events in calendar format</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <CalendarView
              key={`calendar-${refreshKey}`}
              onDateSelect={handleDateSelect}
              onEventClick={handleEventClick}
            />
          </div>

          <div className="xl:col-span-1">
            <EventTimeline key={`timeline-${refreshKey}`} onEventClick={handleEventClick} />
          </div>
        </div>
      </div>
    </div>
  )
}
