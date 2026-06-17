import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyIdToken } from "@/lib/firebase/auth-server";
import { getAdminFirestore } from "@/lib/firebase/admin";

const SESSION_COOKIE_NAME = "mesmer_session";
const USERS_COLLECTION = "users";

/** Format Firestore Timestamp, numeric timestamp, or ISO string to display date */
function formatOnboardingDate(value) {
  if (!value) return "—";
  try {
    if (value?.toDate) return value.toDate().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const d = new Date(value);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "—";
  }
}

/** Map Firestore user doc to table row shape */
function mapUserDoc(id, data) {
  return {
    id,
    name: data?.displayName || data?.name || data?.email?.split("@")[0] || "Guest User",
    email: data?.email ?? "—",
    lastMood: data?.stepOneFeeling ?? data?.lastMood ?? data?.lastMoodLabel ?? "—",
    onboardingDate: formatOnboardingDate(data?.createdAt ?? data?.onboardingDate),
    subscription: data?.subscription ?? data?.plan ?? "—",
  };
}

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
        .limit(100)
        .get();
    } catch {
      snapshot = await db.collection(USERS_COLLECTION).limit(100).get();
    }

    let total = snapshot.size;
    let totalSubscriptions = 0;
    let monthlyRevenue = 0;

    try {
      // Use efficient select to only grab necessary fields
      const allDocs = await db.collection(USERS_COLLECTION).select("subscription", "plan", "createdAt", "onboardingDate").get();
      total = allDocs.size;
      
      const aggregatedChartData = {};

      allDocs.forEach((doc) => {
        const d = doc.data();
        const plan = d.subscription || d.plan;
        
        let isSubbed = false;
        let rev = 0;
        if (plan && String(plan).toLowerCase() !== "free" && String(plan).toLowerCase() !== "none") {
          totalSubscriptions++;
          monthlyRevenue += 5.99; // Standard static pricing proxy
          isSubbed = true;
          rev = 5.99;
        }

        const rawDate = d.createdAt || d.onboardingDate;
        if (rawDate) {
          let dateObj;
          if (rawDate.toDate) {
            dateObj = rawDate.toDate();
          } else {
            dateObj = new Date(rawDate);
          }

          if (!isNaN(dateObj.getTime())) {
            const yearStr = dateObj.getFullYear().toString();
            const monthIdx = dateObj.getMonth();

            if (!aggregatedChartData[yearStr]) {
              aggregatedChartData[yearStr] = Array.from({ length: 12 }, (_, i) => ({
                month: String(i + 1).padStart(2, "0"),
                users: 0,
                earnings: 0,
              }));
            }

            aggregatedChartData[yearStr][monthIdx].users += 1;
            aggregatedChartData[yearStr][monthIdx].earnings += rev;
          }
        }
      });
      
      const usersResponse = snapshot.docs.map((doc) => mapUserDoc(doc.id, doc.data()));
      return NextResponse.json({ 
        users: usersResponse, 
        total, 
        totalSubscriptions, 
        monthlyRevenue,
        chartData: aggregatedChartData 
      });
    } catch {
      // Fallback
      total = snapshot.size;
      const usersResponse = snapshot.docs.map((doc) => mapUserDoc(doc.id, doc.data()));
      return NextResponse.json({ 
        users: usersResponse, 
        total, 
        totalSubscriptions, 
        monthlyRevenue,
        chartData: {} 
      });
    }
  } catch (e) {
    console.error("GET /api/admin/users error:", e);
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }
}
