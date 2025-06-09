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
import { Textarea } from "@/components/ui/textarea"
import { Search, ChevronLeft, ChevronRight, Download, Eye, CheckCircle, XCircle, Filter, ImageIcon } from "lucide-react"
import Link from "next/link"

interface Transaction {
  id: number
  user_id: number
  type: string
  amount: number
  currency: string
  status: string
  transaction_hash?: string
  wallet_address?: string
  fee: number
  notes?: string
  admin_notes?: string
  processed_by?: number
  processed_at?: string
  created_at: string
  updated_at: string
  user_name?: string
  user_email?: string
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [filters, setFilters] = useState({
    search: "",
    status: "pending",
    type: "all",
    currency: "all",
  })
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [screenshotDialogOpen, setScreenshotDialogOpen] = useState(false)

  useEffect(() => {
    fetchTransactions()
  }, [pagination.page, filters])

  // Mock data for demonstration
  const mockTransactions: Transaction[] = [
    {
      id: 1,
      user_id: 2,
      type: "deposit",
      amount: 0.1,
      currency: "BTC",
      status: "pending",
      fee: 0,
      created_at: "2024-01-20T10:15:30Z",
      updated_at: "2024-01-20T10:15:30Z",
      user_name: "John Doe",
      user_email: "john@example.com",
      notes: "Deposit via BTC network",
    },
    {
      id: 2,
      user_id: 3,
      type: "withdrawal",
      amount: 0.05,
      currency: "BTC",
      status: "pending",
      wallet_address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      fee: 0.0005,
      created_at: "2024-01-20T09:45:22Z",
      updated_at: "2024-01-20T09:45:22Z",
      user_name: "Jane Smith",
      user_email: "jane@example.com",
      notes: "Withdrawal to external wallet",
    },
    {
      id: 3,
      user_id: 4,
      type: "deposit",
      amount: 500,
      currency: "USDT",
      status: "completed",
      fee: 0,
      created_at: "2024-01-19T14:22:10Z",
      updated_at: "2024-01-19T15:05:45Z",
      processed_by: 1,
      processed_at: "2024-01-19T15:05:45Z",
      user_name: "Mike Johnson",
      user_email: "mike@example.com",
      notes: "Deposit via TRC20",
      admin_notes: "Verified and approved",
    },
    {
      id: 4,
      user_id: 2,
      type: "withdrawal",
      amount: 0.2,
      currency: "ETH",
      status: "rejected",
      wallet_address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      fee: 0.005,
      created_at: "2024-01-18T16:30:00Z",
      updated_at: "2024-01-18T17:15:20Z",
      processed_by: 1,
      processed_at: "2024-01-18T17:15:20Z",
      user_name: "John Doe",
      user_email: "john@example.com",
      notes: "Withdrawal to external wallet",
      admin_notes: "Suspicious activity detected",
    },
  ]

