import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb" // Added ObjectId import for proper MongoDB queries
import { getDatabase } from "./mongodb"
import type { User, CreateUserData, LoginCredentials } from "./models/User"

const JWT_SECRET = process.env.JWT_SECRET || "biet-campus-events-default-jwt-secret-2024"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string, email: string, role: string): string {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string }
  } catch {
    return null
  }
}

export async function createUser(userData: CreateUserData): Promise<User> {
  const db = await getDatabase()
  const users = db.collection<User>("users")

  // Check if user already exists
  const existingUser = await users.findOne({ email: userData.email })
  if (existingUser) {
    throw new Error("User already exists with this email")
  }

  const hashedPassword = await hashPassword(userData.password)
  const newUser: Omit<User, "_id"> = {
    ...userData,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await users.insertOne(newUser)
  return { ...newUser, _id: result.insertedId.toString() }
}

export async function authenticateUser(credentials: LoginCredentials): Promise<User | null> {
  const db = await getDatabase()
  const users = db.collection<User>("users")

  const user = await users.findOne({ email: credentials.email })
  if (!user) {
    return null
  }

  const isValid = await verifyPassword(credentials.password, user.password)
  if (!isValid) {
    return null
  }

  return user
}

export async function getUserById(userId: string): Promise<User | null> {
  const db = await getDatabase()
  const users = db.collection<User>("users")

  const user = await users.findOne({ _id: new ObjectId(userId) })
  return user
}
