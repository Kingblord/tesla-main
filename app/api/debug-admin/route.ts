import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { query } from "@/lib/database"

export async function GET() {
  try {
    // Check if admin user exists
    const adminUser = await query("SELECT * FROM users WHERE email = $1", ["admin@teslainvest.com"])

    // Check all users
    const allUsers = await query("SELECT id, email, first_name, last_name, role, status FROM users LIMIT 10")

    // Test password hash
    let passwordTest = null
    if (adminUser.rows.length > 0) {
      const user = adminUser.rows[0]
      passwordTest = {
        hasPasswordHash: !!user.password_hash,
        passwordHashLength: user.password_hash?.length || 0,
        passwordHashPreview: user.password_hash?.substring(0, 20) + "...",
        bcryptTest: await bcrypt.compare("admin123", user.password_hash),
      }
    }

    // Check database connection
    const dbTest = await query("SELECT NOW() as current_time")

    return NextResponse.json({
      success: true,
      adminUserExists: adminUser.rows.length > 0,
      adminUser: adminUser.rows[0] || null,
      passwordTest,
      allUsers: allUsers.rows,
      databaseConnection: dbTest.rows[0],
      totalUsers: allUsers.rows.length,
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json(
      {
        error: "Debug failed",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
