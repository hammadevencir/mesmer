/**
 * Seeds the admin user: creates Firebase Auth user and useradmin Firestore document.
 * Run: npm run seed:admin
 *
 * Creates:
 * - Firebase Auth user: admin@mesmer.com / password
 * - Firestore document: useradmin/{uid} with email and role
 */

require("dotenv").config({ path: ".env.local" });

const admin = require("firebase-admin");

const ADMIN_EMAIL = "admin@mesmer.com";
const ADMIN_PASSWORD = "password";

function getCredential() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );
  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey };
  }
  return null;
}

async function seedAdmin() {
  const credential = getCredential();
  if (!credential) {
    console.error(
      "Missing FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, or FIREBASE_ADMIN_PRIVATE_KEY in .env.local"
    );
    process.exit(1);
  }

  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(credential) });
  }

  const auth = admin.auth();
  const db = admin.firestore();

  let uid;
  try {
    const existing = await auth.getUserByEmail(ADMIN_EMAIL);
    uid = existing.uid;
    console.log("Admin user already exists:", uid);
  } catch {
    const user = await auth.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      emailVerified: true,
    });
    uid = user.uid;
    console.log("Created Firebase Auth user:", uid);
  }

  const useradminRef = db.collection("useradmin").doc(uid);
  await useradminRef.set(
    {
      email: ADMIN_EMAIL,
      role: "admin",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  console.log("useradmin document set with id:", uid);
  console.log("Done. Sign in with:", ADMIN_EMAIL, "/", ADMIN_PASSWORD);
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
