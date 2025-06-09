export interface InvestmentPlan {
  id: string
  name: string
  minAmount: number
  maxAmount: number
  duration: number
  dailyReturn: number
  totalReturn: number
  description: string
  features: string[]
  popular?: boolean
}

export const investmentsData: InvestmentPlan[] = [
  {
    id: "tesla-starter",
    name: "Tesla Starter",
    minAmount: 100,
    maxAmount: 100,
    duration: 5,
    dailyReturn: 80,
    totalReturn: 500,
    description: "Perfect for beginners looking to start their Tesla investment journey",
    features: ["$100 Investment", "$500 Total Return", "5 Days Duration", "$80 Daily Profit", "400% ROI"],
  },
  {
    id: "tesla-pro",
    name: "Tesla Pro",
    minAmount: 500,
    maxAmount: 500,
    duration: 5,
    dailyReturn: 100,
    totalReturn: 1000,
    description: "Most popular plan with balanced risk and high returns",
    features: ["$500 Investment", "$1,000 Total Return", "5 Days Duration", "$100 Daily Profit", "100% ROI"],
    popular: true,
  },
  {
    id: "tesla-elite",
    name: "Tesla Elite",
    minAmount: 2000,
    maxAmount: 2000,
    duration: 5,
    dailyReturn: 600,
    totalReturn: 5000,
    description: "Premium plan for serious investors seeking maximum returns",
    features: ["$2,000 Investment", "$5,000 Total Return", "5 Days Duration", "$600 Daily Profit", "150% ROI"],
  },
]

export function getInvestmentPlan(id: string): InvestmentPlan | undefined {
  return investmentsData.find((plan) => plan.id === id)
}

export function calculateDailyReturn(planId: string, amount: number): number {
  const plan = getInvestmentPlan(planId)
  if (!plan) return 0
  return plan.dailyReturn
}

export function calculateTotalReturn(planId: string, amount: number): number {
  const plan = getInvestmentPlan(planId)
  if (!plan) return 0
  return plan.totalReturn
}
