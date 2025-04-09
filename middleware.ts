import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/about",
  "/pricing",
  "/api/webhook(.*)",
])

export default clerkMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: (req) => isPublicRoute(req),
  // Routes that can always be accessed, and have
  // no authentication information
  ignoredRoutes: ["/api/webhook(.*)"],
})

export const config = {
  // Protects all routes, including api/trpc.
  // See https://clerk.com/docs/references/nextjs/auth-middleware
  // for more information about configuring your middleware
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
