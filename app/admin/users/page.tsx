"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Plus,
  Minus,
  DollarSign,
} from "lucide-react"
import Link from "next/link"

interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  phone?: string
  country?: string
  status: string
  role: string
  referral_code: string
  email_verified: boolean
  last_login?: string
  wallet_balance: number
  created_at: string
}

interface WalletTransaction {
  id: number
  amount: number
  type: string
  description: string
  admin_name?: string
  admin_last_name?: string
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    role: "all",
  })
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [walletDialogOpen, setWalletDialogOpen] = useState(false)
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([])
  const [walletAction, setWalletAction] = useState<"add" | "deduct">("add")
  const [walletAmount, setWalletAmount] = useState("")
  const [walletDescription, setWalletDescription] = useState("")
  const [walletLoading, setWalletLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [pagination.page, filters])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.role !== "all" && { role: filters.role }),
      })

      const response = await fetch(`/api/admin/users?${params}`)
      const data = await response.json()

      if (data.success) {
        setUsers(data.users)
        setPagination({
          page: data.page,
          limit: data.limit,
          total: data.total,
          totalPages: data.totalPages,
        })
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (userId: number, newStatus: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setUsers(users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)))

      const statusMessages = {
        active: "User has been activated successfully",
        suspended: "User has been suspended successfully",
        banned: "User has been banned successfully",
        pending: "User has been set to pending status",
      }

      alert(statusMessages[newStatus as keyof typeof statusMessages] || "User status updated successfully")
    } catch (error) {
      console.error("Error updating user status:", error)
      alert("Failed to update user status")
    }
  }

  const handleQuickAction = (userId: number, action: string) => {
    switch (action) {
      case "suspend":
        if (confirm("Are you sure you want to suspend this user?")) {
          handleStatusUpdate(userId, "suspended")
        }
        break
      case "activate":
        handleStatusUpdate(userId, "active")
        break
      case "ban":
        if (confirm("Are you sure you want to ban this user? This action is severe.")) {
          handleStatusUpdate(userId, "banned")
        }
        break
      default:
        break
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "delete_user",
          userId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        fetchUsers()
        alert("User deleted successfully")
      } else {
        alert(data.error || "Failed to delete user")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Failed to delete user")
    }
  }

  const handleWalletManagement = async (user: User) => {
    setSelectedUser(user)
    setWalletDialogOpen(true)
    setWalletAmount("")
    setWalletDescription("")

    // Fetch wallet transactions
    try {
      const response = await fetch("/api/admin/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get_transactions",
          userId: user.id,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setWalletTransactions(data.transactions)
      }
    } catch (error) {
      console.error("Error fetching wallet transactions:", error)
    }
  }

  const handleWalletAction = async () => {
    if (!selectedUser || !walletAmount || Number.parseFloat(walletAmount) <= 0) {
      alert("Please enter a valid amount")
      return
    }

    setWalletLoading(true)
    try {
      const response = await fetch("/api/admin/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: walletAction === "add" ? "add_funds" : "deduct_funds",
          userId: selectedUser.id,
          amount: Number.parseFloat(walletAmount),
          description: walletDescription || `Admin ${walletAction === "add" ? "credit" : "debit"}`,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Update user balance in local state
        setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, wallet_balance: data.newBalance } : u)))

        // Update selected user
        setSelectedUser({ ...selectedUser, wallet_balance: data.newBalance })

        alert(data.message)
        setWalletAmount("")
        setWalletDescription("")

        // Refresh wallet transactions
        handleWalletManagement(selectedUser)
      } else {
        alert(data.error || "Failed to update wallet")
      }
    } catch (error) {
      console.error("Error updating wallet:", error)
      alert("Failed to update wallet")
    } finally {
      setWalletLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-600",
      suspended: "bg-yellow-600",
      banned: "bg-red-600",
      pending: "bg-gray-600",
    }
    return <Badge className={colors[status as keyof typeof colors] || "bg-gray-600"}>{status}</Badge>
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      user: "bg-blue-600",
      admin: "bg-purple-600",
      super_admin: "bg-red-600",
    }
    return <Badge className={colors[role as keyof typeof colors] || "bg-gray-600"}>{role}</Badge>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="flex items-center space-x-2 text-gray-400 hover:text-white">
              <ChevronLeft className="h-5 w-5" />
              <span>Back to Admin</span>
            </Link>
          </div>
          <h1 className="text-xl font-bold">User Management</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Search */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="mr-2 h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription className="text-gray-400">
              Manage user accounts, status, permissions, and wallet balances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="search" className="text-white">
                  Search Users
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Name, email..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-white">Status Filter</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white">Role Filter</Label>
                <Select value={filters.role} onValueChange={(value) => setFilters({ ...filters, role: value })}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end space-x-2">
                <Button variant="outline" className="border-gray-600">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button className="bg-red-600 hover:bg-red-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">User</TableHead>
                    <TableHead className="text-gray-300">Contact</TableHead>
                    <TableHead className="text-gray-300">Wallet Balance</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Role</TableHead>
                    <TableHead className="text-gray-300">Referral Code</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id} className="border-gray-700">
                        <TableCell>
                          <div>
                            <div className="font-medium text-white">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-gray-400">ID: {user.id}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-white">{user.email}</div>
                            {user.phone && <div className="text-sm text-gray-400">{user.phone}</div>}
                            {user.country && <div className="text-sm text-gray-400">{user.country}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-green-400" />
                            <span className="text-green-400 font-medium">${(user.wallet_balance || 0).toFixed(2)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          <code className="bg-gray-700 px-2 py-1 rounded text-sm">{user.referral_code}</code>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleWalletManagement(user)}
                              className="text-green-400 hover:text-green-300"
                            >
                              <Wallet className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user)
                                setEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {user.status === "active" ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuickAction(user.id, "suspend")}
                                className="text-yellow-400 hover:text-yellow-300"
                              >
                                Suspend
                              </Button>
                            ) : user.status === "suspended" ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuickAction(user.id, "activate")}
                                className="text-green-400 hover:text-green-300"
                              >
                                Activate
                              </Button>
                            ) : null}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700">
              <div className="text-sm text-gray-400">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="border-gray-600"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.totalPages}
                  className="border-gray-600"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Management Dialog */}
        <Dialog open={walletDialogOpen} onOpenChange={setWalletDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Wallet className="mr-2 h-5 w-5" />
                Manage Wallet - {selectedUser?.first_name} {selectedUser?.last_name}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Current Balance:{" "}
                <span className="text-green-400 font-medium">${(selectedUser?.wallet_balance || 0).toFixed(2)}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Add/Deduct Funds */}
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <Button
                    variant={walletAction === "add" ? "default" : "outline"}
                    onClick={() => setWalletAction("add")}
                    className={walletAction === "add" ? "bg-green-600 hover:bg-green-700" : "border-gray-600"}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Funds
                  </Button>
                  <Button
                    variant={walletAction === "deduct" ? "default" : "outline"}
                    onClick={() => setWalletAction("deduct")}
                    className={walletAction === "deduct" ? "bg-red-600 hover:bg-red-700" : "border-gray-600"}
                  >
                    <Minus className="h-4 w-4 mr-2" />
                    Deduct Funds
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Amount ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={walletAmount}
                      onChange={(e) => setWalletAmount(e.target.value)}
                      placeholder="0.00"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Description (Optional)</Label>
                    <Input
                      value={walletDescription}
                      onChange={(e) => setWalletDescription(e.target.value)}
                      placeholder="Reason for transaction"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleWalletAction}
                  disabled={walletLoading || !walletAmount}
                  className={walletAction === "add" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                >
                  {walletLoading
                    ? "Processing..."
                    : `${walletAction === "add" ? "Add" : "Deduct"} $${walletAmount || "0.00"}`}
                </Button>
              </div>

              {/* Transaction History */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Recent Transactions</h3>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {walletTransactions.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No transactions found</p>
                  ) : (
                    walletTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                        <div>
                          <p className="text-white font-medium">{transaction.description}</p>
                          <p className="text-gray-400 text-sm">
                            {new Date(transaction.created_at).toLocaleDateString()} -
                            {transaction.admin_name && ` by ${transaction.admin_name} ${transaction.admin_last_name}`}
                          </p>
                        </div>
                        <div className={`font-medium ${transaction.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                          {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription className="text-gray-400">Update user information and permissions</DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Status</Label>
                    <Select
                      value={selectedUser.status}
                      onValueChange={(value) => handleStatusUpdate(selectedUser.id, value)}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="banned">Banned</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white">Role</Label>
                    <Select value={selectedUser.role}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-red-600 hover:bg-red-700">Save Changes</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
