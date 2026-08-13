import { NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/firebase/auth-server";
import { getAdminAuth } from "@/lib/firebase/admin";

const SESSION_COOKIE_NAME = "mesmer_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 5; // 5 days
const SESSION_COOKIE_EXPIRES_IN_MS = COOKIE_MAX_AGE * 1000;

export async function POST(request) {
  try {
    const body = await request.json();
    const token = body?.token || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // Verify the freshly-issued ID token, then exchange it for a long-lived
    // session cookie. A raw ID token expires after 1 hour, so storing it
    // directly in a 5-day cookie (the old approach) meant every request
    // started failing auth an hour after sign-in.
    const decoded = await verifyIdToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const sessionCookie = await getAdminAuth().createSessionCookie(token, {
      expiresIn: SESSION_COOKIE_EXPIRES_IN_MS,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    return response;
  } catch (e) {
    console.error("POST /api/auth/session error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
