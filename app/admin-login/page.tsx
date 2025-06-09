"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Zap } from "lucide-react"
import Link from "next/link"

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState("")
  const [password, setPassword] = useState("")

  const handleDirectLogin = async () => {
    setIsLoading(true)
    setStatus("Logging in...")

    try {
      const response = await fetch("/api/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: password || "admin123", // Default to admin123 if empty
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("Login successful! Redirecting...")
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = "/admin"
        }, 1000)
      } else {
        setStatus(`Error: ${data.error || "Login failed"}`)
      }
    } catch (error) {
      console.error("Login error:", error)
      setStatus(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <Zap className="h-8 w-8 text-red-500" />
            <span className="text-2xl font-bold text-white">Tesla Invest Admin</span>
          </Link>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Admin Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter admin password (default: admin123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                disabled={isLoading}
              />
            </div>

            <Button onClick={handleDirectLogin} className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
              {isLoading ? "Logging In..." : "Access Admin Panel"}
            </Button>

            {status && (
              <div
                className={`mt-4 p-3 rounded-md ${
                  status.includes("Error")
                    ? "bg-red-600/20 border border-red-600 text-red-400"
                    : status.includes("successful")
                      ? "bg-green-600/20 border border-green-600 text-green-400"
                      : "bg-blue-600/20 border border-blue-600 text-blue-400"
                }`}
              >
                <p className="text-sm">{status}</p>
              </div>
            )}

            <div className="mt-4 text-center">
              <p className="text-gray-400 text-sm">
                Return to{" "}
                <Link href="/login" className="text-red-400 hover:text-red-300">
                  regular login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
