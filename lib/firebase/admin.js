/**
 * Firebase Admin SDK — server-side only.
 * Use in API routes, Server Components, Server Actions, and middleware.
 *
 * Requires one of:
 * - GOOGLE_APPLICATION_CREDENTIALS = path to service account JSON, or
 * - FIREBASE_ADMIN_PROJECT_ID + FIREBASE_ADMIN_CLIENT_EMAIL + FIREBASE_ADMIN_PRIVATE_KEY
 */

import { getApps, getApp, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getAdminCredential() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return undefined; // SDK will use the file path
  }
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );
  if (projectId && clientEmail && privateKey) {
    return cert({ projectId, clientEmail, privateKey });
  }
  return undefined;
}

/**
 * Returns the Firebase Admin app instance (singleton).
 * Safe to call from Server Components, Route Handlers, and Server Actions.
 */
export function getAdminApp() {
  const existing = getApps().find((app) => app.name === "mesmer-admin");
  if (existing) return existing;

  const credential = getAdminCredential();
  return initializeApp(
    credential
      ? { credential }
      : { projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID },
    "mesmer-admin"
  );
}

/**
 * Firebase Admin Auth — verify ID tokens, manage users, etc.
 */
export function getAdminAuth() {
  return getAuth(getAdminApp());
}

/**
 * Firestore Admin — use in server code for read/write.
 */
export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}
