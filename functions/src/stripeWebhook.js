const Stripe = require("stripe");
const {
  updateSubscriptionDocument,
  recordProcessedEvent,
  buildActiveSubscriptionPatch,
  buildInactiveSubscriptionPatch,
} = require("./subscriptionUpdates");
const { MOBILE_SUBSCRIPTION_STATUS } = require("./mobileSchema");

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(key);
}

function getUserIdFromMetadata(metadata = {}) {
  return metadata.userId || metadata.beneficiaryUserId || null;
}

async function handleCheckoutCompleted(event) {
  const session = event.data.object;
  const userId = getUserIdFromMetadata(session.metadata);
  if (!userId) return;

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  const plan = session.metadata?.plan || subscription.metadata?.plan || null;

  await updateSubscriptionDocument(
    userId,
    buildActiveSubscriptionPatch({
      userId,
      plan,
      purchaseToken: subscription.id,
    })
  );
}

async function handleInvoicePaid(event) {
  const invoice = event.data.object;
  if (invoice.billing_reason !== "subscription_cycle") {
    return;
  }

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const userId = getUserIdFromMetadata(subscription.metadata);
  if (!userId) return;

  const plan = subscription.metadata?.plan || null;

  await updateSubscriptionDocument(
    userId,
    buildActiveSubscriptionPatch({
      userId,
      plan,
      purchaseToken: subscription.id,
    })
  );
}

async function handleSubscriptionUpdated(event) {
  const subscription = event.data.object;
  const userId = getUserIdFromMetadata(subscription.metadata);
  if (!userId) return;

  const plan = subscription.metadata?.plan || null;
  const purchaseToken = subscription.id;

  if (subscription.status === "active" || subscription.status === "trialing") {
    await updateSubscriptionDocument(
      userId,
      buildActiveSubscriptionPatch({ userId, plan, purchaseToken })
    );
    return;
  }

  if (
    subscription.status === "canceled" ||
    subscription.status === "unpaid" ||
    subscription.status === "past_due"
  ) {
    await updateSubscriptionDocument(
      userId,
      buildInactiveSubscriptionPatch({ userId, plan, purchaseToken })
    );
  }
}

async function handleSubscriptionDeleted(event) {
  const subscription = event.data.object;
  const userId = getUserIdFromMetadata(subscription.metadata);
  if (!userId) return;

  await updateSubscriptionDocument(
    userId,
    buildInactiveSubscriptionPatch({
      userId,
      plan: subscription.metadata?.plan || null,
      purchaseToken: subscription.id,
    })
  );
}

async function handleInvoicePaymentFailed(event) {
  const invoice = event.data.object;
  if (!invoice.subscription) return;

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const userId = getUserIdFromMetadata(subscription.metadata);
  if (!userId) return;

  if (subscription.status === "active") {
    return;
  }

  await updateSubscriptionDocument(
    userId,
    buildInactiveSubscriptionPatch({
      userId,
      plan: subscription.metadata?.plan || null,
      purchaseToken: subscription.id,
    })
  );
}

async function handleChargeRefunded(event) {
  const charge = event.data.object;
  const stripe = getStripe();

  let stripeSubscriptionId = charge.metadata?.subscriptionId;
  if (!stripeSubscriptionId && charge.invoice) {
    const invoice = await stripe.invoices.retrieve(charge.invoice);
    stripeSubscriptionId = invoice.subscription;
  }

  if (!stripeSubscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  const userId = getUserIdFromMetadata(subscription.metadata);
  if (!userId) return;

  await updateSubscriptionDocument(
    userId,
    buildInactiveSubscriptionPatch({
      userId,
      plan: subscription.metadata?.plan || null,
      purchaseToken: subscription.id,
    })
  );
}

async function processStripeEvent(event) {
  const shouldProcess = await recordProcessedEvent(event.id);
  if (!shouldProcess) {
    return { skipped: true };
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event);
      break;
    case "invoice.paid":
      await handleInvoicePaid(event);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event);
      break;
    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event);
      break;
    case "charge.refunded":
      await handleChargeRefunded(event);
      break;
    default:
      return { skipped: true, reason: "unhandled_event" };
  }

  return { processed: true, type: event.type };
}

module.exports = {
  processStripeEvent,
};
