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
