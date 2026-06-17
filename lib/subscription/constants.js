export const SUBSCRIPTIONS_COLLECTION = "subscriptions";

/** Subscription lifecycle statuses (shared with mobile IAP + web). */
export const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  RENEWED: "renewed",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
  FAILED_PAYMENT: "failed_payment",
  GRACE_PERIOD: "grace_period",
  REFUNDED: "refunded",
};

export const SUBSCRIPTION_PLAN = {
  MONTHLY: "monthly",
  ANNUAL: "annual",
};

export const SUBSCRIPTION_PLATFORM = {
  WEB: "web",
  IOS: "ios",
  ANDROID: "android",
};

export const GIFT_PLANS = [
  {
    id: SUBSCRIPTION_PLAN.ANNUAL,
    name: "Annual",
    price: "€20",
    interval: "year",
    description: "Best value — billed yearly",
    highlight: true,
  },
  {
    id: SUBSCRIPTION_PLAN.MONTHLY,
    name: "Monthly",
    price: "€3.49",
    interval: "month",
    description: "Flexible — billed monthly",
    highlight: false,
  },
];

/** Statuses that still grant app access (until currentPeriodEnd). */
export const ENTITLED_STATUSES = new Set([
  SUBSCRIPTION_STATUS.ACTIVE,
  SUBSCRIPTION_STATUS.RENEWED,
  SUBSCRIPTION_STATUS.CANCELLED,
  SUBSCRIPTION_STATUS.GRACE_PERIOD,
]);
