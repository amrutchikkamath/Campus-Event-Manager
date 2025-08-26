import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "./auth"

export function withAuth(handler: (req: NextRequest, user: any, context?: any) => Promise<NextResponse>) {
  return async (req: NextRequest, context?: any) => {
    const token = req.cookies.get("auth-token")?.value || req.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    return handler(req, user, context)
  }
}

export function withRole(roles: string[]) {
  return (handler: (req: NextRequest, user: any, context?: any) => Promise<NextResponse>) =>
    withAuth(async (req: NextRequest, user: any, context?: any) => {
      if (!roles.includes(user.role)) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
      }

      return handler(req, user, context)
    })
}
