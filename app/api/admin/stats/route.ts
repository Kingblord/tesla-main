import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// Force dynamic rendering
export const dynamic = "force-dynamic"

function verifyAdminToken(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) return null

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any
    if (!decoded.role || !["admin", "super_admin"].includes(decoded.role)) {
      return null
    }
    return decoded
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Mock stats data for now
    const stats = {
      totalUsers: 156,
      activeInvestments: 89,
      totalInvested: 125000,
      totalPayouts: 45000,
      pendingWithdrawals: 12,
      newUsersToday: 8,
    }

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
