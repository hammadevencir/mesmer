import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { SUBSCRIPTIONS_COLLECTION } from "./constants";
import {
  MOBILE_SUBSCRIPTION_STATUS,
  planToSubscriptionId,
  isActiveMobileStatus,
} from "./mobile-schema";

function toTimestamp(seconds) {
  if (seconds == null) return null;
  return Timestamp.fromMillis(Number(seconds) * 1000);
}

/**
 * Merge-update `subscriptions/{userId}` with the mobile app schema.
 * Never replaces the whole document — only patches provided fields.
 * Sets `createdAt` only when the doc does not exist yet.
 */
export async function updateSubscriptionDocument(userId, patch) {
  if (!userId) {
    throw new Error("userId is required to update subscription");
  }

  const db = getAdminFirestore();
  const ref = db.collection(SUBSCRIPTIONS_COLLECTION).doc(userId);
  const now = FieldValue.serverTimestamp();

  const existing = await ref.get();
  const subscriptionData = {
    userId,
    ...patch,
    updatedAt: now,
  };

  if (!existing.exists) {
    subscriptionData.createdAt = now;
  }

  await ref.set(subscriptionData, { merge: true });

  const userRef = db.collection("users").doc(userId);
  const subscriptionId = patch.subscriptionId;
  const active = isActiveMobileStatus(patch.status);

  const userUpdate = { subscriptionUpdatedAt: now };

  if (active && subscriptionId) {
    userUpdate.subscription = subscriptionId;
    userUpdate.plan = subscriptionId;
  } else if (patch.status === MOBILE_SUBSCRIPTION_STATUS.INACTIVE) {
    userUpdate.subscription = "free";
    userUpdate.plan = "free";
  }

  await userRef.set(userUpdate, { merge: true });

  return { userId, status: patch.status, subscriptionId, entitled: active };
}

/**
 * Full mobile-compatible payload for an active web subscription.
 * Does not delete any fields — sets canceledAt / gracePeriodEndsAt to null.
 */
export function buildActiveSubscriptionPatch({
  userId,
  plan,
  purchaseToken,
  currentPeriodStart,
  currentPeriodEnd,
}) {
  const subscriptionId = planToSubscriptionId(plan);

  return {
    userId,
    status: MOBILE_SUBSCRIPTION_STATUS.ACTIVE,
    plan: subscriptionId,
    subscriptionId,
    purchaseToken,
    currentPeriodStart: currentPeriodStart ?? null,
    currentPeriodEnd: currentPeriodEnd ?? null,
    gracePeriodEndsAt: null,
    lastRenewed: FieldValue.serverTimestamp(),
    canceledAt: null,
  };
}

export function buildInactiveSubscriptionPatch({
  userId,
  plan,
  purchaseToken,
  currentPeriodStart,
  currentPeriodEnd,
}) {
  const subscriptionId = planToSubscriptionId(plan);

  return {
    userId,
    status: MOBILE_SUBSCRIPTION_STATUS.INACTIVE,
    plan: subscriptionId,
    subscriptionId,
    purchaseToken,
    currentPeriodStart: currentPeriodStart ?? null,
    currentPeriodEnd: currentPeriodEnd ?? null,
    gracePeriodEndsAt: null,
    canceledAt: FieldValue.serverTimestamp(),
  };
}

export async function activateSubscriptionFromStripeSession(session, subscription) {
  const userId = session.metadata?.userId;
  if (!userId) {
    throw new Error("Checkout session missing userId metadata");
  }

  const plan = session.metadata?.plan || subscription.metadata?.plan || null;

  return updateSubscriptionDocument(
    userId,
    buildActiveSubscriptionPatch({
      userId,
      plan,
      purchaseToken: subscription.id,
      currentPeriodStart: toTimestamp(subscription.current_period_start),
      currentPeriodEnd: toTimestamp(subscription.current_period_end),
    })
  );
}

export { planToSubscriptionId, toTimestamp };
