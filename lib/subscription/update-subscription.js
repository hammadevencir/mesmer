import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { SUBSCRIPTIONS_COLLECTION } from "./constants";
import {
  MOBILE_SUBSCRIPTION_STATUS,
  planToSubscriptionId,
  isActiveMobileStatus,
} from "./mobile-schema";

/**
 * Upsert `subscriptions/{userId}` using the same fields as the mobile app.
 *
 * Fields: userId, status, subscriptionId, purchaseToken, lastRenewed, canceledAt, updatedAt
 */
export async function updateSubscriptionDocument(userId, patch) {
  if (!userId) {
    throw new Error("userId is required to update subscription");
  }

  const db = getAdminFirestore();
  const ref = db.collection(SUBSCRIPTIONS_COLLECTION).doc(userId);
  const now = FieldValue.serverTimestamp();

  const subscriptionData = {
    userId,
    ...patch,
    updatedAt: now,
  };

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

export function buildActiveSubscriptionPatch({ userId, plan, purchaseToken }) {
  return {
    userId,
    status: MOBILE_SUBSCRIPTION_STATUS.ACTIVE,
    subscriptionId: planToSubscriptionId(plan),
    purchaseToken,
    lastRenewed: FieldValue.serverTimestamp(),
    canceledAt: FieldValue.delete(),
  };
}

export function buildInactiveSubscriptionPatch({ userId, plan, purchaseToken }) {
  return {
    userId,
    status: MOBILE_SUBSCRIPTION_STATUS.INACTIVE,
    subscriptionId: planToSubscriptionId(plan),
    purchaseToken,
    canceledAt: FieldValue.serverTimestamp(),
  };
}

export async function activateSubscriptionFromStripeSession(session, subscription) {
  const userId = session.metadata?.userId;
  if (!userId) {
    throw new Error("Checkout session missing userId metadata");
  }

  const plan = session.metadata?.plan || subscription.metadata?.plan || null;
  const purchaseToken = subscription.id;

  return updateSubscriptionDocument(
    userId,
    buildActiveSubscriptionPatch({ userId, plan, purchaseToken })
  );
}

export { planToSubscriptionId };
