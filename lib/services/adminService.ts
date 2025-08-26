import { getDatabase } from "@/lib/mongodb"
import type { User } from "@/lib/models/User"
import type { Event } from "@/lib/models/Event"
import { ObjectId } from "mongodb"

export interface DashboardStats {
  totalUsers: number
  totalEvents: number
  upcomingEvents: number
  totalRegistrations: number
  usersByRole: {
    admin: number
    organizer: number
    participant: number
  }
  eventsByCategory: {
    academic: number
    cultural: number
    sports: number
    technical: number
    social: number
  }
  recentUsers: User[]
  recentEvents: Event[]
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = await getDatabase()
  const users = db.collection<User>("users")
  const events = db.collection<Event>("events")

  // Get basic counts
  const totalUsers = await users.countDocuments()
  const totalEvents = await events.countDocuments()
  const upcomingEvents = await events.countDocuments({ status: "upcoming" })

  // Calculate total registrations across all events
  const registrationsPipeline = [{ $group: { _id: null, total: { $sum: "$currentParticipants" } } }]
  const registrationsResult = await events.aggregate(registrationsPipeline).toArray()
  const totalRegistrations = registrationsResult[0]?.total || 0

  // Get user counts by role
  const userRolePipeline = [{ $group: { _id: "$role", count: { $sum: 1 } } }]
  const userRoleResults = await users.aggregate(userRolePipeline).toArray()
  const usersByRole = {
    admin: 0,
    organizer: 0,
    participant: 0,
  }
  userRoleResults.forEach((result) => {
    if (result._id in usersByRole) {
      usersByRole[result._id as keyof typeof usersByRole] = result.count
    }
  })

  // Get event counts by category
  const eventCategoryPipeline = [{ $group: { _id: "$category", count: { $sum: 1 } } }]
  const eventCategoryResults = await events.aggregate(eventCategoryPipeline).toArray()
  const eventsByCategory = {
    academic: 0,
    cultural: 0,
    sports: 0,
    technical: 0,
    social: 0,
  }
  eventCategoryResults.forEach((result) => {
    if (result._id in eventsByCategory) {
      eventsByCategory[result._id as keyof typeof eventsByCategory] = result.count
    }
  })

  // Get recent users (last 10)
  const recentUsers = await users.find({}).sort({ createdAt: -1 }).limit(10).toArray()

  // Get recent events (last 10)
  const recentEvents = await events.find({}).sort({ createdAt: -1 }).limit(10).toArray()

  return {
    totalUsers,
    totalEvents,
    upcomingEvents,
    totalRegistrations,
    usersByRole,
    eventsByCategory,
    recentUsers,
    recentEvents,
  }
}

export async function getAllUsers(filter: { role?: string; limit?: number; skip?: number } = {}): Promise<User[]> {
  const db = await getDatabase()
  const users = db.collection<User>("users")

  const query: any = {}
  if (filter.role) query.role = filter.role

  let cursor = users.find(query).sort({ createdAt: -1 })

  if (filter.skip) cursor = cursor.skip(filter.skip)
  if (filter.limit) cursor = cursor.limit(filter.limit)

  return cursor.toArray()
}

export async function updateUserRole(userId: string, newRole: string): Promise<User | null> {
  const db = await getDatabase()
  const users = db.collection<User>("users")

  const result = await users.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $set: { role: newRole, updatedAt: new Date() } },
    { returnDocument: "after" },
  )

  return result
}

export async function deleteUser(userId: string): Promise<boolean> {
  const db = await getDatabase()
  const users = db.collection<User>("users")

  const result = await users.deleteOne({ _id: new ObjectId(userId) })
  return result.deletedCount > 0
}

export async function toggleEventFeatured(eventId: string): Promise<Event | null> {
  const db = await getDatabase()
  const events = db.collection<Event>("events")

  const event = await events.findOne({ _id: new ObjectId(eventId) })
  if (!event) return null

  const result = await events.findOneAndUpdate(
    { _id: new ObjectId(eventId) },
    { $set: { featured: !event.featured, updatedAt: new Date() } },
    { returnDocument: "after" },
  )

  return result
}
