import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/token";

const PUBLIC_PATHS = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = token ? await isValidToken(token) : false;

  if (!isAuthenticated && !PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthenticated && PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL("/projects", request.url));
  }

  return NextResponse.next();
}

async function isValidToken(token: string) {
  try {
    await verifySessionToken(token);
    return true;
  } catch {
    return false;
  }
}

export const config = {
  matcher: ["/", "/login", "/register", "/projects/:path*"],
};
