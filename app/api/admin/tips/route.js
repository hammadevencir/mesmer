import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyIdToken } from "@/lib/firebase/auth-server";
import { getAdminFirestore } from "@/lib/firebase/admin";

const SESSION_COOKIE_NAME = "mesmer_session";
const TIPS_COLLECTION = "tips";

/** Map Firestore tip doc to a clean shape */
function mapTipDoc(id, data) {
  return {
    id,
    content: data?.content ?? "",
    category: data?.category ?? "—",
    date: data?.date ?? "",
    isScheduled: !!data?.isScheduled,
    createdAt: data?.createdAt ?? "",
  };
}

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const decoded = token ? await verifyIdToken(token) : null;
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminFirestore();
    const { searchParams } = new URL(request.url);
    const categoryFilter = searchParams.get("category");

    let query = db.collection(TIPS_COLLECTION);

    if (categoryFilter === "Scheduled") {
      query = query.where("isScheduled", "==", true);
    } else if (categoryFilter && categoryFilter !== "All") {
      query = query.where("category", "==", categoryFilter);
    }

    let docs = [];
    try {
      const snapshot = await query.orderBy("createdAt", "desc").limit(200).get();
      docs = snapshot.docs;
    } catch (err) {
      console.warn("Falling back to unordered query for tips:", err.message);
      const snapshot = await db.collection(TIPS_COLLECTION).limit(200).get();
      docs = snapshot.docs;
    }

    const tips = docs
      .map((doc) => mapTipDoc(doc.id, doc.data()))
      .filter((tip) => {
        if (categoryFilter === "Scheduled") return tip.isScheduled;
        
        // Apply manual category filter because the Firestore query might have fallen back
        if (categoryFilter && categoryFilter !== "All" && tip.category !== categoryFilter) {
          return false; // exclude if the category doesn't match
        }

        return !tip.isScheduled;
      })
      .sort((a, b) => {
        // Sort descending by createdAt to handle unordered fallbacks and maintain consistency
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });

    // Get category counts from ALL tips
    let allDocs = [];
    try {
      const allSnapshot = await db.collection(TIPS_COLLECTION).get();
      allDocs = allSnapshot.docs;
    } catch (err) {
      console.warn("Failed to fetch all tips for counts:", err.message);
    }

    const categoryCounts = {
      Scheduled: allDocs.filter(d => !!d.data()?.isScheduled).length,
    };
    allDocs.forEach((doc) => {
      const data = doc.data();
      if (data?.isScheduled) return;

      const cat = data?.category || "Uncategorized";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const categories = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count: String(count).padStart(2, "0"),
    }));

    return NextResponse.json({
      tips,
      categories,
      total: tips.length,
    });
  } catch (e) {
    console.error("CRITICAL: GET /api/admin/tips error:", e);
    return NextResponse.json(
      { error: e.message || "Failed to load tips" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const decoded = token ? await verifyIdToken(token) : null;
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const db = getAdminFirestore();

    const tipData = {
      content: body.content || "",
      category: body.category || "",
      date: body.date || "",
      isScheduled: !!body.isScheduled,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection(TIPS_COLLECTION).add(tipData);

    return NextResponse.json({
      id: docRef.id,
      ...tipData,
    });
  } catch (e) {
    console.error("POST /api/admin/tips error:", e);
    return NextResponse.json(
      { error: "Failed to create tip" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const decoded = token ? await verifyIdToken(token) : null;
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    if (!body.id) {
      return NextResponse.json(
        { error: "Tip ID is required" },
        { status: 400 },
      );
    }

    const db = getAdminFirestore();

    const updateData = {
      content: body.content || "",
      category: body.category || "",
      date: body.date || "",
      isScheduled: body.isScheduled !== undefined ? !!body.isScheduled : false,
      updatedAt: new Date().toISOString(),
    };

    await db.collection(TIPS_COLLECTION).doc(body.id).update(updateData);

    return NextResponse.json({ id: body.id, ...updateData });
  } catch (e) {
    console.error("PUT /api/admin/tips error:", e);
    return NextResponse.json(
      { error: "Failed to update tip" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const decoded = token ? await verifyIdToken(token) : null;
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tipId = searchParams.get("id");

    if (!tipId) {
      return NextResponse.json(
        { error: "Tip ID is required" },
        { status: 400 },
      );
    }

    const db = getAdminFirestore();
    await db.collection(TIPS_COLLECTION).doc(tipId).delete();

    return NextResponse.json({ success: true, id: tipId });
  } catch (e) {
    console.error("DELETE /api/admin/tips error:", e);
    return NextResponse.json(
      { error: "Failed to delete tip" },
      { status: 500 },
    );
  }
}
