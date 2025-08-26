"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { EventCard } from "@/components/events/event-card"
import { MiniCalendar } from "@/components/calendar/mini-calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Star, TrendingUp } from "lucide-react"
import type { Event } from "@/lib/models/Event"

export default function HomePage() {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Check if user is logged in
      const userResponse = await fetch("/api/auth/me")
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData.user)
      }

      // Fetch featured events
      const featuredResponse = await fetch("/api/events?featured=true&limit=3")
      if (featuredResponse.ok) {
        const featuredData = await featuredResponse.json()
        setFeaturedEvents(featuredData.events)
      }

      // Fetch upcoming events
      const upcomingResponse = await fetch("/api/events?status=upcoming&limit=6")
      if (upcomingResponse.ok) {
        const upcomingData = await upcomingResponse.json()
        setUpcomingEvents(upcomingData.events)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (eventId: string) => {
    if (!user) {
      window.location.href = "/login"
      return
    }

    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
      })

      if (response.ok) {
        fetchData() // Refresh data
      }
    } catch (error) {
      console.error("Registration failed:", error)
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section
        className="relative py-24 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/biet-campus.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 text-balance">BIET Campus Events</h1>
          <p className="text-xl md:text-2xl mb-8 text-pretty max-w-3xl mx-auto">
            Discover, organize, and participate in exciting campus events at Bharat Institute of Engineering and
            Technology
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/events">Browse Events</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              asChild
            >
              <Link href="/calendar">View Calendar</Link>
            </Button>
          </div>
        </div>
      </section>

      <main className="flex-1">
        {/* Stats Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{upcomingEvents.length}</div>
                  <p className="text-xs text-muted-foreground">Happening this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {upcomingEvents.reduce((sum, event) => sum + event.currentParticipants, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Registered students</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Featured Events</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{featuredEvents.length}</div>
                  <p className="text-xs text-muted-foreground">Highlighted events</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">High</div>
                  <p className="text-xs text-muted-foreground">Community participation</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="font-serif text-3xl font-bold text-primary mb-4">Featured Events</h2>
                <p className="text-muted-foreground text-pretty max-w-2xl mx-auto">
                  Don't miss these highlighted events happening at BIET campus
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {featuredEvents.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    currentUser={user}
                    onRegister={handleRegister}
                    onUnregister={handleUnregister}
                  />
                ))}
              </div>

              <div className="text-center">
                <Button asChild variant="outline">
                  <Link href="/events?featured=true">View All Featured Events</Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Upcoming Events */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <div className="mb-8">
                  <h2 className="font-serif text-3xl font-bold text-primary mb-4">Upcoming Events</h2>
                  <p className="text-muted-foreground">Discover what's happening next at BIET</p>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <div className="aspect-video bg-muted rounded-t-lg" />
                        <CardHeader>
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="h-3 bg-muted rounded" />
                            <div className="h-3 bg-muted rounded w-2/3" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : upcomingEvents.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      {upcomingEvents.map((event) => (
                        <EventCard
                          key={event._id}
                          event={event}
                          currentUser={user}
                          onRegister={handleRegister}
                          onUnregister={handleUnregister}
                        />
                      ))}
                    </div>

                    <div className="text-center">
                      <Button asChild>
                        <Link href="/events">View All Events</Link>
                      </Button>
                    </div>
                  </>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No Upcoming Events</h3>
                      <p className="text-muted-foreground mb-4">Check back later for new events</p>
                      {user && (user.role === "organizer" || user.role === "admin") && (
                        <Button asChild>
                          <Link href="/create-event">Create First Event</Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="lg:col-span-1">
                <MiniCalendar />
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl font-bold text-primary mb-4">Event Categories</h2>
              <p className="text-muted-foreground">Explore events by category</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { name: "Academic", color: "bg-blue-100 text-blue-800", icon: "📚" },
                { name: "Cultural", color: "bg-purple-100 text-purple-800", icon: "🎭" },
                { name: "Sports", color: "bg-green-100 text-green-800", icon: "⚽" },
                { name: "Technical", color: "bg-orange-100 text-orange-800", icon: "💻" },
                { name: "Social", color: "bg-pink-100 text-pink-800", icon: "🤝" },
              ].map((category) => (
                <Link key={category.name} href={`/events?category=${category.name.toLowerCase()}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="text-center py-6">
                      <div className="text-2xl mb-2">{category.icon}</div>
                      <Badge className={category.color}>{category.name}</Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
