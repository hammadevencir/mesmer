/** Mobile app `subscriptions` document shape (Firestore collection: subscriptions). */
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
