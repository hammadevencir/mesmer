import { NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/firebase/auth-server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { verifySubscriptionLinkToken } from "@/lib/subscription/link-token";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");
    const exp = searchParams.get("exp");
    const sig = searchParams.get("sig");

    const verification = verifySubscriptionLinkToken(uid, exp, sig);
    if (!verification.valid) {
      return NextResponse.json({ error: "Invalid or expired link" }, { status: 403 });
    }

    const db = getAdminFirestore();
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data = userDoc.data();
    const displayName =
      data?.displayName || data?.name || data?.email?.split("@")[0] || "Mesmer user";

    return NextResponse.json({
      userId: uid,
      displayName,
      expiresAt: verification.expiresAt,
    });
  } catch (e) {
    console.error("GET /api/subscribe/user error:", e);
    return NextResponse.json({ error: "Failed to load user" }, { status: 500 });
  }
}
