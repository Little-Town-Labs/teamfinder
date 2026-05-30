import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/health(.*)",
  "/api/webhooks(.*)",
  "/bowling-centers/browse(.*)",
  "/bowling-centers/[id](.*)",
  "/api/bowling-centers(.*)", // Allow public access to view centers
])

// Define admin routes that require authentication
const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"])

const middleware = clerkMiddleware(async (auth, request) => {
  // Admin routes always require authentication
  // Detailed permission checking happens in the admin layout and API routes
  if (isAdminRoute(request)) {
    await auth.protect()
    return
  }

  // Other protected routes
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export default process.env.SKIP_CLERK_AUTH === "true" ? () => NextResponse.next() : middleware

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
