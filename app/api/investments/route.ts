import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// Force dynamic rendering
export const dynamic = "force-dynamic"

// Mock investment plans data
const investmentPlans = [
  {
    id: 1,
    name: "Tesla Starter",
    description: "Perfect for beginners looking to start their Tesla investment journey",
    minInvestment: 100,
    maxInvestment: 100,
    dailyReturn: 80, // $400 profit over 5 days = $80/day
    duration: 5,
    currency: "USD",
    status: "active",
    totalReturn: 500,
    profit: 400,
  },
  {
    id: 2,
    name: "Tesla Pro",
    description: "Advanced plan for experienced investors seeking higher returns",
    minInvestment: 500,
    maxInvestment: 500,
    dailyReturn: 100, // $500 profit over 5 days = $100/day
    duration: 5,
    currency: "USD",
    status: "active",
    totalReturn: 1000,
    profit: 500,
  },
  {
    id: 3,
    name: "Tesla Elite",
    description: "Premium plan for high-net-worth individuals",
    minInvestment: 2000,
    maxInvestment: 2000,
    dailyReturn: 600, // $3000 profit over 5 days = $600/day
    duration: 5,
    currency: "USD",
    status: "active",
    totalReturn: 5000,
    profit: 3000,
  },
]

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

export async function GET(request: NextRequest) {
  try {
    // Get all active investment plans
    const activePlans = investmentPlans.filter((plan) => plan.status === "active")

    return NextResponse.json({
      success: true,
      plans: activePlans,
    })
  } catch (error) {
    console.error("Error fetching investment plans:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { planId, amount, currency } = await request.json()

    // Validate input
    if (!planId || !amount || !currency) {
      return NextResponse.json({ error: "Plan ID, amount, and currency are required" }, { status: 400 })
    }

    // Find the investment plan
    const plan = investmentPlans.find((p) => p.id === planId)
    if (!plan) {
      return NextResponse.json({ error: "Investment plan not found" }, { status: 404 })
    }

    // Validate investment amount
    if (amount < plan.minInvestment || amount > plan.maxInvestment) {
      return NextResponse.json(
        { error: `Investment amount must be between ${plan.minInvestment} and ${plan.maxInvestment} ${plan.currency}` },
        { status: 400 },
      )
    }

    // Validate currency
    if (currency !== plan.currency) {
      return NextResponse.json({ error: `This plan only accepts ${plan.currency}` }, { status: 400 })
    }

    // Mock investment creation
    const investment = {
      id: Math.floor(Math.random() * 10000),
      userId: (user as any).userId,
      planId,
      planName: plan.name,
      amount,
      currency,
      dailyReturn: plan.dailyReturn,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "active",
      totalEarned: 0,
      progress: 0,
    }

    return NextResponse.json({
      success: true,
      message: "Investment created successfully",
      investment,
    })
  } catch (error) {
    console.error("Investment creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
