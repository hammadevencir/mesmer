import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionCookie } from "@/lib/firebase/auth-server";
import { getAdminFirestore } from "@/lib/firebase/admin";
import {
  normalizeCategoryName,
  getCategoryType,
  getCategoryColor,
} from "@/lib/categories";

const SESSION_COOKIE_NAME = "mesmer_session";
const CATEGORIES_COLLECTION = "categories";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const decoded = token ? await verifySessionCookie(token) : null;
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminFirestore();
    const snapshot = await db.collection(CATEGORIES_COLLECTION).get();

    // Normalize name/type/colour on every read so typos and missing
    // metadata in Firestore ("Social Anixety", no type/color set) still
    // display correctly without requiring a migration to have run first.
    const categories = snapshot.docs.map((doc) => {
      const data = doc.data();
      const name = normalizeCategoryName(data.name || data.title || "Untitled");
      const type = data.type || getCategoryType(name);
      return {
        id: doc.id,
        ...data,
        name,
        type,
        color: data.color || getCategoryColor(type),
      };
    });

    return NextResponse.json({ categories });
  } catch (e) {
    console.error("GET /api/admin/categories error:", e);
    return NextResponse.json(
      { error: "Failed to load categories" },
      { status: 500 },
    );
  }
}
