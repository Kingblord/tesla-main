import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { userQueries } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log("=== LOGIN ATTEMPT ===")
    console.log("Email:", email)
    console.log("Password provided:", !!password)

    // Validate input
    if (!email || !password) {
      console.log("❌ Missing email or password")
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Get user from database
    const user = await userQueries.getUserByEmail(email)
    console.log("User found in database:", !!user)

    if (!user) {
      console.log("❌ User not found in database")
      return NextResponse.json({ error: "Invalid credentials - user not found" }, { status: 401 })
    }

    console.log("User details:")
    console.log("- ID:", user.id)
    console.log("- Email:", user.email)
    console.log("- Role:", user.role)
    console.log("- Status:", user.status)
    console.log("- Has password hash:", !!user.password_hash)
    console.log("- Password hash length:", user.password_hash?.length || 0)

    // Verify password
    console.log("Testing password...")
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    console.log("Password valid:", isValidPassword)

    if (!isValidPassword) {
      console.log("❌ Invalid password")
      return NextResponse.json({ error: "Invalid credentials - wrong password" }, { status: 401 })
    }

    // Check if user is active
    if (user.status !== "active") {
      console.log("❌ User account not active:", user.status)
      return NextResponse.json({ error: "Account is suspended" }, { status: 403 })
    }

    // Update last login
    await userQueries.updateUser(user.id, { last_login: new Date() })

    // Generate JWT token
    const tokenPayload = {
      userId: user.id,
      id: user.id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
    }

    console.log("Token payload:", tokenPayload)

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "7d" })

    console.log("✅ Login successful for:", email)

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role,
        status: user.status,
      },
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
    console.error("❌ Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
