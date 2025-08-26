"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, Mail, Phone, Trash2 } from "lucide-react"
import type { Event } from "@/lib/models/Event"
import { format } from "date-fns"

interface EventCardProps {
  event: Event
  currentUser?: any
  onRegister?: (eventId: string) => void
  onUnregister?: (eventId: string) => void
  onDelete?: (eventId: string) => void // Added delete callback prop
  showActions?: boolean
}

export function EventCard({
  event,
  currentUser,
  onRegister,
  onUnregister,
  onDelete,
  showActions = true,
}: EventCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false) // Added delete loading state
  const isRegistered = currentUser && event.participants.includes(currentUser._id)
  const canRegister = currentUser && !isRegistered && event.status === "upcoming"
  const isFull = event.maxParticipants && event.currentParticipants >= event.maxParticipants
  const isDeadlinePassed = event.registrationDeadline && new Date() > new Date(event.registrationDeadline)
  const isOrganizer =
    currentUser &&
    (currentUser.role === "organizer" || currentUser.role === "admin") &&
    (event.organizerId === currentUser._id || currentUser.role === "admin")

  const handleRegister = async () => {
    if (!onRegister) return
    setIsLoading(true)
    await onRegister(event._id!)
    setIsLoading(false)
  }

  const handleUnregister = async () => {
    if (!onUnregister) return
    setIsLoading(true)
    await onUnregister(event._id!)
    setIsLoading(false)
  }

  const handleDelete = async () => {
    if (!onDelete || !confirm("Are you sure you want to delete this event? This action cannot be undone.")) return
    setIsDeleting(true)
    await onDelete(event._id!)
    setIsDeleting(false)
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

  const getStatusColor = (status: string) => {
    const colors = {
      upcoming: "bg-green-100 text-green-800",
      ongoing: "bg-yellow-100 text-yellow-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <Card className="h-full flex flex-col">
      {event.imageUrl && (
        <div className="aspect-video overflow-hidden rounded-t-lg">
          <img src={event.imageUrl || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover" />
        </div>
      )}

      <CardHeader className="flex-none">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="font-serif text-xl text-balance">{event.title}</CardTitle>
            <CardDescription className="text-pretty">{event.organizerName}</CardDescription>
          </div>
          <div className="flex flex-col gap-1">
            <Badge className={getCategoryColor(event.category)}>{event.category}</Badge>
            <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
            {event.featured && <Badge variant="secondary">Featured</Badge>}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <p className="text-sm text-muted-foreground text-pretty">{event.description}</p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(event.date), "PPP")}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{event.time}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{event.location}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>
              {event.currentParticipants}
              {event.maxParticipants && ` / ${event.maxParticipants}`} participants
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs">{event.contactInfo.email}</span>
          </div>

          {event.contactInfo.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs">{event.contactInfo.phone}</span>
            </div>
          )}
        </div>

        {event.requirements && event.requirements.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-1">Requirements:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              {event.requirements.map((req, index) => (
                <li key={index}>• {req}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>

      {showActions && currentUser && (
        <CardFooter className="flex-none">
          {isOrganizer ? (
            <div className="flex gap-2 w-full">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
              {isRegistered ? (
                <Button
                  variant="outline"
                  onClick={handleUnregister}
                  disabled={isLoading}
                  className="flex-1 bg-transparent"
                >
                  {isLoading ? "Unregistering..." : "Unregister"}
                </Button>
              ) : canRegister ? (
                <Button onClick={handleRegister} disabled={isLoading || isFull || isDeadlinePassed} className="flex-1">
                  {isLoading
                    ? "Registering..."
                    : isFull
                      ? "Event Full"
                      : isDeadlinePassed
                        ? "Registration Closed"
                        : "Register"}
                </Button>
              ) : (
                <Button disabled className="flex-1">
                  {event.status === "completed" ? "Event Completed" : "Registration Unavailable"}
                </Button>
              )}
            </div>
          ) : (
            <>
              {isRegistered ? (
                <Button
                  variant="outline"
                  onClick={handleUnregister}
                  disabled={isLoading}
                  className="w-full bg-transparent"
                >
                  {isLoading ? "Unregistering..." : "Unregister"}
                </Button>
              ) : canRegister ? (
                <Button onClick={handleRegister} disabled={isLoading || isFull || isDeadlinePassed} className="w-full">
                  {isLoading
                    ? "Registering..."
                    : isFull
                      ? "Event Full"
                      : isDeadlinePassed
                        ? "Registration Closed"
                        : "Register"}
                </Button>
              ) : (
                <Button disabled className="w-full">
                  {event.status === "completed" ? "Event Completed" : "Registration Unavailable"}
                </Button>
              )}
            </>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
