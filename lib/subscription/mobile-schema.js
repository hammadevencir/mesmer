/**
 * Mobile app `subscriptions/{userId}` document shape.
 *
 * userId, status, plan, subscriptionId, purchaseToken,
 * currentPeriodStart, currentPeriodEnd, gracePeriodEndsAt,
 * lastRenewed, canceledAt, createdAt, updatedAt
 */
export const MOBILE_SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

/** Product IDs used by the mobile app / stores. */
export const MOBILE_SUBSCRIPTION_IDS = {
  monthly: "mesmer_monthly",
  annual: "mesmer_annual",
};

export function planToSubscriptionId(plan) {
  if (!plan) return null;
  return MOBILE_SUBSCRIPTION_IDS[plan] || plan;
}

export function isActiveMobileStatus(status) {
  return status === MOBILE_SUBSCRIPTION_STATUS.ACTIVE;
}
