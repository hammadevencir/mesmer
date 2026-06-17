const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const Stripe = require("stripe");
const { processStripeEvent } = require("./stripeWebhook");

initializeApp();

/**
 * Stripe webhook — updates `subscriptions/{userId}` for web gift purchases.
 *
 * Configure in Stripe Dashboard → Webhooks:
 *   URL: https://<region>-<project>.cloudfunctions.net/stripeSubscriptionWebhook
 * Events:
 *   - checkout.session.completed
 *   - invoice.paid
 *   - customer.subscription.updated
 *   - customer.subscription.deleted
 *   - invoice.payment_failed
 *   - charge.refunded
 */
exports.stripeSubscriptionWebhook = onRequest(
  {
    cors: false,
    region: process.env.FUNCTIONS_REGION || "europe-west1",
    secrets: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (!webhookSecret || !stripeKey) {
      console.error("Stripe secrets are not configured");
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

/**
 * Health check for deployment verification.
 */
exports.subscriptionHealth = onRequest((req, res) => {
  res.status(200).json({
    ok: true,
    firestore: !!getFirestore(),
  });
});
