/**
 * Verify Firebase ID token from Authorization header or cookie.
 * Use in API routes, Server Actions, or middleware.
 *
 * @param {string} [token] - ID token (defaults to Bearer token from headers)
 * @returns {Promise<import('firebase-admin/auth').DecodedIdToken | null>}
 */
export async function verifyIdToken(token) {
  const { getAdminAuth } = await import("./admin.js");
  const auth = getAdminAuth();
  if (!token) return null;
  try {
    return await auth.verifyIdToken(token);
  } catch {
    return null;
  }
}

/**
 * Verify a Firebase session cookie (created via `createSessionCookie`).
 * Use for the browser-based admin session (`mesmer_session` cookie), which
 * is long-lived — unlike a raw ID token, which expires after 1 hour.
 *
 * @param {string} [cookie] - Session cookie value
 * @returns {Promise<import('firebase-admin/auth').DecodedIdToken | null>}
 */
export async function verifySessionCookie(cookie) {
  const { getAdminAuth } = await import("./admin.js");
  const auth = getAdminAuth();
  if (!cookie) return null;
  try {
    return await auth.verifySessionCookie(cookie, true);
  } catch {
    return null;
  }
}

/**
 * Get Firebase ID token from request (Bearer header or cookie).
 *
 * @param {Request} request - Next.js request
 * @param {string} [cookieName] - Optional cookie name (e.g. 'session')
 * @returns {string | null}
 */
export function getIdTokenFromRequest(request, cookieName = "session") {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  if (cookieName) {
    const cookieHeader = request.headers.get("cookie");
    const match = cookieHeader?.match(new RegExp(`${cookieName}=([^;]+)`));
    if (match) return decodeURIComponent(match[1]);
  }
  return null;
}
