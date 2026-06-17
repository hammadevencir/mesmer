# Firebase integration

## Server (Next.js API routes, Server Components, Server Actions)

```js
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import { verifyIdToken, getIdTokenFromRequest } from "@/lib/firebase/auth-server";

// Verify request auth in an API route or Server Action
const token = getIdTokenFromRequest(request);
const decoded = await verifyIdToken(token);

// Firestore
const db = getAdminFirestore();
const snapshot = await db.collection("users").get();
```

## Client (Client Components)

```js
"use client";
import { getClientAuth, getClientAnalytics } from "@/lib/firebase/client";

const auth = getClientAuth();
// Sign in, sign out, onAuthStateChanged, etc.
```

## Environment

Copy `.env.local.example` to `.env.local` and set:

- **Client:** All `NEXT_PUBLIC_FIREBASE_*` from Firebase Console → Project settings.
- **Admin:** Either `GOOGLE_APPLICATION_CREDENTIALS` (path to service account JSON) or  
  `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`  
  (from the same JSON, e.g. for Vercel).
