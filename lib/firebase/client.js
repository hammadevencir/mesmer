/**
 * Firebase client SDK — for browser only.
 * Use in Client Components for Auth, Analytics, etc.
 * Config is read from env to avoid committing secrets.
 */

import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function getClientApp() {
  if (typeof window === "undefined") return null;
  if (!firebaseConfig.apiKey) {
    console.error(
      "[Firebase] NEXT_PUBLIC_FIREBASE_API_KEY is missing. " +
        "Set it in .env.local and restart the dev server (or rebuild for production)."
    );
    return null;
  }
  const existing = getApps().find((app) => app.name === "mesmer-client");
  if (existing) return existing;
  return initializeApp(firebaseConfig, "mesmer-client");
}

/**
 * Firebase Auth for client (sign-in, sign-out, token).
 */
export function getClientAuth() {
  const app = getClientApp();
  return app ? getAuth(app) : null;
}

/**
 * Analytics — only in browser and when supported.
 */
export async function getClientAnalytics() {
  if (typeof window === "undefined") return null;
  const app = getClientApp();
  if (!app) return null;
  const supported = await isSupported();
  return supported ? getAnalytics(app) : null;
}

export { getClientApp };

/**
 * Firebase Storage for client (file uploads).
 */
export function getClientStorage() {
  const app = getClientApp();
  return app ? getStorage(app) : null;
}
