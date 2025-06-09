import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// Force dynamic rendering
export const dynamic = "force-dynamic"

// Verify if a user has admin privileges
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any

    // Check if user has admin role
    if (!decoded.role || !["admin", "super_admin"].includes(decoded.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      isAdmin: true,
      role: decoded.role,
    })
  } catch (error) {
    console.error("Admin auth verification error:", error)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}
