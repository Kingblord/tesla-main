import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { transactionQueries } from "@/lib/database"

function verifyToken(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    return null
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const amount = formData.get("amount")
    const currency = formData.get("currency")
    const screenshot = formData.get("screenshot")

    // Validate input
    if (!amount || !currency || !screenshot) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // In a real app, you would:
    // 1. Upload the screenshot to a storage service (e.g., AWS S3, Vercel Blob)
    // 2. Get the URL of the uploaded file
    // 3. Create a deposit transaction record in the database

    // For now, we'll just create a transaction record without the screenshot
    const transaction = await transactionQueries.createTransaction({
      userId: (user as any).userId,
      type: "deposit",
      amount: Number.parseFloat(amount as string),
      currency: currency as string,
      status: "pending",
      notes: "Deposit request with screenshot",
    })

    return NextResponse.json({
      success: true,
      message: "Deposit request submitted successfully",
      transaction,
    })
  } catch (error) {
    console.error("Deposit error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
