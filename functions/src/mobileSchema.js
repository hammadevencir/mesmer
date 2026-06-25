const MOBILE_SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

const MOBILE_SUBSCRIPTION_IDS = {
  monthly: "mesmer_monthly",
  annual: "mesmer_annual",
};

function planToSubscriptionId(plan) {
  if (!plan) return null;
  return MOBILE_SUBSCRIPTION_IDS[plan] || plan;
}

function isActiveMobileStatus(status) {
  return status === MOBILE_SUBSCRIPTION_STATUS.ACTIVE;
}

module.exports = {
  MOBILE_SUBSCRIPTION_STATUS,
  MOBILE_SUBSCRIPTION_IDS,
  planToSubscriptionId,
  isActiveMobileStatus,
};
