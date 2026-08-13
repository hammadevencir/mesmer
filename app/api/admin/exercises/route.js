import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionCookie } from "@/lib/firebase/auth-server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { normalizeCategoryName } from "@/lib/categories";

const SESSION_COOKIE_NAME = "mesmer_session";
const EXERCISES_COLLECTION = "exercises";
/** Maximum exercises allowed with `isOnBoarding: true` at once */
const MAX_ONBOARDING_EXERCISES = 3;

/** Map Firestore exercise doc to a clean shape */
function mapExerciseDoc(id, data) {
  const categoryName = data?.categoryName ?? data?.category ?? "—";
  // categoryNames/categoryIds are the multi-select source of truth; fall
  // back to the single legacy fields for exercises created before
  // multi-select existed.
  const categoryNames = Array.isArray(data?.categoryNames)
    ? data.categoryNames
    : categoryName && categoryName !== "—"
      ? [categoryName]
      : [];
  const categoryIds = Array.isArray(data?.categoryIds)
    ? data.categoryIds
    : data?.categoryId
      ? [data.categoryId]
      : [];
  return {
    id,
    title: data?.title ?? "—",
    description: data?.description ?? "",
    image: data?.image ?? "",
    categoryId: data?.categoryId ?? "",
    categoryName,
    categoryIds,
    categoryNames,
    duration: data?.duration ?? 0,
    isMood: data?.isMood ?? false,
    listen: data?.listen ?? "",
    watch: data?.watch ?? "",
    read: data?.read ?? "",
    mesmerFact: data?.mesmerFact ?? "",
    theScience: data?.theScience ?? "",
    whatItIs: data?.whatItIs ?? "",
    whatYouDo: data?.whatYouDo ?? "",
    whenToUse: data?.whenToUse ?? "",
    result: data?.result ?? "",
    steps: Array.isArray(data?.steps) ? data.steps : [],
    order: data?.order ?? 0,
    isDraft: data?.isDraft ?? false,
    isOnBoarding: data?.isOnBoarding === true,
  };
}

/**
 * Other exercises (excluding `excludeDocId`) already marked onboarding.
 */
