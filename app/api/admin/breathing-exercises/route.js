import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyIdToken } from "@/lib/firebase/auth-server";
import { getAdminFirestore } from "@/lib/firebase/admin";

const SESSION_COOKIE_NAME = "mesmer_session";
const BREATHING_EXERCISES_COLLECTION = "breathingExercises";

function mapBreathingDoc(id, data) {
  return {
    id,
    title: data?.title ?? "",
    subTitle: data?.subTitle ?? "",
    cycleCount: Number(data?.cycleCount) || 0,
    breathInDuration: Number(data?.breathInDuration) || 0,
    breathOutDuration: Number(data?.breathOutDuration) || 0,
    sheetTitle: data?.sheetTitle ?? "",
    createdAt: data?.createdAt ?? "",
    updatedAt: data?.updatedAt ?? "",
  };
}

function payloadFromBody(body) {
  return {
    title: body.title?.trim() || "",
    subTitle: body.subTitle?.trim() || "",
    cycleCount: Math.max(0, Number(body.cycleCount) || 0),
    breathInDuration: Math.max(0, Number(body.breathInDuration) || 0),
    breathOutDuration: Math.max(0, Number(body.breathOutDuration) || 0),
    sheetTitle: body.sheetTitle?.trim() || "",
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
    let docs = [];
    try {
      const snapshot = await db
        .collection(BREATHING_EXERCISES_COLLECTION)
        .orderBy("createdAt", "desc")
        .limit(200)
        .get();
      docs = snapshot.docs;
    } catch (err) {
      console.warn("Falling back to unordered breathing exercises query:", err.message);
      const snapshot = await db
        .collection(BREATHING_EXERCISES_COLLECTION)
        .limit(200)
        .get();
      docs = snapshot.docs;
    }

    const exercises = docs
      .map((doc) => mapBreathingDoc(doc.id, doc.data()))
      .sort((a, b) => {
        const ta = new Date(b.createdAt || 0).getTime();
        const tb = new Date(a.createdAt || 0).getTime();
        return ta - tb;
      });

    return NextResponse.json({
      exercises,
      total: exercises.length,
    });
  } catch (e) {
    console.error("GET /api/admin/breathing-exercises error:", e);
    return NextResponse.json(
      { error: e.message || "Failed to load breathing exercises" },
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
    const now = new Date().toISOString();
    const exerciseData = {
      ...payloadFromBody(body),
      createdAt: now,
    };

    const docRef = await db
      .collection(BREATHING_EXERCISES_COLLECTION)
      .add(exerciseData);

    return NextResponse.json({
      id: docRef.id,
      ...exerciseData,
    });
  } catch (e) {
    console.error("POST /api/admin/breathing-exercises error:", e);
    return NextResponse.json(
      { error: "Failed to create breathing exercise" },
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
        { error: "Exercise ID is required" },
        { status: 400 },
      );
    }

    const db = getAdminFirestore();
    const updateData = {
      ...payloadFromBody(body),
      updatedAt: new Date().toISOString(),
    };

    await db
      .collection(BREATHING_EXERCISES_COLLECTION)
      .doc(body.id)
      .update(updateData);

    return NextResponse.json({ id: body.id, ...updateData });
  } catch (e) {
    console.error("PUT /api/admin/breathing-exercises error:", e);
    return NextResponse.json(
      { error: "Failed to update breathing exercise" },
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
    const exerciseId = searchParams.get("id");

    if (!exerciseId) {
      return NextResponse.json(
        { error: "Exercise ID is required" },
        { status: 400 },
      );
    }

    const db = getAdminFirestore();
    await db
      .collection(BREATHING_EXERCISES_COLLECTION)
      .doc(exerciseId)
      .delete();

    return NextResponse.json({ success: true, id: exerciseId });
  } catch (e) {
    console.error("DELETE /api/admin/breathing-exercises error:", e);
    return NextResponse.json(
      { error: "Failed to delete breathing exercise" },
      { status: 500 },
    );
  }
}
