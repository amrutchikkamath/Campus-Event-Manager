export interface User {
  _id?: string
  email: string
  password: string
  name: string
  role: "admin" | "organizer" | "participant"
  studentId?: string
  department?: string
  year?: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserData {
  email: string
  password: string
  name: string
  role: "admin" | "organizer" | "participant"
  studentId?: string
  department?: string
  year?: number
}

export interface LoginCredentials {
  email: string
  password: string
}
