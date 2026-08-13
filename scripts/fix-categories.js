/**
 * One-time migration: fixes category names/typos, tags each category with
 * its set (mood vs improve-on) and colour, and re-tags any exercises that
 * still reference an old/typo'd category name.
 *
 * Run: node scripts/fix-categories.js
 *
 * Safe to run more than once (idempotent) — reads canonical names/colours
 * from lib/categories.js so it stays in sync with what the admin app
 * expects.
 */

require("dotenv").config({ path: ".env.local" });

const admin = require("firebase-admin");
const {
  MOOD_CATEGORIES,
  IMPROVE_CATEGORIES,
  normalizeCategoryName,
  getCategoryType,
  getCategoryColor,
} = require("../lib/categories.js");

const CATEGORIES_COLLECTION = "categories";
const EXERCISES_COLLECTION = "exercises";

function getCredential() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n",
  );
  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey };
  }
  return null;
}

function slugify(name) {
  return (
    String(name)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "uncategorized"
  );
}

async function fixCategories() {
  const credential = getCredential();
  if (!credential) {
    console.error(
      "Missing FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, or FIREBASE_ADMIN_PRIVATE_KEY in .env.local",
    );
    process.exit(1);
  }

  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(credential) });
  }
  const db = admin.firestore();

  // 1. Rename/merge existing category docs to canonical names + set type/color.
  const snapshot = await db.collection(CATEGORIES_COLLECTION).get();
  const nameChanges = new Map(); // old name -> canonical name

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const oldName = data.name || data.title || "";
    const canonicalName = normalizeCategoryName(oldName);
    const type = getCategoryType(canonicalName);
    const color = getCategoryColor(type);
    const canonicalId = slugify(canonicalName);

    if (oldName && oldName !== canonicalName) {
      nameChanges.set(oldName, canonicalName);
    }

    if (doc.id === canonicalId) {
      await doc.ref.set({ name: canonicalName, type, color }, { merge: true });
    } else {
      // Doc id doesn't match the canonical slug (e.g. typo'd doc) — write
      // the canonical doc and remove the old one so there's exactly one
      // category doc per canonical name.
      await db
        .collection(CATEGORIES_COLLECTION)
        .doc(canonicalId)
        .set({ name: canonicalName, type, color }, { merge: true });
      await doc.ref.delete();
      console.log(`Merged category "${oldName}" (${doc.id}) -> "${canonicalName}" (${canonicalId})`);
    }
  }

  // 2. Make sure every canonical category exists even if it wasn't in Firestore yet.
  for (const name of [...MOOD_CATEGORIES, ...IMPROVE_CATEGORIES]) {
    const type = getCategoryType(name);
    const color = getCategoryColor(type);
    await db
      .collection(CATEGORIES_COLLECTION)
      .doc(slugify(name))
      .set({ name, type, color }, { merge: true });
  }
  console.log(`Ensured ${MOOD_CATEGORIES.length + IMPROVE_CATEGORIES.length} canonical categories exist.`);

  // 3. Re-tag exercises still pointing at an old/typo'd category name.
  if (nameChanges.size > 0) {
    const exSnapshot = await db.collection(EXERCISES_COLLECTION).get();
    let updated = 0;
    for (const doc of exSnapshot.docs) {
      const data = doc.data();
      const current = data.categoryName || data.category;
      if (current && nameChanges.has(current)) {
        const canonicalName = nameChanges.get(current);
        const canonicalId = slugify(canonicalName);
        const categoryNames = Array.isArray(data.categoryNames)
          ? data.categoryNames.map((n) => nameChanges.get(n) || n)
          : [canonicalName];
        const categoryIds = Array.isArray(data.categoryIds)
          ? data.categoryIds
          : [canonicalId];
        await doc.ref.update({
          categoryName: canonicalName,
          categoryId: canonicalId,
          categoryNames,
          categoryIds,
        });
        updated += 1;
      }
    }
    console.log(`Re-tagged ${updated} exercise(s) to canonical category names.`);
  }

  console.log("Done.");
  process.exit(0);
}

fixCategories().catch((err) => {
  console.error(err);
  process.exit(1);
});
