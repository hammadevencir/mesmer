import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyIdToken } from "@/lib/firebase/auth-server";
import { getAdminFirestore } from "@/lib/firebase/admin";

const SESSION_COOKIE_NAME = "mesmer_session";
const EXERCISES_COLLECTION = "exercises";
const TRACKS_COLLECTION = "tracks";

/** Number of exercises every track shows to the end user. */
const EXERCISES_PER_TRACK = 2;

/** Only these categories are configurable as tracks. */
const ALLOWED_CATEGORIES = ["calm", "stress & overthinking"];

function isAllowedCategory(name) {
  return ALLOWED_CATEGORIES.includes(String(name).trim().toLowerCase());
}

/** Turn a category name into a stable, Firestore-safe document id. */
function slugifyCategory(name) {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "uncategorized";
}

function categoryNameOf(data) {
  return data?.categoryName || data?.category || "Uncategorized";
}

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const decoded = token ? await verifyIdToken(token) : null;
  return decoded;
}

/**
 * GET /api/admin/tracks
 * Returns one entry per category ("track") with its saved config and the
 * live (non-draft) exercises the admin can choose from.
 */
export async function GET() {
  try {
    const decoded = await requireAdmin();
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminFirestore();

    const [exSnap, trackSnap] = await Promise.all([
      db.collection(EXERCISES_COLLECTION).get(),
      db.collection(TRACKS_COLLECTION).get(),
    ]);

    // Saved track configs keyed by category name.
    const configByCategory = {};
    trackSnap.docs.forEach((doc) => {
      const data = doc.data();
      if (data?.categoryName) configByCategory[data.categoryName] = data;
    });

    // Group live exercises by category name.
    const grouped = {};
    exSnap.docs.forEach((doc) => {
      const data = doc.data();
      if (data?.isDraft === true) return; // only live exercises are user-facing
      const cat = categoryNameOf(data);
      if (!isAllowedCategory(cat)) return; // only calm, stress, overthinking
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push({ id: doc.id, title: data?.title ?? "—" });
    });

    const tracks = Object.entries(grouped).map(([categoryName, exercises]) => {
      const cfg = configByCategory[categoryName];
      // Drop any saved picks that no longer point at a live exercise.
      const validIds = new Set(exercises.map((e) => e.id));
      const exercise1Id = validIds.has(cfg?.exercise1Id)
        ? cfg.exercise1Id
        : "";
      const exercise2Id = validIds.has(cfg?.exercise2Id)
        ? cfg.exercise2Id
        : "";
      return {
        categoryName,
        exercise1Id,
        exercise2Id,
        exercises,
        exerciseCount: exercises.length,
      };
    });

    tracks.sort((a, b) => a.categoryName.localeCompare(b.categoryName));

    return NextResponse.json({
      tracks,
      exercisesPerTrack: EXERCISES_PER_TRACK,
    });
  } catch (e) {
    console.error("GET /api/admin/tracks error:", e);
    return NextResponse.json(
      { error: "Failed to load tracks" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/admin/tracks
 * Body: { categoryName, exercise1Id, exercise2Id }
 * Both picks must be distinct live exercises in that category.
 */
export async function PUT(request) {
  try {
    const decoded = await requireAdmin();
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const categoryName = String(body?.categoryName || "").trim();

    if (!categoryName) {
      return NextResponse.json(
        { error: "categoryName is required" },
        { status: 400 },
      );
    }
    if (!isAllowedCategory(categoryName)) {
      return NextResponse.json(
        { error: "This category cannot be configured as a track." },
        { status: 400 },
      );
    }

    const db = getAdminFirestore();

    const exercise1Id = String(body?.exercise1Id || "").trim();
    const exercise2Id = String(body?.exercise2Id || "").trim();

    if (!exercise1Id || !exercise2Id) {
      return NextResponse.json(
        { error: `Pick ${EXERCISES_PER_TRACK} exercises for this track.` },
        { status: 400 },
      );
    }
    if (exercise1Id === exercise2Id) {
      return NextResponse.json(
        { error: "The two exercises must be different." },
        { status: 400 },
      );
    }

    // Both picks must exist, be live, and belong to this category.
    const snaps = await Promise.all([
      db.collection(EXERCISES_COLLECTION).doc(exercise1Id).get(),
      db.collection(EXERCISES_COLLECTION).doc(exercise2Id).get(),
    ]);
    for (const snap of snaps) {
      const data = snap.exists ? snap.data() : null;
      if (!data) {
        return NextResponse.json(
          { error: "Selected exercise no longer exists." },
          { status: 400 },
        );
      }
      if (data.isDraft === true) {
        return NextResponse.json(
          { error: "Selected exercise is a draft and cannot be used." },
          { status: 400 },
        );
      }
      if (categoryNameOf(data) !== categoryName) {
        return NextResponse.json(
          { error: "Selected exercise is not in this category." },
          { status: 400 },
        );
      }
    }

    const docId = slugifyCategory(categoryName);
    const trackData = {
      categoryName,
      exercise1Id,
      exercise2Id,
      updatedAt: new Date().toISOString(),
    };

    await db
      .collection(TRACKS_COLLECTION)
      .doc(docId)
      .set(trackData, { merge: true });

    return NextResponse.json({ id: docId, ...trackData });
  } catch (e) {
    console.error("PUT /api/admin/tracks error:", e);
    return NextResponse.json(
      { error: "Failed to save track" },
      { status: 500 },
    );
  }
}
