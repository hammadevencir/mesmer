import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyIdToken } from "@/lib/firebase/auth-server";
import { getAdminFirestore } from "@/lib/firebase/admin";

const SESSION_COOKIE_NAME = "mesmer_session";
const STORIES_COLLECTION = "stories";

/** Map Firestore story doc to a clean shape */
function mapStoryDoc(id, data) {
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

    let query = db.collection(STORIES_COLLECTION);

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
      console.warn("Falling back to unordered query for stories:", err.message);
      // Fallback without ordering in case index does not exist
      const snapshot = await db.collection(STORIES_COLLECTION).limit(200).get();
      docs = snapshot.docs;
      
      // Apply manual filter if needed
      if (categoryFilter === "Scheduled") {
        docs = docs.filter(doc => !!doc.data().isScheduled === true);
      } else {
        // Filter out scheduled stories unless explicitly requested
        docs = docs.filter(doc => !doc.data().isScheduled);
        
        if (categoryFilter && categoryFilter !== "All") {
          docs = docs.filter(
            (doc) => doc.data().category === categoryFilter
          );
        }
      }
    }

    const stories = docs
      .map((doc) => mapStoryDoc(doc.id, doc.data()))
      .filter((story) => {
        if (categoryFilter === "Scheduled") return story.isScheduled;
        return !story.isScheduled;
      });

    // Get category counts from ALL stories
    let allDocs = [];
    try {
      const allSnapshot = await db.collection(STORIES_COLLECTION).get();
      allDocs = allSnapshot.docs;
    } catch (err) {
      console.warn("Failed to fetch all stories for counts:", err.message);
    }

    const categoryCounts = {
      Scheduled: allDocs.filter(d => !!d.data()?.isScheduled).length,
    };
    allDocs.forEach((doc) => {
      const data = doc.data();
      if (data?.isScheduled) return; // Don't count scheduled in regular categories

      const cat = data?.category || "Uncategorized";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const categories = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count: String(count).padStart(2, "0"),
    }));

    return NextResponse.json({
      stories,
      categories,
      total: stories.length,
    });
  } catch (e) {
    console.error("CRITICAL: GET /api/admin/stories error:", e);
    return NextResponse.json(
      { error: e.message || "Failed to load stories" },
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

    const storyData = {
      content: body.content || "",
      category: body.category || "",
      date: body.date || "", // could be a specific date, or today
      isScheduled: !!body.isScheduled,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection(STORIES_COLLECTION).add(storyData);

    return NextResponse.json({
      id: docRef.id,
      ...storyData,
    });
  } catch (e) {
    console.error("POST /api/admin/stories error:", e);
    return NextResponse.json(
      { error: "Failed to create story" },
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
        { error: "Story ID is required" },
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

    await db.collection(STORIES_COLLECTION).doc(body.id).update(updateData);

    return NextResponse.json({ id: body.id, ...updateData });
  } catch (e) {
    console.error("PUT /api/admin/stories error:", e);
    return NextResponse.json(
      { error: "Failed to update story" },
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
    const storyId = searchParams.get("id");

    if (!storyId) {
      return NextResponse.json(
        { error: "Story ID is required" },
        { status: 400 },
      );
    }

    const db = getAdminFirestore();
    await db.collection(STORIES_COLLECTION).doc(storyId).delete();

    return NextResponse.json({ success: true, id: storyId });
  } catch (e) {
    console.error("DELETE /api/admin/stories error:", e);
    return NextResponse.json(
      { error: "Failed to delete story" },
      { status: 500 },
    );
  }
}
