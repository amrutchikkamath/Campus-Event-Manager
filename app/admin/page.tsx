"use client"

import { useState, useEffect } from "react"
import { StatsCards } from "@/components/admin/stats-cards"
import { UserManagement } from "@/components/admin/user-management"
import { EventManagement } from "@/components/admin/event-management"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { DashboardStats } from "@/lib/services/adminService"

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch stats")
      }

      setStats(data.stats)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-primary mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, events, and monitor system activity</p>
        </div>

        {stats && (
          <div className="space-y-8">
            <StatsCards stats={stats} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <UserManagement />
              <EventManagement />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
