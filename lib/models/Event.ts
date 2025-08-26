export interface Event {
  _id?: string
  title: string
  description: string
  date: Date
  time: string
  location: string
  category: "academic" | "cultural" | "sports" | "technical" | "social"
  maxParticipants?: number
  currentParticipants: number
  organizer: string // User ID
  organizerName: string
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
  featured: boolean
  imageUrl?: string
  registrationDeadline?: Date
  requirements?: string[]
  contactInfo: {
    email: string
    phone?: string
  }
  participants: string[] // Array of User IDs
  createdAt: Date
  updatedAt: Date
}

export interface CreateEventData {
  title: string
  description: string
  date: Date
  time: string
  location: string
  category: "academic" | "cultural" | "sports" | "technical" | "social"
  maxParticipants?: number
  registrationDeadline?: Date
  requirements?: string[]
  contactInfo: {
    email: string
    phone?: string
  }
  imageUrl?: string
}
