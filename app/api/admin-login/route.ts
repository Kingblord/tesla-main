import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    // Simple password check
    if (password !== "admin123") {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 401 })
    }

    // Create admin user object
    const adminUser = {
      id: 1,
      userId: 1,
      email: "admin@teslainvest.com",
      name: "Admin User",
      first_name: "Admin",
      last_name: "User",
      role: "super_admin",
    }

    // Generate JWT token
    const token = jwt.sign(adminUser, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "7d" })

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Admin login successful",
    })

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
