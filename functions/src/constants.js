export const SUBSCRIPTIONS_COLLECTION = "subscriptions";
export const USERS_COLLECTION = "users";

export const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  RENEWED: "renewed",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
  FAILED_PAYMENT: "failed_payment",
  GRACE_PERIOD: "grace_period",
  REFUNDED: "refunded",
};

export const SUBSCRIPTION_PLATFORM = {
  WEB: "web",
  IOS: "ios",
  ANDROID: "android",
};

export const ENTITLED_STATUSES = new Set([
  SUBSCRIPTION_STATUS.ACTIVE,
  SUBSCRIPTION_STATUS.RENEWED,
  SUBSCRIPTION_STATUS.CANCELLED,
  SUBSCRIPTION_STATUS.GRACE_PERIOD,
]);
