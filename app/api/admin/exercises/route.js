import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionCookie } from "@/lib/firebase/auth-server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import {
  normalizeCategoryName,
  orderForCategory,
  sanitizeCategoryOrders,
} from "@/lib/categories";

const SESSION_COOKIE_NAME = "mesmer_session";
const EXERCISES_COLLECTION = "exercises";
/** Maximum exercises allowed with `isOnBoarding: true` at once */
const MAX_ONBOARDING_EXERCISES = 3;
/** Maximum exercises in the Home screen triage list at once */
const MAX_TRIAGE_EXERCISES = 4;

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
    // Per-category positions; `order` stays the default for any category
    // with no explicit override. See lib/categories.js.
    categoryOrders:
      data?.categoryOrders && typeof data.categoryOrders === "object"
        ? data.categoryOrders
        : {},
    isDraft: data?.isDraft ?? false,
    isOnBoarding: data?.isOnBoarding === true,
    // Position in the onboarding flow (0 = shown first). null when the
    // exercise isn't in onboarding or predates explicit ordering.
    onboardingOrder: Number.isFinite(data?.onboardingOrder)
      ? data.onboardingOrder
      : null,
    // Home screen triage: the ordered list shown when a user taps Calm or
    // Stress & Overthinking. Any category can be in it. triageOrder is the
    // 1-based position; null when not in triage.
    isTriage: data?.isTriage === true,
    triageOrder: Number.isFinite(data?.triageOrder) ? data.triageOrder : null,
  };
}

function compareTriageOrder(a, b) {
  const pos = (ex) =>
    Number.isFinite(ex.triageOrder) ? ex.triageOrder : Infinity;
  return (
    pos(a) - pos(b) || String(a.title).localeCompare(String(b.title))
  );
}

/** Current triage exercises, in order. */
async function getTriageExercises(db) {
  const snapshot = await db
    .collection(EXERCISES_COLLECTION)
    .where("isTriage", "==", true)
    .get();
  return snapshot.docs
    .map((d) => mapExerciseDoc(d.id, d.data()))
    .sort(compareTriageOrder);
}

/** Write triageOrder 1..n for `ids` so positions never have gaps. */
async function writeTriageOrder(db, ids) {
  if (!ids.length) return;
  const batch = db.batch();
  ids.forEach((id, index) => {
    batch.update(db.collection(EXERCISES_COLLECTION).doc(id), {
      triageOrder: index + 1,
    });
  });
  await batch.commit();
}

/** Sort onboarding exercises by explicit position, then title. */
function compareOnboardingOrder(a, b) {
  const pos = (ex) =>
    Number.isFinite(ex.onboardingOrder) ? ex.onboardingOrder : Infinity;
  return (
    pos(a) - pos(b) || String(a.title).localeCompare(String(b.title))
  );
}

