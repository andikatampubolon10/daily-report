import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

const publicRoutes = ["/login", "/api/auth/login", "/favicon.ico", "/globals.css"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for auth token
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    // Don't redirect if it's an API request, return 401 instead
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  const session = await decrypt(token);
  
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    // Clear invalid token
    const response = pathname.startsWith("/api/") 
      ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      : NextResponse.redirect(loginUrl);
    
    response.cookies.delete("auth_token");
    return response;
  }

  // Role-based authorization for specific routes
  const isManager = session.role === "MANAGER";
  
  if (pathname.startsWith("/monitoring") && !isManager) {
    // Employees cannot access monitoring pages
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Inject session info into headers so server components can read it if needed
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", session.userId);
  requestHeaders.set("x-user-role", session.role);
  requestHeaders.set("x-user-name", session.name);
  requestHeaders.set("x-user-email", session.email);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
