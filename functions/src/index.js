const { onRequest } = require("firebase-functions/v2/https");
const { defineString } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const Stripe = require("stripe");
const { processStripeEvent } = require("./stripeWebhook");

initializeApp();

const stripeSecretKey = defineString("STRIPE_SECRET_KEY", { default: "" });
const stripeWebhookSecret = defineString("STRIPE_WEBHOOK_SECRET", { default: "" });
const functionsRegion = defineString("FUNCTIONS_REGION", { default: "europe-west1" });

/**
 * Stripe webhook — updates `subscriptions/{userId}` for web gift purchases.
 *
 * Configure in Stripe Dashboard → Webhooks:
 *   URL: https://europe-west1-mesmer-db584.cloudfunctions.net/stripeSubscriptionWebhook
 */
exports.stripeSubscriptionWebhook = onRequest(
  {
    cors: false,
    region: functionsRegion,
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const webhookSecret = stripeWebhookSecret.value();
    const stripeKey = stripeSecretKey.value();

    if (!webhookSecret || !stripeKey) {
      console.error("Stripe env vars are not configured (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET)");
      res.status(500).send("Webhook not configured");
      return;
    }

    const stripe = new Stripe(stripeKey);
    const signature = req.headers["stripe-signature"];

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
    } catch (err) {
      console.error("Stripe signature verification failed:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    try {
      const result = await processStripeEvent(event);
      res.status(200).json({ received: true, ...result });
    } catch (err) {
      console.error("Stripe webhook handler error:", err);
      res.status(500).send("Webhook handler failed");
    }
  }
);

exports.subscriptionHealth = onRequest({ region: functionsRegion }, (req, res) => {
  res.status(200).json({
    ok: true,
    firestore: !!getFirestore(),
    stripeConfigured: Boolean(stripeSecretKey.value() && stripeWebhookSecret.value()),
  });
});
