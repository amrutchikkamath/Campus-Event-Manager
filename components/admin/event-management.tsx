"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Star, StarOff, Trash2 } from "lucide-react"
import type { Event } from "@/lib/models/Event"
import { format } from "date-fns"

export function EventManagement() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch events")
      }

      setEvents(data.events)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleFeatured = async (eventId: string) => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/feature`, {
        method: "PUT",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update event")
      }

      setSuccess(data.message)
      fetchEvents()
    } catch (error: any) {
      setError(error.message)
    }
  }

  const deleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete event")
      }

      setSuccess("Event deleted successfully")
      fetchEvents()
    } catch (error: any) {
      setError(error.message)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      upcoming: "bg-green-100 text-green-800",
      ongoing: "bg-yellow-100 text-yellow-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
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

  if (loading) {
    return <div className="text-center py-8">Loading events...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">Event Management</CardTitle>
        <CardDescription>Manage and moderate campus events</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {events.map((event) => (
            <div key={event._id} className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium text-balance">{event.title}</h3>
                  {event.featured && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                  <Badge className={getCategoryColor(event.category)}>{event.category}</Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-2 text-pretty">{event.description}</p>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Organizer: {event.organizerName}</p>
                  <p>
                    Date: {format(new Date(event.date), "PPP")} at {event.time}
                  </p>
                  <p>Location: {event.location}</p>
                  <p>
                    Participants: {event.currentParticipants}
                    {event.maxParticipants && ` / ${event.maxParticipants}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFeatured(event._id!)}
                  className={event.featured ? "text-yellow-600" : ""}
                >
                  {event.featured ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteEvent(event._id!)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
