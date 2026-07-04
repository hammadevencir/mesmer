const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");
const {
  SUBSCRIPTIONS_COLLECTION,
  USERS_COLLECTION,
} = require("./constants");
const {
  MOBILE_SUBSCRIPTION_STATUS,
  planToSubscriptionId,
  isActiveMobileStatus,
} = require("./mobileSchema");

function toTimestamp(seconds) {
  if (seconds == null) return null;
  return Timestamp.fromMillis(Number(seconds) * 1000);
}

/**
 * Merge-update `subscriptions/{userId}` with the mobile app schema.
 * Never replaces the whole document — only patches provided fields.
 */
async function updateSubscriptionDocument(userId, patch) {
  if (!userId) {
    throw new Error("userId is required to update subscription");
  }

  const db = getFirestore();
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

  const userRef = db.collection(USERS_COLLECTION).doc(userId);
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

function buildActiveSubscriptionPatch({
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

function buildInactiveSubscriptionPatch({
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

async function recordProcessedEvent(eventId) {
  const db = getFirestore();
  const ref = db.collection("subscription_webhook_events").doc(eventId);
  const snap = await ref.get();
  if (snap.exists) {
    return false;
  }
  await ref.set({ processedAt: FieldValue.serverTimestamp() });
  return true;
}

module.exports = {
  updateSubscriptionDocument,
  recordProcessedEvent,
  buildActiveSubscriptionPatch,
  buildInactiveSubscriptionPatch,
  planToSubscriptionId,
  toTimestamp,
};
