import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import { sql } from "./lib/db"

export interface User {
  id: number
  email: string
  name: string
  role: "user" | "admin"
  wallet_balance: number
}

export async function auth(request: NextRequest): Promise<User | null> {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    const users = await sql`
      SELECT id, email, name, role, wallet_balance 
      FROM users 
      WHERE id = ${decoded.userId}
    `

    if (users.length === 0) {
      return null
    }

    return users[0] as User
  } catch (error) {
    console.error("Auth error:", error)
    return null
  }
}

export async function requireAuth(request: NextRequest): Promise<User> {
  const user = await auth(request)
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

export async function requireAdmin(request: NextRequest): Promise<User> {
  const user = await requireAuth(request)
  if (user.role !== "admin") {
    throw new Error("Admin access required")
  }
  return user
}
