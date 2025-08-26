import { getDatabase } from "@/lib/mongodb"
import type { Event, CreateEventData } from "@/lib/models/Event"
import { ObjectId } from "mongodb"

export async function createEvent(
  eventData: CreateEventData,
  organizerId: string,
  organizerName: string,
): Promise<Event> {
  const db = await getDatabase()
  const events = db.collection<Event>("events")

  const newEvent: Omit<Event, "_id"> = {
    ...eventData,
    organizer: organizerId,
    organizerName,
    currentParticipants: 0,
    participants: [],
    status: "upcoming",
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await events.insertOne(newEvent)
  return { ...newEvent, _id: result.insertedId.toString() }
}

export async function getEvents(
  filter: {
    status?: string
    category?: string
    featured?: boolean
    organizer?: string
    limit?: number
    skip?: number
  } = {},
): Promise<Event[]> {
  const db = await getDatabase()
  const events = db.collection<Event>("events")

  const query: any = {}
  if (filter.status) query.status = filter.status
  if (filter.category) query.category = filter.category
  if (filter.featured !== undefined) query.featured = filter.featured
  if (filter.organizer) query.organizer = filter.organizer

  let cursor = events.find(query).sort({ createdAt: -1 })

  if (filter.skip) cursor = cursor.skip(filter.skip)
  if (filter.limit) cursor = cursor.limit(filter.limit)

  return cursor.toArray()
}

export async function getEventById(eventId: string): Promise<Event | null> {
  const db = await getDatabase()
  const events = db.collection<Event>("events")

  return events.findOne({ _id: new ObjectId(eventId) })
}

export async function updateEvent(eventId: string, updateData: Partial<Event>): Promise<Event | null> {
  const db = await getDatabase()
  const events = db.collection<Event>("events")

  const result = await events.findOneAndUpdate(
    { _id: new ObjectId(eventId) },
    { $set: { ...updateData, updatedAt: new Date() } },
    { returnDocument: "after" },
  )

  return result
}

export async function deleteEvent(eventId: string): Promise<boolean> {
  const db = await getDatabase()
  const events = db.collection<Event>("events")

  const result = await events.deleteOne({ _id: new ObjectId(eventId) })
  return result.deletedCount > 0
}

export async function registerForEvent(
  eventId: string,
  userId: string,
): Promise<{ success: boolean; message: string }> {
  const db = await getDatabase()
  const events = db.collection<Event>("events")

  const event = await events.findOne({ _id: new ObjectId(eventId) })
  if (!event) {
    return { success: false, message: "Event not found" }
  }

  if (event.participants.includes(userId)) {
    return { success: false, message: "Already registered for this event" }
  }

  if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
    return { success: false, message: "Event is full" }
  }

  if (event.registrationDeadline && new Date() > event.registrationDeadline) {
    return { success: false, message: "Registration deadline has passed" }
  }

  await events.updateOne(
    { _id: new ObjectId(eventId) },
    {
      $push: { participants: userId },
      $inc: { currentParticipants: 1 },
      $set: { updatedAt: new Date() },
    },
  )

  return { success: true, message: "Successfully registered for event" }
}

export async function unregisterFromEvent(
  eventId: string,
  userId: string,
): Promise<{ success: boolean; message: string }> {
  const db = await getDatabase()
  const events = db.collection<Event>("events")

  const event = await events.findOne({ _id: new ObjectId(eventId) })
  if (!event) {
    return { success: false, message: "Event not found" }
  }

  if (!event.participants.includes(userId)) {
    return { success: false, message: "Not registered for this event" }
  }

  await events.updateOne(
    { _id: new ObjectId(eventId) },
    {
      $pull: { participants: userId },
      $inc: { currentParticipants: -1 },
      $set: { updatedAt: new Date() },
    },
  )

  return { success: true, message: "Successfully unregistered from event" }
}
