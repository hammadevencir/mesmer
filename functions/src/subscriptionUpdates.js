const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const {
  SUBSCRIPTIONS_COLLECTION,
  USERS_COLLECTION,
} = require("./constants");
const {
  MOBILE_SUBSCRIPTION_STATUS,
  planToSubscriptionId,
  isActiveMobileStatus,
} = require("./mobileSchema");

async function updateSubscriptionDocument(userId, patch) {
  if (!userId) {
    throw new Error("userId is required to update subscription");
  }

  const db = getFirestore();
  const ref = db.collection(SUBSCRIPTIONS_COLLECTION).doc(userId);
  const now = FieldValue.serverTimestamp();

  await ref.set(
    {
      userId,
      ...patch,
      updatedAt: now,
    },
    { merge: true }
  );

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

function buildActiveSubscriptionPatch({ userId, plan, purchaseToken }) {
  return {
    userId,
    status: MOBILE_SUBSCRIPTION_STATUS.ACTIVE,
    subscriptionId: planToSubscriptionId(plan),
    purchaseToken,
    lastRenewed: FieldValue.serverTimestamp(),
    canceledAt: FieldValue.delete(),
  };
}

function buildInactiveSubscriptionPatch({ userId, plan, purchaseToken }) {
  return {
    userId,
    status: MOBILE_SUBSCRIPTION_STATUS.INACTIVE,
    subscriptionId: planToSubscriptionId(plan),
    purchaseToken,
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
};
