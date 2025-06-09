"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Search,
  Edit,
  Eye,
  Download,
  Settings,
  Bell,
  Shield,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  status: string
  created_at: string
  last_login?: string
  total_invested?: number
}

interface Stats {
  totalUsers: number
  activeInvestments: number
  totalInvested: number
  totalPayouts: number
  pendingWithdrawals: number
  newUsersToday: number
}

interface Transaction {
  id: number
  user_name: string
  type: string
  amount: number
  currency: string
  status: string
  created_at: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeInvestments: 0,
    totalInvested: 0,
    totalPayouts: 0,
    pendingWithdrawals: 0,
    newUsersToday: 0,
  })
  const [users, setUsers] = useState<User[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      setLoading(true)

      // Fetch stats
      const statsResponse = await fetch("/api/admin/stats")
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
      }

      // Fetch users
      const usersResponse = await fetch("/api/admin/users")
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.users || [])
      }

      // Fetch recent transactions
      const transactionsResponse = await fetch("/api/admin/transactions")
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json()
        setTransactions(transactionsData.transactions || [])
      }
    } catch (error) {
      console.error("Error fetching admin data:", error)
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId: number, action: string, newStatus?: string) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          userId,
          status: newStatus,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `User ${action} successfully`,
        })
        fetchAdminData() // Refresh data
      } else {
        throw new Error("Failed to update user")
      }
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    }
  }

  const handleTransactionAction = async (transactionId: number, action: string) => {
    try {
      const response = await fetch("/api/admin/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          transactionId,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Transaction ${action} successfully`,
        })
        fetchAdminData() // Refresh data
      } else {
        throw new Error("Failed to update transaction")
      }
    } catch (error) {
      console.error("Error updating transaction:", error)
      toast({
        title: "Error",
        description: "Failed to update transaction",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading admin dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-bold">Tesla Invest Admin</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
                window.location.href = "/login"
              }}
            >
              <Shield className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage your Tesla Invest platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-green-400 mt-1">+{stats.newUsersToday} today</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Invested</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${stats.totalInvested.toLocaleString()}</div>
              <p className="text-xs text-gray-400 mt-1">{stats.activeInvestments} active investments</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Payouts</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">${stats.totalPayouts.toLocaleString()}</div>
              <p className="text-xs text-gray-400 mt-1">25% of total invested</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Pending Withdrawals</CardTitle>
              <Activity className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">${stats.pendingWithdrawals.toLocaleString()}</div>
              <p className="text-xs text-gray-400 mt-1">Requires approval</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/users">
            <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Manage Users</CardTitle>
                <Users className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-white">User Management</div>
                <p className="text-xs text-gray-400 mt-1">Edit profiles, suspend accounts, manage permissions</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/transactions">
            <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Transactions</CardTitle>
                <DollarSign className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-white">Approve Transactions</div>
                <p className="text-xs text-gray-400 mt-1">Manage deposits, withdrawals, and other transactions</p>
              </CardContent>
            </Card>
          </Link>

          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Investment Plans</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-white">Manage Plans</div>
              <p className="text-xs text-gray-400 mt-1">Create, edit, and manage investment plans</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="users" className="data-[state=active]:bg-red-600">
              Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-red-600">
              Transactions ({transactions.length})
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-red-600">
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">User Management</h2>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search users..." className="pl-10 bg-gray-800 border-gray-700 text-white" />
                </div>
                <Button variant="outline" className="border-gray-600">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {users.length === 0 ? (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="flex items-center justify-center p-8">
                    <div className="text-center">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">No users found</p>
                      <p className="text-gray-500 text-sm">Users will appear here once they register</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                users.map((user) => (
                  <Card key={user.id} className="bg-gray-800 border-gray-700">
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {user.first_name?.[0]}
                            {user.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                          <p className="text-gray-400 text-xs">
                            Joined: {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-white font-medium">${(user.total_invested || 0).toLocaleString()}</p>
                          <p className="text-gray-400 text-sm">Total Invested</p>
                        </div>
                        <Badge
                          variant={user.status === "active" ? "default" : "secondary"}
                          className={user.status === "active" ? "bg-green-600" : "bg-red-600"}
                        >
                          {user.status}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleUserAction(
                                user.id,
                                "update_status",
                                user.status === "active" ? "suspended" : "active",
                              )
                            }
                          >
                            {user.status === "active" ? "Suspend" : "Activate"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Transaction Management</h2>
              <div className="flex space-x-2">
                <Button variant="outline" className="border-gray-600">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" className="border-gray-600">
                  Filter
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {transactions.length === 0 ? (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="flex items-center justify-center p-8">
                    <div className="text-center">
                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">No transactions found</p>
                      <p className="text-gray-500 text-sm">
                        Transactions will appear here once users make deposits or withdrawals
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                transactions.map((transaction) => (
                  <Card key={transaction.id} className="bg-gray-800 border-gray-700">
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-2 rounded-full ${transaction.type === "deposit" ? "bg-green-600" : "bg-red-600"}`}
                        >
                          {transaction.type === "deposit" ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingUp className="h-4 w-4 rotate-180" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{transaction.user_name}</p>
                          <p className="text-gray-400 text-sm capitalize">{transaction.type}</p>
                          <p className="text-gray-400 text-xs">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p
                            className={`font-medium ${
                              transaction.type === "deposit" ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {transaction.amount} {transaction.currency}
                          </p>
                          <Badge
                            variant={transaction.status === "completed" ? "default" : "secondary"}
                            className={transaction.status === "completed" ? "bg-green-600" : "bg-yellow-600"}
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                        {transaction.status === "pending" && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleTransactionAction(transaction.id, "approve")}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-600 text-red-400"
                              onClick={() => handleTransactionAction(transaction.id, "reject")}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <h2 className="text-2xl font-bold">Reports & Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Generate Financial Report</CardTitle>
                  <CardDescription className="text-gray-400">
                    Export detailed financial data for accounting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate" className="text-white">
                        Start Date
                      </Label>
                      <Input id="startDate" type="date" className="bg-gray-700 border-gray-600 text-white" />
                    </div>
                    <div>
                      <Label htmlFor="endDate" className="text-white">
                        End Date
                      </Label>
                      <Input id="endDate" type="date" className="bg-gray-700 border-gray-600 text-white" />
                    </div>
                  </div>
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">User Activity Report</CardTitle>
                  <CardDescription className="text-gray-400">Track user engagement and activity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Report Type</Label>
                    <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                      <option>Daily Active Users</option>
                      <option>New Registrations</option>
                      <option>Investment Activity</option>
                      <option>Withdrawal Requests</option>
                    </select>
                  </div>
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
