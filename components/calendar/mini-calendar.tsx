"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { CalendarEvent } from "@/lib/services/calendarService"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns"

interface MiniCalendarProps {
  onDateSelect?: (date: Date) => void
  selectedDate?: Date | null
}

export function MiniCalendar({ onDateSelect, selectedDate }: MiniCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])

  useEffect(() => {
    fetchEvents()
  }, [currentDate])

  const fetchEvents = async () => {
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

  const hasEventsOnDate = (date: Date) => {
    return events.some((event) => isSameDay(event.date, date))
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Pad the calendar to start on Sunday
  const startDay = monthStart.getDay()
  const paddedDays = []
  for (let i = 0; i < startDay; i++) {
    const paddingDate = new Date(monthStart)
    paddingDate.setDate(paddingDate.getDate() - (startDay - i))
    paddedDays.push(paddingDate)
  }

  const allDays = [...paddedDays, ...calendarDays]

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-serif">{format(currentDate, "MMM yyyy")}</CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
            <div key={index} className="p-1 text-center text-xs font-medium text-muted-foreground">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {allDays.map((date, index) => {
            const isCurrentMonth = isSameMonth(date, currentDate)
            const isSelected = selectedDate && isSameDay(date, selectedDate)
            const isTodayDate = isToday(date)
            const hasEvents = hasEventsOnDate(date)

            return (
              <button
                key={index}
                className={`
                  relative p-1 text-xs rounded cursor-pointer transition-colors aspect-square flex items-center justify-center
                  ${isCurrentMonth ? "text-foreground" : "text-muted-foreground"}
                  ${isSelected ? "bg-primary text-primary-foreground" : ""}
                  ${isTodayDate && !isSelected ? "bg-primary/20 text-primary font-bold" : ""}
                  ${!isSelected && !isTodayDate ? "hover:bg-muted" : ""}
                `}
                onClick={() => onDateSelect?.(date)}
              >
                {format(date, "d")}
                {hasEvents && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
