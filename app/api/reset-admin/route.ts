import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { query } from "@/lib/database"

export async function POST() {
  try {
    console.log("Resetting admin user...")

    // Delete existing admin user
    await query("DELETE FROM users WHERE email = $1", ["admin@teslainvest.com"])

    // Create fresh password hash
    const password = "admin123"
    const hashedPassword = await bcrypt.hash(password, 12)

    console.log("New password hash:", hashedPassword.substring(0, 20) + "...")

    // Create new admin user
    const result = await query(
      `INSERT INTO users (
        email, 
        password_hash, 
        first_name, 
        last_name, 
        role, 
        status, 
        email_verified,
        referral_code,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING id, email, first_name, last_name, role, status`,
      ["admin@teslainvest.com", hashedPassword, "Admin", "User", "super_admin", "active", true, "ADMIN001"],
    )

    // Test the password immediately
    const passwordTest = await bcrypt.compare(password, hashedPassword)

    return NextResponse.json({
      success: true,
      message: "Admin user reset successfully",
      user: result.rows[0],
      passwordTest: passwordTest,
      credentials: {
        email: "admin@teslainvest.com",
        password: "admin123",
      },
    })
  } catch (error) {
    console.error("Reset admin error:", error)
    return NextResponse.json(
      {
        error: "Failed to reset admin user",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