  const fetchTransactions = async () => {
    try {
      setLoading(true)

      // Simulate API response with mock data
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Filter mock data based on filters
      let filteredTransactions = [...mockTransactions]

      if (filters.status !== "all") {
        filteredTransactions = filteredTransactions.filter((t) => t.status === filters.status)
      }

      if (filters.type !== "all") {
        filteredTransactions = filteredTransactions.filter((t) => t.type === filters.type)
      }

      if (filters.currency !== "all") {
        filteredTransactions = filteredTransactions.filter((t) => t.currency === filters.currency)
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredTransactions = filteredTransactions.filter(
          (t) =>
            t.user_name?.toLowerCase().includes(searchLower) ||
            t.user_email?.toLowerCase().includes(searchLower) ||
            t.wallet_address?.toLowerCase().includes(searchLower) ||
            t.id.toString().includes(searchLower),
        )
      }

      setTransactions(filteredTransactions)
      setPagination({
        ...pagination,
        total: filteredTransactions.length,
        totalPages: Math.ceil(filteredTransactions.length / pagination.limit),
      })
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveTransaction = async () => {
    if (!selectedTransaction) return

    setIsProcessing(true)

    try {
      // In a real implementation, this would be an API call
      // const response = await fetch("/api/admin/transactions/approve", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     transactionId: selectedTransaction.id,
      //     adminNotes: adminNotes,
      //   }),
      // });
      // const data = await response.json();

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update the transaction in the local state
      setTransactions(
        transactions.map((t) =>
          t.id === selectedTransaction.id
            ? {
                ...t,
                status: "completed",
                admin_notes: adminNotes,
                processed_at: new Date().toISOString(),
                processed_by: 1, // Admin ID
              }
            : t,
        ),
      )

      // If this is a deposit, we would also update the user's balance
      if (selectedTransaction.type === "deposit") {
        // In a real app, this would update the user's wallet balance
        console.log(
          `User ${selectedTransaction.user_id} balance updated: +${selectedTransaction.amount} ${selectedTransaction.currency}`,
        )
      }

      alert(`Transaction #${selectedTransaction.id} has been approved successfully.`)
      setApproveDialogOpen(false)
      setAdminNotes("")
    } catch (error) {
      console.error("Error approving transaction:", error)
      alert("Failed to approve transaction")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectTransaction = async () => {
    if (!selectedTransaction) return

    if (!adminNotes.trim()) {
      alert("Please provide a reason for rejection")
      return
    }

    setIsProcessing(true)

    try {
      // In a real implementation, this would be an API call
      // const response = await fetch("/api/admin/transactions/reject", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     transactionId: selectedTransaction.id,
      //     adminNotes: adminNotes,
      //   }),
      // });
      // const data = await response.json();

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update the transaction in the local state
      setTransactions(
        transactions.map((t) =>
          t.id === selectedTransaction.id
            ? {
                ...t,
                status: "rejected",
                admin_notes: adminNotes,
                processed_at: new Date().toISOString(),
                processed_by: 1, // Admin ID
              }
            : t,
        ),
      )

      alert(`Transaction #${selectedTransaction.id} has been rejected.`)
      setRejectDialogOpen(false)
      setAdminNotes("")
    } catch (error) {
      console.error("Error rejecting transaction:", error)
      alert("Failed to reject transaction")
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-600",
      completed: "bg-green-600",
      rejected: "bg-red-600",
      failed: "bg-gray-600",
      cancelled: "bg-gray-600",
    }
    return <Badge className={colors[status as keyof typeof colors] || "bg-gray-600"}>{status}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      deposit: "bg-green-600",
      withdrawal: "bg-blue-600",
      earning: "bg-purple-600",
      bonus: "bg-orange-600",
      referral: "bg-indigo-600",
    }
    return <Badge className={colors[type as keyof typeof colors] || "bg-gray-600"}>{type}</Badge>
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
          <h1 className="text-xl font-bold">Transaction Management</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Search */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Transaction Filters
            </CardTitle>
            <CardDescription className="text-gray-400">Filter and search through transaction records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <div>
                <Label htmlFor="search" className="text-white">
                  Search
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="ID, user, address..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-white">Status</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white">Type</Label>
                <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                    <SelectItem value="earning">Earning</SelectItem>
                    <SelectItem value="bonus">Bonus</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white">Currency</Label>
                <Select value={filters.currency} onValueChange={(value) => setFilters({ ...filters, currency: value })}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="All Currencies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Currencies</SelectItem>
                    <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                    <SelectItem value="USDT">Tether (USDT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end space-x-2">
                <Button variant="outline" className="border-gray-600">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">ID</TableHead>
                    <TableHead className="text-gray-300">User</TableHead>
                    <TableHead className="text-gray-300">Type</TableHead>
                    <TableHead className="text-gray-300">Amount</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Date</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                        Loading transactions...
                      </TableCell>
                    </TableRow>
                  ) : transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction.id} className="border-gray-700">
                        <TableCell className="font-medium text-white">#{transaction.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="text-white">{transaction.user_name}</div>
                            <div className="text-sm text-gray-400">{transaction.user_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                        <TableCell>
                          <div className="font-medium text-white">
                            {transaction.amount} {transaction.currency}
                          </div>
                          {transaction.fee > 0 && (
                            <div className="text-xs text-gray-400">
                              Fee: {transaction.fee} {transaction.currency}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell className="text-gray-400">
                          {new Date(transaction.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedTransaction(transaction)
                                setDetailsDialogOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            {transaction.type === "deposit" && transaction.status === "pending" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-400 hover:text-green-300"
                                onClick={() => {
                                  setSelectedTransaction(transaction)
                                  setApproveDialogOpen(true)
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}

                            {transaction.status === "pending" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300"
                                onClick={() => {
                                  setSelectedTransaction(transaction)
                                  setRejectDialogOpen(true)
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}

                            {transaction.type === "deposit" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-400 hover:text-blue-300"
                                onClick={() => {
                                  setSelectedTransaction(transaction)
                                  setScreenshotDialogOpen(true)
                                }}
                              >
                                <ImageIcon className="h-4 w-4" />
                              </Button>
                            )}
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
                Showing {transactions.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} transactions
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

        {/* Transaction Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription className="text-gray-400">
                Complete information about this transaction
              </DialogDescription>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Transaction ID</Label>
                    <div className="text-white">#{selectedTransaction.id}</div>
                  </div>
                  <div>
                    <Label className="text-gray-400">Status</Label>
                    <div>{getStatusBadge(selectedTransaction.status)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Type</Label>
                    <div>{getTypeBadge(selectedTransaction.type)}</div>
                  </div>
                  <div>
                    <Label className="text-gray-400">Amount</Label>
                    <div className="text-white">
                      {selectedTransaction.amount} {selectedTransaction.currency}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">User</Label>
                    <div className="text-white">{selectedTransaction.user_name}</div>
                    <div className="text-sm text-gray-400">{selectedTransaction.user_email}</div>
                  </div>
                  <div>
                    <Label className="text-gray-400">Date</Label>
                    <div className="text-white">{new Date(selectedTransaction.created_at).toLocaleString()}</div>
                  </div>
                </div>

                {selectedTransaction.wallet_address && (
                  <div>
                    <Label className="text-gray-400">Wallet Address</Label>
                    <div className="text-white break-all">{selectedTransaction.wallet_address}</div>
                  </div>
                )}

                {selectedTransaction.transaction_hash && (
                  <div>
                    <Label className="text-gray-400">Transaction Hash</Label>
                    <div className="text-white break-all">{selectedTransaction.transaction_hash}</div>
                  </div>
                )}

                {selectedTransaction.notes && (
                  <div>
                    <Label className="text-gray-400">Notes</Label>
                    <div className="text-white">{selectedTransaction.notes}</div>
                  </div>
                )}

                {selectedTransaction.admin_notes && (
                  <div>
                    <Label className="text-gray-400">Admin Notes</Label>
                    <div className="text-white">{selectedTransaction.admin_notes}</div>
                  </div>
                )}

                {selectedTransaction.processed_at && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-400">Processed By</Label>
                      <div className="text-white">Admin #{selectedTransaction.processed_by}</div>
                    </div>
                    <div>
                      <Label className="text-gray-400">Processed At</Label>
                      <div className="text-white">{new Date(selectedTransaction.processed_at).toLocaleString()}</div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Approve Transaction Dialog */}
        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Approve Transaction</DialogTitle>
              <DialogDescription className="text-gray-400">
                Confirm that you want to approve this transaction
              </DialogDescription>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-4">
                <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Transaction ID:</span>
                    <span className="text-white">#{selectedTransaction.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white capitalize">{selectedTransaction.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-white">
                      {selectedTransaction.amount} {selectedTransaction.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">User:</span>
                    <span className="text-white">{selectedTransaction.user_name}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-notes" className="text-white">
                    Admin Notes (Optional)
                  </Label>
                  <Textarea
                    id="admin-notes"
                    placeholder="Add notes about this transaction"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleApproveTransaction}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Approve Transaction"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Transaction Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Reject Transaction</DialogTitle>
              <DialogDescription className="text-gray-400">
                Confirm that you want to reject this transaction
              </DialogDescription>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-4">
                <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Transaction ID:</span>
                    <span className="text-white">#{selectedTransaction.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white capitalize">{selectedTransaction.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-white">
                      {selectedTransaction.amount} {selectedTransaction.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">User:</span>
                    <span className="text-white">{selectedTransaction.user_name}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reject-notes" className="text-white">
                    Reason for Rejection (Required)
                  </Label>
                  <Textarea
                    id="reject-notes"
                    placeholder="Please provide a reason for rejecting this transaction"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700"
                    onClick={handleRejectTransaction}
                    disabled={isProcessing || !adminNotes.trim()}
                  >
                    {isProcessing ? "Processing..." : "Reject Transaction"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Screenshot Dialog */}
        <Dialog open={screenshotDialogOpen} onOpenChange={setScreenshotDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Transaction Screenshot</DialogTitle>
              <DialogDescription className="text-gray-400">View the uploaded proof of payment</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                <ImageIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-400">Screenshot would be displayed here</p>
                <p className="text-sm text-gray-500 mt-2">
                  In a real implementation, this would show the uploaded image
                </p>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setScreenshotDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
