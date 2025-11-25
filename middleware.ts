import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/pricing(.*)",
  "/plan/(.*)",
  "/api/webhooks/(.*)",
]);

// Define admin routes that require admin role
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes without authentication
  if (isPublicRoute(req)) {
    return;
  }

  // Protect all other routes
  const { userId, sessionClaims } = await auth.protect();

  // Check admin access for admin routes
  if (isAdminRoute(req)) {
    const role = sessionClaims?.metadata?.role;
    if (role !== "admin") {
      return Response.redirect(new URL("/dashboard", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
