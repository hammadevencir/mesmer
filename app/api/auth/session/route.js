import { NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/firebase/auth-server";

const SESSION_COOKIE_NAME = "mesmer_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 5; // 5 days (client can refresh token via this endpoint)

export async function POST(request) {
  try {
    const body = await request.json();
    const token = body?.token || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const decoded = await verifyIdToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    return response;
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
