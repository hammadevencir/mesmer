import { NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/firebase/auth-server";
import { buildSubscriptionGiftUrl } from "@/lib/subscription/link-token";
import { getAppBaseUrl } from "@/lib/subscription/app-url";

/**
 * Authenticated endpoint for the mobile app to generate a gift subscription link.
 * The beneficiary user must provide their Firebase ID token.
 */
export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return NextResponse.json({ error: "Missing authorization token" }, { status: 401 });
    }

    const decoded = await verifyIdToken(token);
    if (!decoded?.uid) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const baseUrl = getAppBaseUrl(body?.baseUrl);
    const url = buildSubscriptionGiftUrl(decoded.uid, baseUrl);

    return NextResponse.json({ url, userId: decoded.uid });
  } catch (e) {
    console.error("POST /api/subscribe/link error:", e);
    return NextResponse.json({ error: e.message || "Failed to create link" }, { status: 500 });
  }
}
