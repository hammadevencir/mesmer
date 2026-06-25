export const SUBSCRIPTIONS_COLLECTION = "subscriptions";

export const SUBSCRIPTION_PLAN = {
  MONTHLY: "monthly",
  ANNUAL: "annual",
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