async function countOtherOnboardingExercises(db, excludeDocId = null) {
  const snapshot = await db
    .collection(EXERCISES_COLLECTION)
    .where("isOnBoarding", "==", true)
    .get();
  if (!excludeDocId) return snapshot.docs.length;
  return snapshot.docs.filter((d) => d.id !== excludeDocId).length;
}

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const decoded = token ? await verifySessionCookie(token) : null;
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminFirestore();
    const { searchParams } = new URL(request.url);
    const categoryFilter = searchParams.get("category");

    // Exercises can belong to several categories now, so filtering by a
    // single Firestore `where` clause can't express "matches any of these
    // tags" cleanly. The collection is small enough to read once and filter
    // in memory for both the list and the per-category counts.
    let snapshot;
    try {
      snapshot = await db.collection(EXERCISES_COLLECTION).limit(500).get();
    } catch {
      snapshot = { docs: [] };
    }

    const allExercises = snapshot.docs.map((doc) =>
      mapExerciseDoc(doc.id, doc.data()),
    );

    const exercises = categoryFilter
      ? allExercises.filter(
          (ex) =>
            ex.categoryNames.includes(categoryFilter) ||
            ex.categoryName === categoryFilter,
        )
      : allExercises;

    const categoryCounts = {};
    let onboardingCount = 0;
    allExercises.forEach((ex) => {
      const tags = ex.categoryNames.length
        ? ex.categoryNames
        : [normalizeCategoryName(ex.categoryName) || "Uncategorized"];
      tags.forEach((cat) => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
      if (ex.isOnBoarding) onboardingCount += 1;
    });

    const categories = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count: String(count).padStart(2, "0"),
    }));

    return NextResponse.json({
      exercises,
      categories,
      total: exercises.length,
      onboardingCount,
      maxOnboardingExercises: MAX_ONBOARDING_EXERCISES,
    });
  } catch (e) {
    console.error("GET /api/admin/exercises error:", e);
    return NextResponse.json(
      { error: "Failed to load exercises" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const decoded = token ? await verifySessionCookie(token) : null;
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const db = getAdminFirestore();
    const isOnBoarding = body.isOnBoarding === true;
    if (isOnBoarding) {
      const others = await countOtherOnboardingExercises(db);
      if (others >= MAX_ONBOARDING_EXERCISES) {
        return NextResponse.json(
          {
            error: `Only ${MAX_ONBOARDING_EXERCISES} exercises can be onboarding. Turn off onboarding on another exercise first.`,
          },
          { status: 400 },
        );
      }
    }

    const categoryNames = Array.isArray(body.categoryNames)
      ? body.categoryNames.filter(Boolean)
      : body.categoryName || body.category
        ? [body.categoryName || body.category]
        : [];
    const categoryIds = Array.isArray(body.categoryIds)
      ? body.categoryIds.filter(Boolean)
      : body.categoryId
        ? [body.categoryId]
        : [];

    const exerciseData = {
      title: body.title || "",
      description: body.description || "",
      image: body.image || "",
      categoryName: categoryNames[0] || "",
      categoryId: categoryIds[0] || "",
      categoryNames,
      categoryIds,
      duration: Number(body.duration) || 0,
      isMood: body.isMood ?? true,
      listen: body.listen || "",
      watch: body.watch || "",
      mesmerFact: body.mesmerFact || "",
      theScience: body.theScience || "",
      whatItIs: body.whatItIs || "",
      whatYouDo: body.whatYouDo || "",
      whenToUse: body.whenToUse || "",
      result: body.result || "",
      steps: Array.isArray(body.steps) ? body.steps : [],
      order: Number(body.order) || 0,
      isDraft: body.isDraft ?? false,
      isOnBoarding,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db
      .collection(EXERCISES_COLLECTION)
      .add(exerciseData);

    return NextResponse.json({
      id: docRef.id,
      ...exerciseData,
    });
  } catch (e) {
    console.error("POST /api/admin/exercises error:", e);
    return NextResponse.json(
      { error: "Failed to create exercise" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const decoded = token ? await verifySessionCookie(token) : null;
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    if (!body.id) {
      return NextResponse.json(
        { error: "Exercise ID is required" },
        { status: 400 },
      );
    }

    const db = getAdminFirestore();

    const isOnBoarding = body.isOnBoarding === true;
    if (isOnBoarding) {
      const others = await countOtherOnboardingExercises(db, body.id);
      if (others >= MAX_ONBOARDING_EXERCISES) {
        return NextResponse.json(
          {
            error: `Only ${MAX_ONBOARDING_EXERCISES} exercises can be onboarding. Turn off onboarding on another exercise first.`,
          },
          { status: 400 },
        );
      }
    }

    const categoryNames = Array.isArray(body.categoryNames)
      ? body.categoryNames.filter(Boolean)
      : body.categoryName || body.category
        ? [body.categoryName || body.category]
        : [];
    const categoryIds = Array.isArray(body.categoryIds)
      ? body.categoryIds.filter(Boolean)
      : body.categoryId
        ? [body.categoryId]
        : [];

    const updateData = {
      title: body.title || "",
      description: body.description || "",
      image: body.image || "",
      categoryName: categoryNames[0] || "",
      categoryId: categoryIds[0] || "",
      categoryNames,
      categoryIds,
      duration: Number(body.duration) || 0,
      isMood: body.isMood ?? true,
      listen: body.listen || "",
      watch: body.watch || "",
      // `read` is no longer collected by the form (it duplicated WHY/HOW/WHEN
      // + Steps content) — only touch it if the caller explicitly sent it,
      // so editing an exercise doesn't silently wipe an existing value.
      ...(body.read !== undefined && { read: body.read || "" }),
      mesmerFact: body.mesmerFact || "",
      theScience: body.theScience || "",
      whatItIs: body.whatItIs || "",
      whatYouDo: body.whatYouDo || "",
      whenToUse: body.whenToUse || "",
      result: body.result || "",
      steps: Array.isArray(body.steps) ? body.steps : [],
      order: Number(body.order) || 0,
      isDraft: body.isDraft ?? false,
      isOnBoarding,
      updatedAt: new Date().toISOString(),
    };

    await db
      .collection(EXERCISES_COLLECTION)
      .doc(body.id)
      .update(updateData);

    return NextResponse.json({ id: body.id, ...updateData });
  } catch (e) {
    console.error("PUT /api/admin/exercises error:", e);
    return NextResponse.json(
      { error: "Failed to update exercise" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const decoded = token ? await verifySessionCookie(token) : null;
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const exerciseId = searchParams.get("id");

    if (!exerciseId) {
      return NextResponse.json(
        { error: "Exercise ID is required" },
        { status: 400 },
      );
    }

    const db = getAdminFirestore();
    await db.collection(EXERCISES_COLLECTION).doc(exerciseId).delete();

    return NextResponse.json({ success: true, id: exerciseId });
  } catch (e) {
    console.error("DELETE /api/admin/exercises error:", e);
    return NextResponse.json(
      { error: "Failed to delete exercise" },
      { status: 500 },
    );
  }
}
