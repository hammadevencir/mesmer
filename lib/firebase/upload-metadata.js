/**
 * Metadata attached to every exercise media upload.
 *
 * Two problems this solves:
 *
 * 1. Audio playback lag. Firebase Storage objects uploaded without an
 *    explicit `cacheControl` are served `no-cache`, so nothing — not the
 *    CDN edge, not the device — is allowed to keep a copy. Every play, and
 *    every seek inside a play, becomes a fresh origin range request, which
 *    is exactly what the stuttering/"errored" audio looks like. Upload
 *    paths are already unique (`<timestamp>_<name>`), so a file at a given
 *    path never changes and a long immutable cache is safe.
 *
 * 2. Wrong/undecodable media. Browsers leave `file.type` empty for some
 *    common audio containers (.m4a, .aac from Finder/Explorer). An object
 *    stored with no content type is rejected by the Storage rules
 *    (`contentType.matches('audio/.*')`) or served as
 *    `application/octet-stream`, which players refuse. We fall back to the
 *    extension.
 */

const EXTENSION_CONTENT_TYPES = {
  // audio
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  aac: "audio/aac",
  wav: "audio/wav",
  ogg: "audio/ogg",
  // video
  mp4: "video/mp4",
  mov: "video/quicktime",
  m4v: "video/mp4",
  webm: "video/webm",
  // images
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  heic: "image/heic",
};

/** One year, immutable — safe because upload paths are unique per upload. */
const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";

/**
 * Non-standard types browsers and the OS hand over (Explorer/Finder report
 * .m4a as `audio/x-m4a`) that some mobile players refuse to stream. Map
 * them onto the registered equivalent.
 */
const CONTENT_TYPE_ALIASES = {
  "audio/x-m4a": "audio/mp4",
  "audio/m4a": "audio/mp4",
  "audio/x-mp3": "audio/mpeg",
  "audio/mp3": "audio/mpeg",
  "video/x-m4v": "video/mp4",
};

export function resolveContentType(file) {
  if (file?.type) return CONTENT_TYPE_ALIASES[file.type] || file.type;
  const ext = String(file?.name || "").split(".").pop()?.toLowerCase();
  return EXTENSION_CONTENT_TYPES[ext] || "application/octet-stream";
}

export function uploadMetadata(file) {
  return {
    contentType: resolveContentType(file),
    cacheControl: IMMUTABLE_CACHE,
  };
}
