import { type NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/auth"
import type { CreateUserData } from "@/lib/models/User"

export async function POST(req: NextRequest) {
  try {
    const body: CreateUserData = await req.json()

    // Validate required fields
    if (!body.email || !body.password || !body.name || !body.role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate password strength
    if (body.password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    const user = await createUser(body)

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    return NextResponse.json({
      message: "User created successfully",
      user: userWithoutPassword,
    })
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
