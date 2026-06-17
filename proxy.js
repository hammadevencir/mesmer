import { NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "mesmer_session";

/** Public admin routes (auth pages) — no session required */
const ADMIN_PUBLIC_PATHS = [
  "/admin/sign-in",
  "/admin/forget-password",
  "/admin/new-password",
  "/admin/otp",
];

function isAdminPublicPath(pathname) {
  return ADMIN_PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function hasSessionCookie(request) {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME);
  return cookie?.value != null && cookie.value.length > 0;
}

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const isPublic = isAdminPublicPath(pathname);
  const hasSession = hasSessionCookie(request);

  // Do not redirect from sign-in to /admin when a cookie exists: a stale cookie
  // would cause a loop (middleware → /admin → layout rejects token → sign-in → repeat).

  // Not logged in and trying to access a private admin page → redirect to sign-in
  if (!isPublic && !hasSession) {
    const signIn = new URL("/admin/sign-in", request.url);
    signIn.searchParams.set("from", pathname);
    return NextResponse.redirect(signIn);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
