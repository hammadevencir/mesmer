import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase/admin";
import {
  SUBSCRIPTIONS_COLLECTION,
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_PLATFORM,
  ENTITLED_STATUSES,
} from "./constants";

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

export async function updateSubscriptionDocument(userId, patch, eventMeta = {}) {
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
    lastEventId: eventMeta.eventId || null,
    lastEventType: eventMeta.eventType || null,
  };

  const existing = await ref.get();
  if (!existing.exists) {
    subscriptionData.createdAt = now;
  }

  await ref.set(subscriptionData, { merge: true });

  const userRef = db.collection("users").doc(userId);
  const entitled = hasAccess(patch.status, patch.currentPeriodEnd);

  const userUpdate = { subscriptionUpdatedAt: now };

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

export async function activateSubscriptionFromStripeSession(session, subscription) {
  const userId = session.metadata?.userId;
  if (!userId) {
    throw new Error("Checkout session missing userId metadata");
  }

  const plan = session.metadata?.plan || subscription.metadata?.plan || null;

  return updateSubscriptionDocument(
    userId,
    {
      status: SUBSCRIPTION_STATUS.ACTIVE,
      plan,
      platform: SUBSCRIPTION_PLATFORM.WEB,
      productId: subscription.items?.data?.[0]?.price?.product || null,
      priceId: subscription.items?.data?.[0]?.price?.id || null,
      externalId: subscription.id,
      customerId: subscription.customer,
      checkoutSessionId: session.id,
      currentPeriodStart: toTimestamp(subscription.current_period_start),
      currentPeriodEnd: toTimestamp(subscription.current_period_end),
      cancelAtPeriodEnd: subscription.cancel_at_period_end === true,
      cancelledAt: null,
      gracePeriodEndsAt: null,
      purchaserEmail: session.customer_details?.email || session.customer_email || null,
      isGift: session.metadata?.source === "gift",
    },
    { eventId: session.id, eventType: "checkout.session.completed" }
  );
}

export { toTimestamp, planLabel };
