import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Skip middleware for these paths
  const publicPaths = [
    "/login",
    "/signup",
    "/setup-admin",
    "/admin-login",
    "/api/auth/login",
    "/api/admin-login",
    "/api/setup-admin",
  ]

  for (const path of publicPaths) {
    if (request.nextUrl.pathname.startsWith(path)) {
      return NextResponse.next()
    }
  }

  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const token = request.cookies.get("auth-token")?.value

    // If no token, redirect to admin login
    if (!token) {
      return NextResponse.redirect(new URL("/admin-login", request.url))
    }

    // Don't verify the token strictly - just check if it exists
    // This makes debugging easier
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
