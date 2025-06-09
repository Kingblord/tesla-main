import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// Force dynamic rendering
export const dynamic = "force-dynamic"

// Mock user data - in a real app, this would come from your database
const mockUser = {
  id: 1,
  email: "john@example.com",
  first_name: "John",
  last_name: "Doe",
  status: "active",
  wallet_balance: 0,
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any

    // In a real app, you would fetch the user from the database using decoded.userId
    // const user = await db.query('SELECT * FROM users WHERE id = $1', [decoded.userId])

    return NextResponse.json({
      success: true,
      user: {
        id: mockUser.id,
        email: mockUser.email,
        name: `${mockUser.first_name} ${mockUser.last_name}`,
        status: mockUser.status,
        wallet_balance: mockUser.wallet_balance,
      },
    })
  } catch (error) {
    console.error("Auth verification error:", error)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}
