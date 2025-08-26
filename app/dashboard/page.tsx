"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { EventCard } from "@/components/events/event-card"
import { MiniCalendar } from "@/components/calendar/mini-calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Plus, Settings } from "lucide-react"
import Link from "next/link"
import type { Event } from "@/lib/models/Event"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [myEvents, setMyEvents] = useState<Event[]>([])
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Get user info
      const userResponse = await fetch("/api/auth/me")
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData.user)

        // Fetch events organized by user
        if (userData.user.role === "organizer" || userData.user.role === "admin") {
          const myEventsResponse = await fetch(`/api/events?organizer=${userData.user._id}`)
          if (myEventsResponse.ok) {
            const myEventsData = await myEventsResponse.json()
            setMyEvents(myEventsData.events)
          }
        }

        // Fetch events user is registered for
        const allEventsResponse = await fetch("/api/events")
        if (allEventsResponse.ok) {
          const allEventsData = await allEventsResponse.json()
          const registered = allEventsData.events.filter((event: Event) =>
            event.participants.includes(userData.user._id),
          )
          setRegisteredEvents(registered)
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnregister = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchData() // Refresh data
      }
    } catch (error) {
      console.error("Unregistration failed:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="text-center py-8">
              <h2 className="font-semibold text-lg mb-2">Please sign in</h2>
              <p className="text-muted-foreground mb-4">You need to be logged in to view your dashboard</p>
              <Button asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold text-primary mb-2">Welcome back, {user.name}!</h1>
            <p className="text-muted-foreground">Manage your events and registrations</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Registered Events</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{registeredEvents.length}</div>
                    <p className="text-xs text-muted-foreground">Events you're attending</p>
                  </CardContent>
                </Card>

                {(user.role === "organizer" || user.role === "admin") && (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">My Events</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{myEvents.length}</div>
                      <p className="text-xs text-muted-foreground">Events you organized</p>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Role</CardTitle>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold capitalize">{user.role}</div>
                    <p className="text-xs text-muted-foreground">Your account type</p>
                  </CardContent>
                </Card>
              </div>

              {/* My Events (for organizers/admins) */}
              {(user.role === "organizer" || user.role === "admin") && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-serif text-2xl font-bold text-primary">My Events</h2>
                    <Button asChild>
                      <Link href="/create-event">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Event
                      </Link>
                    </Button>
                  </div>

                  {myEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {myEvents.map((event) => (
                        <EventCard key={event._id} event={event} currentUser={user} showActions={false} />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="text-center py-8">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold mb-2">No events created yet</h3>
                        <p className="text-muted-foreground mb-4">Start organizing your first campus event</p>
                        <Button asChild>
                          <Link href="/create-event">Create Your First Event</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Registered Events */}
              <div>
                <h2 className="font-serif text-2xl font-bold text-primary mb-6">Registered Events</h2>

                {registeredEvents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {registeredEvents.map((event) => (
                      <EventCard
                        key={event._id}
                        event={event}
                        currentUser={user}
                        onUnregister={handleUnregister}
                        showActions={true}
                      />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No registered events</h3>
                      <p className="text-muted-foreground mb-4">Browse and register for exciting campus events</p>
                      <Button asChild>
                        <Link href="/events">Browse Events</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <MiniCalendar />

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full justify-start">
                    <Link href="/events">
                      <Calendar className="h-4 w-4 mr-2" />
                      Browse Events
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                    <Link href="/calendar">
                      <Calendar className="h-4 w-4 mr-2" />
                      View Calendar
                    </Link>
                  </Button>
                  {(user.role === "organizer" || user.role === "admin") && (
                    <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                      <Link href="/create-event">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Event
                      </Link>
                    </Button>
                  )}
                  <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                    <Link href="/profile">
                      <Settings className="h-4 w-4 mr-2" />
                      Profile Settings
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
