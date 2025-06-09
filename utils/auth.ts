import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"

export interface AuthUser {
  id: number
  email: string
  role: string
  first_name: string
  last_name: string
}

export function verifyAdminToken(request: NextRequest): AuthUser | null {
  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any

    // Check if user has admin privileges
    if (decoded.email !== "admin@teslainvest.com" && decoded.role !== "super_admin") {
      return null
    }

    return decoded
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any
    return decoded
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
    },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "7d" },
  )
}
