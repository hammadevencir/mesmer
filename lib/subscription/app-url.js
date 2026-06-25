/**
 * Public base URL for gift links and Stripe redirects.
 * Prefer explicit NEXT_PUBLIC_APP_URL; fall back to Vercel's host on deploy.
 */
export function getAppBaseUrl(override) {
  const explicit = (override || process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  if (explicit) return explicit;

  const vercelHost = process.env.VERCEL_URL;
  if (vercelHost) {
    return `https://${vercelHost.replace(/\/$/, "")}`;
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  return "";
}