/** Next free onboarding position, i.e. one after the current last one. */
async function nextOnboardingOrder(db, excludeDocId = null) {
  const snapshot = await db
    .collection(EXERCISES_COLLECTION)
    .where("isOnBoarding", "==", true)
    .get();
  let max = -1;
  snapshot.docs.forEach((d) => {
    if (d.id === excludeDocId) return;
    const n = d.data()?.onboardingOrder;
    if (Number.isFinite(n) && n > max) max = n;
  });
  return Math.max(max + 1, snapshot.docs.length);
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

    const exercises = (
      categoryFilter
        ? allExercises.filter(
            (ex) =>
              ex.categoryNames.includes(categoryFilter) ||
              ex.categoryName === categoryFilter,
          )
        : allExercises
    )
      .slice()
      // With a category selected, order within that category; otherwise
      // fall back to the exercise default order.
      .sort(
        (a, b) =>
          orderForCategory(a, categoryFilter) -
            orderForCategory(b, categoryFilter) ||
          String(a.title).localeCompare(String(b.title)),
      );

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

    // Every onboarding exercise in the order the app shows them, regardless
    // of the category filter.
    const onboardingExercises = allExercises
      .filter((ex) => ex.isOnBoarding)
      .sort(compareOnboardingOrder);

    const triageExercises = allExercises
      .filter((ex) => ex.isTriage)
      .sort(compareTriageOrder);

    return NextResponse.json({
      exercises,
      categories,
      total: exercises.length,
      onboardingCount,
      onboardingExercises,
      maxOnboardingExercises: MAX_ONBOARDING_EXERCISES,
      triageExercises,
      maxTriageExercises: MAX_TRIAGE_EXERCISES,
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
      categoryOrders: sanitizeCategoryOrders(body.categoryOrders, categoryNames),
      isDraft: body.isDraft ?? false,
      isOnBoarding,
      onboardingOrder: isOnBoarding ? await nextOnboardingOrder(db) : null,
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
      categoryOrders: sanitizeCategoryOrders(body.categoryOrders, categoryNames),
      isDraft: body.isDraft ?? false,
      isOnBoarding,
      updatedAt: new Date().toISOString(),
    };

    // Keep the existing onboarding position on ordinary edits; append newly
    // added exercises to the end; clear it when removed from onboarding.
    const existing = await db
      .collection(EXERCISES_COLLECTION)
      .doc(body.id)
      .get();
    const wasOnBoarding = existing.data()?.isOnBoarding === true;
    if (!isOnBoarding) {
      updateData.onboardingOrder = null;
    } else if (!wasOnBoarding) {
      updateData.onboardingOrder = await nextOnboardingOrder(db, body.id);
    }

    // Triage is only touched when the caller sends `isTriage` (the card
    // switch) — the edit dialog doesn't, so editing keeps the triage slot.
    // Drafts aren't shown to users, so a draft always leaves triage.
    const wasTriage = existing.data()?.isTriage === true;
    const wantTriage =
      updateData.isDraft !== true &&
      (body.isTriage !== undefined ? body.isTriage === true : wasTriage);
    let triageAfter = null; // ids to renumber after the write
    if (wantTriage && !wasTriage) {
      const current = await getTriageExercises(db);
      if (current.length >= MAX_TRIAGE_EXERCISES) {
        return NextResponse.json(
          {
            error: `Home triage holds ${MAX_TRIAGE_EXERCISES} exercises. Remove one from triage first.`,
          },
          { status: 400 },
        );
      }
      updateData.isTriage = true;
      triageAfter = [...current.map((ex) => ex.id), body.id];
    } else if (!wantTriage && wasTriage) {
      updateData.isTriage = false;
      updateData.triageOrder = null;
      triageAfter = (await getTriageExercises(db))
        .map((ex) => ex.id)
        .filter((id) => id !== body.id);
    }

    await db
      .collection(EXERCISES_COLLECTION)
      .doc(body.id)
      .update(updateData);
    if (triageAfter) await writeTriageOrder(db, triageAfter);

    return NextResponse.json({ id: body.id, ...updateData });
  } catch (e) {
    console.error("PUT /api/admin/exercises error:", e);
    return NextResponse.json(
      { error: "Failed to update exercise" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/admin/exercises
 * Body: { onboardingOrder: [exerciseId, ...] } or { triageOrder: [...] } —
 * saves the order in which onboarding / Home triage exercises are shown
 * (first id = shown first). Must list every exercise currently in it.
 */
export async function PATCH(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const decoded = token ? await verifySessionCookie(token) : null;
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const isTriage = Array.isArray(body.triageOrder);
    const field = isTriage ? "triageOrder" : "onboardingOrder";
    const ids = Array.isArray(body[field])
      ? body[field].filter((id) => typeof id === "string" && id)
      : null;
    if (!ids || new Set(ids).size !== ids.length) {
      return NextResponse.json(
        { error: `${field} must be a list of unique exercise IDs` },
        { status: 400 },
      );
    }

    const db = getAdminFirestore();
    const snapshot = await db
      .collection(EXERCISES_COLLECTION)
      .where(isTriage ? "isTriage" : "isOnBoarding", "==", true)
      .get();
    const currentIds = new Set(snapshot.docs.map((d) => d.id));
    if (
      ids.length !== currentIds.size ||
      ids.some((id) => !currentIds.has(id))
    ) {
      return NextResponse.json(
        {
          error: `The ${isTriage ? "triage" : "onboarding"} exercises changed since this page loaded. Refresh and try again.`,
        },
        { status: 409 },
      );
    }

    const batch = db.batch();
    const updatedAt = new Date().toISOString();
    ids.forEach((id, index) => {
      batch.update(db.collection(EXERCISES_COLLECTION).doc(id), {
        // Onboarding positions are 0-based, triage positions 1-based.
        [field]: isTriage ? index + 1 : index,
        updatedAt,
      });
    });
    await batch.commit();

    return NextResponse.json({ success: true, [field]: ids });
  } catch (e) {
    console.error("PATCH /api/admin/exercises error:", e);
    return NextResponse.json(
      { error: "Failed to save order" },
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
    // Close the gap if a triage exercise was deleted.
    await writeTriageOrder(
      db,
      (await getTriageExercises(db)).map((ex) => ex.id),
    );

    return NextResponse.json({ success: true, id: exerciseId });
  } catch (e) {
    console.error("DELETE /api/admin/exercises error:", e);
    return NextResponse.json(
      { error: "Failed to delete exercise" },
      { status: 500 },
    );
  }
}
