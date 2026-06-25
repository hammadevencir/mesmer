import crypto from "crypto";
import { getAppBaseUrl } from "./app-url";

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  return process.env.SUBSCRIPTION_LINK_SECRET || "";
}

export function createSubscriptionLinkToken(userId, expiresAtMs = Date.now() + DEFAULT_TTL_SECONDS * 1000) {
  const secret = getSecret();
  if (!secret) {
    throw new Error("SUBSCRIPTION_LINK_SECRET is not configured");
  }

  const exp = Math.floor(expiresAtMs / 1000);
  const payload = `${userId}:${exp}`;
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  return { exp, sig };
}

export function verifySubscriptionLinkToken(userId, exp, sig) {
  const secret = getSecret();
  if (!secret || !userId || !exp || !sig) {
    return { valid: false, reason: "missing_params" };
  }

  const expNum = Number(exp);
  if (!Number.isFinite(expNum) || expNum <= Math.floor(Date.now() / 1000)) {
    return { valid: false, reason: "expired" };
  }

  const payload = `${userId}:${expNum}`;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  const sigBuffer = Buffer.from(String(sig), "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return { valid: false, reason: "invalid_signature" };
  }

  return { valid: true, expiresAt: expNum * 1000 };
}

import { getAppBaseUrl } from "./app-url";

export function buildSubscriptionGiftUrl(userId, baseUrl) {
  const origin = getAppBaseUrl(baseUrl);
  if (!origin) {
    throw new Error("NEXT_PUBLIC_APP_URL is not configured");
  }

  const { exp, sig } = createSubscriptionLinkToken(userId);
  const params = new URLSearchParams({ uid: userId, exp: String(exp), sig });
  return `${origin}/subscribe?${params.toString()}`;
}
