import Stripe from "stripe";
import { SUBSCRIPTION_PLAN } from "./constants";

let stripeClient;

export function getStripe() {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export function getStripePriceId(plan) {
  if (plan === SUBSCRIPTION_PLAN.ANNUAL) {
    return process.env.STRIPE_PRICE_ANNUAL;
  }
  if (plan === SUBSCRIPTION_PLAN.MONTHLY) {
    return process.env.STRIPE_PRICE_MONTHLY;
  }
  return null;
}
