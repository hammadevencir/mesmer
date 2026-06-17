const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");
const {
  SUBSCRIPTIONS_COLLECTION,
  USERS_COLLECTION,
  SUBSCRIPTION_STATUS,
  ENTITLED_STATUSES,
} = require("./constants");

function toTimestamp(seconds) {
  if (!seconds) return null;
  return Timestamp.fromMillis(Number(seconds) * 1000);
}

function hasAccess(status, currentPeriodEnd) {
  if (!ENTITLED_STATUSES.has(status)) return false;
  if (!currentPeriodEnd) return true;
  const endMs = currentPeriodEnd.toMillis ? currentPeriodEnd.toMillis() : Number(currentPeriodEnd);
  return endMs > Date.now();
}

function planLabel(plan) {
  if (plan === "annual") return "premium_annual";
  if (plan === "monthly") return "premium_monthly";
  return plan || "premium";
}

/**
 * Upsert subscription document and mirror entitlement to users collection.
 * Document ID is the beneficiary Firebase UID (same as mobile IAP).
 */
async function updateSubscriptionDocument(userId, patch, eventMeta = {}) {
  if (!userId) {
    throw new Error("userId is required to update subscription");
  }

  const db = getFirestore();
  const ref = db.collection(SUBSCRIPTIONS_COLLECTION).doc(userId);
  const now = FieldValue.serverTimestamp();

  const subscriptionData = {
    userId,
    ...patch,
    updatedAt: now,
    lastEventId: eventMeta.eventId || null,
    lastEventType: eventMeta.eventType || null,
  };

  const existing = await ref.get();
  if (!existing.exists) {
    subscriptionData.createdAt = now;
  }

  await ref.set(subscriptionData, { merge: true });

  const userRef = db.collection(USERS_COLLECTION).doc(userId);
  const entitled = hasAccess(patch.status, patch.currentPeriodEnd);

  const userUpdate = {
    subscriptionUpdatedAt: now,
  };

  if (entitled) {
    userUpdate.subscription = planLabel(patch.plan);
    userUpdate.plan = planLabel(patch.plan);
  } else if (
    patch.status === SUBSCRIPTION_STATUS.EXPIRED ||
    patch.status === SUBSCRIPTION_STATUS.REFUNDED
  ) {
    userUpdate.subscription = "free";
    userUpdate.plan = "free";
  }

  await userRef.set(userUpdate, { merge: true });

  return { userId, status: patch.status, entitled };
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
  toTimestamp,
  hasAccess,
  planLabel,
};
