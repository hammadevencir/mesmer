import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyIdToken } from "@/lib/firebase/auth-server";
import { getAdminFirestore } from "@/lib/firebase/admin";

const SESSION_COOKIE_NAME = "mesmer_session";
const USERS_COLLECTION = "users";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const decoded = token ? await verifyIdToken(token) : null;
    
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminFirestore();
    let snapshot;
    try {
      snapshot = await db
        .collection(USERS_COLLECTION)
        .orderBy("createdAt", "desc")
        .limit(10)
        .get();
    } catch {
      // fallback
      snapshot = await db.collection(USERS_COLLECTION).limit(10).get();
    }

    const notifications = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const plan = data?.subscription || data?.plan;
      const isSub = plan && String(plan).toLowerCase() !== "free" && String(plan).toLowerCase() !== "none";
      const name = data?.displayName ?? data?.name ?? data?.email?.split("@")[0] ?? "Someone";
      
      let message = `New user ${name} has signed up.`;
      if (isSub) {
        message = `New subscription! ${name} has subscribed.`;
      }
      
      notifications.push({
        id: doc.id,
        title: isSub ? "New Subscription" : "New User",
        message,
        timestamp: data.createdAt || data.onboardingDate || Date.now(),
        type: isSub ? "subscription" : "user",
      });
    });

    return NextResponse.json({ notifications });
  } catch (e) {
    console.error("GET /api/admin/notifications error:", e);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
