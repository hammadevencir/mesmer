/**
 * Backfills cache + content-type metadata on already-uploaded exercise media.
 * Run: npm run fix:media-headers
 *
 * New uploads get this metadata from lib/firebase/upload-metadata.js, but
 * every file uploaded before that is still stored with no `Cache-Control`,
 * so Storage serves it `no-cache`: nothing caches it, and every play and
 * every seek is a fresh origin range request. That is what the laggy audio
 * looks like. This rewrites the metadata in place — the bytes and the
 * download URLs are untouched, so nothing in Firestore needs updating.
 *
 * Pass --dry to list what would change without writing.
 */

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const admin = require("firebase-admin");

const PREFIX = "exercises/";
const CACHE_CONTROL = "public, max-age=31536000, immutable";
const DRY_RUN = process.argv.includes("--dry");

const EXTENSION_CONTENT_TYPES = {
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  aac: "audio/aac",
  wav: "audio/wav",
  ogg: "audio/ogg",
  mp4: "video/mp4",
  mov: "video/quicktime",
  m4v: "video/x-m4v",
  webm: "video/webm",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  heic: "image/heic",
};

function getCredential() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\n/g,
    "\n",
  );
  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey };
  }
  return null;
}

// Non-standard types browsers/OSes hand over that some mobile players
// refuse to stream. Map them onto the registered equivalent.
const CONTENT_TYPE_ALIASES = {
  "audio/x-m4a": "audio/mp4",
  "audio/m4a": "audio/mp4",
  "audio/x-mp3": "audio/mpeg",
  "audio/mp3": "audio/mpeg",
  "video/x-m4v": "video/mp4",
};

function expectedContentType(name, current) {
  const aliased = CONTENT_TYPE_ALIASES[current] || current;
  if (aliased && aliased !== "application/octet-stream") return aliased;
  const ext = name.split(".").pop()?.toLowerCase();
  return EXTENSION_CONTENT_TYPES[ext] || aliased || "application/octet-stream";
}

async function run() {
  const credential = getCredential();
  if (!credential) {
    console.error(
      "Missing FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY.",
    );
    process.exit(1);
  }

  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucketName) {
    console.error("Missing NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET.");
    process.exit(1);
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(credential),
      storageBucket: bucketName,
    });
  }

  const bucket = admin.storage().bucket();
  const [files] = await bucket.getFiles({ prefix: PREFIX });
  console.log(`Found ${files.length} file(s) under ${PREFIX}`);

  let updated = 0;
  let skipped = 0;

  for (const file of files) {
    if (file.name.endsWith("/")) continue; // folder placeholder

    const meta = file.metadata || {};
    const contentType = expectedContentType(file.name, meta.contentType);
    const needsCache = meta.cacheControl !== CACHE_CONTROL;
    const needsType = meta.contentType !== contentType;

    if (!needsCache && !needsType) {
      skipped += 1;
      continue;
    }

    console.log(
      `${DRY_RUN ? "[dry] " : ""}${file.name}\n` +
        `    cacheControl: ${meta.cacheControl || "(none)"} -> ${CACHE_CONTROL}\n` +
        `    contentType:  ${meta.contentType || "(none)"} -> ${contentType}`,
    );

    if (!DRY_RUN) {
      await file.setMetadata({ cacheControl: CACHE_CONTROL, contentType });
    }
    updated += 1;
  }

  console.log(
    `\nDone. ${DRY_RUN ? "Would update" : "Updated"} ${updated}, already correct ${skipped}.`,
  );
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
