import { SUBSCRIPTION_PLAN } from "./constants";

const PLAN_LINE_ITEMS = {
  [SUBSCRIPTION_PLAN.MONTHLY]: {
    currency: "eur",
    product_data: { name: "Mesmer Premium — Monthly" },
    unit_amount: 349,
    recurring: { interval: "month" },
  },
  [SUBSCRIPTION_PLAN.ANNUAL]: {
    currency: "eur",
    product_data: { name: "Mesmer Premium — Annual" },
    unit_amount: 2000,
    recurring: { interval: "year" },
  },
};

export function getCheckoutLineItem(plan) {
  const priceData = PLAN_LINE_ITEMS[plan];
  if (!priceData) return null;
  return { price_data: priceData, quantity: 1 };
}
