"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Users, RefreshCw } from "lucide-react"
import type { CalendarEvent } from "@/lib/services/calendarService"
import { format, isToday, isTomorrow, isYesterday, addDays } from "date-fns"

interface EventTimelineProps {
  onEventClick?: (eventId: string) => void
}

export function EventTimeline({ onEventClick }: EventTimelineProps) {
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchUpcomingEvents()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchUpcomingEvents(true) // Silent refresh
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const fetchUpcomingEvents = async (silent = false) => {
    if (!silent) {
      setLoading(true)
    }
    try {
      const startDate = new Date()
      const endDate = addDays(new Date(), 30) // Next 30 days

      const response = await fetch(
        `/api/calendar/events?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
      )
      const data = await response.json()

      if (response.ok) {
        setUpcomingEvents(data.events.map((event: any) => ({ ...event, date: new Date(event.date) })))
      }
    } catch (error) {
      console.error("Failed to fetch upcoming events:", error)
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchUpcomingEvents()
    setRefreshing(false)
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      academic: "bg-blue-100 text-blue-800",
      cultural: "bg-purple-100 text-purple-800",
      sports: "bg-green-100 text-green-800",
      technical: "bg-orange-100 text-orange-800",
      social: "bg-pink-100 text-pink-800",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today"
    if (isTomorrow(date)) return "Tomorrow"
    if (isYesterday(date)) return "Yesterday"
    return format(date, "EEEE, MMM d")
  }

  const groupEventsByDate = (events: CalendarEvent[]) => {
    const grouped: { [key: string]: CalendarEvent[] } = {}

    events.forEach((event) => {
      const dateKey = format(event.date, "yyyy-MM-dd")
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(event)
    })

    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading events...</div>
        </CardContent>
      </Card>
    )
  }

  const groupedEvents = groupEventsByDate(upcomingEvents)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {groupedEvents.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No upcoming events in the next 30 days</p>
        ) : (
          <div className="space-y-6">
            {groupedEvents.map(([dateKey, events]) => (
              <div key={dateKey}>
                <h3 className="font-semibold text-primary mb-3 sticky top-0 bg-background py-2">
                  {getDateLabel(new Date(dateKey))}
                </h3>
                <div className="space-y-3 ml-4">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-4 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => onEventClick?.(event.id)}
                    >
                      <div className="flex-shrink-0 w-16 text-center">
                        <div className="text-sm font-medium">{event.time}</div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-medium text-balance">{event.title}</h4>
                          <div className="flex gap-1 flex-shrink-0">
                            <Badge className={getCategoryColor(event.category)}>{event.category}</Badge>
                            {event.featured && <Badge variant="secondary">Featured</Badge>}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>
                              {event.currentParticipants}
                              {event.maxParticipants && `/${event.maxParticipants}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
