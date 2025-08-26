"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, CalendarIcon, RefreshCw } from "lucide-react"
import type { CalendarEvent } from "@/lib/services/calendarService"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns"

interface CalendarViewProps {
  onDateSelect?: (date: Date) => void
  onEventClick?: (eventId: string) => void
}

export function CalendarView({ onDateSelect, onEventClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [currentDate])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchEvents(true) // Silent refresh
    }, 30000)

    return () => clearInterval(interval)
  }, [currentDate])

  const fetchEvents = async (silent = false) => {
    if (!silent) {
      setLoading(true)
    }
    try {
      const response = await fetch(
        `/api/calendar/events?year=${currentDate.getFullYear()}&month=${currentDate.getMonth()}`,
      )
      const data = await response.json()

      if (response.ok) {
        setEvents(data.events.map((event: any) => ({ ...event, date: new Date(event.date) })))
      }
    } catch (error) {
      console.error("Failed to fetch events:", error)
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    onDateSelect?.(date)
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(event.date, date))
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      academic: "bg-blue-500",
      cultural: "bg-purple-500",
      sports: "bg-green-500",
      technical: "bg-orange-500",
      social: "bg-pink-500",
    }
    return colors[category as keyof typeof colors] || "bg-gray-500"
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const startDay = monthStart.getDay()
  const paddedDays = []
  for (let i = 0; i < startDay; i++) {
    const paddingDate = new Date(monthStart)
    paddingDate.setDate(paddingDate.getDate() - (startDay - i))
    paddedDays.push(paddingDate)
  }

  const endDay = monthEnd.getDay()
  const endPaddedDays = []
  for (let i = 1; i < 7 - endDay; i++) {
    const paddingDate = new Date(monthEnd)
    paddingDate.setDate(paddingDate.getDate() + i)
    endPaddedDays.push(paddingDate)
  }

  const allDays = [...paddedDays, ...calendarDays, ...endPaddedDays]

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchEvents()
    setRefreshing(false)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {format(currentDate, "MMMM yyyy")}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading calendar...</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              {allDays.map((date, index) => {
                const dayEvents = getEventsForDate(date)
                const isCurrentMonth = isSameMonth(date, currentDate)
                const isSelected = selectedDate && isSameDay(date, selectedDate)
                const isTodayDate = isToday(date)

                return (
                  <div
                    key={index}
                    className={`
                      min-h-[80px] p-1 border rounded cursor-pointer transition-colors
                      ${isCurrentMonth ? "bg-background" : "bg-muted/50"}
                      ${isSelected ? "ring-2 ring-primary" : ""}
                      ${isTodayDate ? "bg-primary/10" : ""}
                      hover:bg-muted/80
                    `}
                    onClick={() => handleDateClick(date)}
                  >
                    <div
                      className={`
                        text-sm font-medium mb-1
                        ${isCurrentMonth ? "text-foreground" : "text-muted-foreground"}
                        ${isTodayDate ? "text-primary font-bold" : ""}
                      `}
                    >
                      {format(date, "d")}
                    </div>

                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={`
                            text-xs p-1 rounded text-white cursor-pointer
                            ${getCategoryColor(event.category)}
                          `}
                          onClick={(e) => {
                            e.stopPropagation()
                            onEventClick?.(event.id)
                          }}
                        >
                          <div className="truncate font-medium">{event.title}</div>
                          <div className="truncate opacity-90">{event.time}</div>
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground text-center">+{dayEvents.length - 2} more</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {selectedDate && (
              <div className="mt-6">
                <h3 className="font-serif text-lg font-semibold mb-3">Events for {format(selectedDate, "PPPP")}</h3>
                <div className="space-y-2">
                  {getEventsForDate(selectedDate).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                      onClick={() => onEventClick?.(event.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{event.title}</h4>
                          {event.featured && <Badge variant="secondary">Featured</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {event.time} • {event.currentParticipants}
                          {event.maxParticipants && `/${event.maxParticipants}`} participants
                        </div>
                      </div>
                      <Badge className={`${getCategoryColor(event.category)} text-white`}>{event.category}</Badge>
                    </div>
                  ))}
                  {getEventsForDate(selectedDate).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No events scheduled for this date</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
