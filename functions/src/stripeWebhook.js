const Stripe = require("stripe");
const { SUBSCRIPTION_STATUS, SUBSCRIPTION_PLATFORM } = require("./constants");
const { updateSubscriptionDocument, recordProcessedEvent, toTimestamp } = require("./subscriptionUpdates");

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
    {
      status: SUBSCRIPTION_STATUS.ACTIVE,
      plan,
      platform: SUBSCRIPTION_PLATFORM.WEB,
      productId: subscription.items?.data?.[0]?.price?.product || null,
      priceId: subscription.items?.data?.[0]?.price?.id || null,
      externalId: subscription.id,
      customerId: subscription.customer,
      currentPeriodStart: toTimestamp(subscription.current_period_start),
      currentPeriodEnd: toTimestamp(subscription.current_period_end),
      cancelAtPeriodEnd: subscription.cancel_at_period_end === true,
      cancelledAt: null,
      gracePeriodEndsAt: null,
      purchaserEmail: session.customer_details?.email || session.customer_email || null,
      isGift: session.metadata?.source === "gift",
    },
    { eventId: event.id, eventType: event.type }
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

  await updateSubscriptionDocument(
    userId,
    {
      status: SUBSCRIPTION_STATUS.RENEWED,
      plan: subscription.metadata?.plan || null,
      platform: SUBSCRIPTION_PLATFORM.WEB,
      externalId: subscription.id,
      customerId: subscription.customer,
      currentPeriodStart: toTimestamp(subscription.current_period_start),
      currentPeriodEnd: toTimestamp(subscription.current_period_end),
      cancelAtPeriodEnd: subscription.cancel_at_period_end === true,
    },
    { eventId: event.id, eventType: event.type }
  );
}

async function handleSubscriptionUpdated(event) {
  const subscription = event.data.object;
  const userId = getUserIdFromMetadata(subscription.metadata);
  if (!userId) return;

  let status = SUBSCRIPTION_STATUS.ACTIVE;
  let gracePeriodEndsAt = null;

  if (subscription.status === "past_due" || subscription.status === "unpaid") {
    status = SUBSCRIPTION_STATUS.GRACE_PERIOD;
    gracePeriodEndsAt = toTimestamp(subscription.current_period_end);
  } else if (subscription.cancel_at_period_end) {
    status = SUBSCRIPTION_STATUS.CANCELLED;
  } else if (subscription.status === "active") {
    status = SUBSCRIPTION_STATUS.ACTIVE;
  }

  await updateSubscriptionDocument(
    userId,
    {
      status,
      plan: subscription.metadata?.plan || null,
      platform: SUBSCRIPTION_PLATFORM.WEB,
      externalId: subscription.id,
      customerId: subscription.customer,
      currentPeriodStart: toTimestamp(subscription.current_period_start),
      currentPeriodEnd: toTimestamp(subscription.current_period_end),
      cancelAtPeriodEnd: subscription.cancel_at_period_end === true,
      cancelledAt: subscription.canceled_at ? toTimestamp(subscription.canceled_at) : null,
      gracePeriodEndsAt,
    },
    { eventId: event.id, eventType: event.type }
  );
}

async function handleSubscriptionDeleted(event) {
  const subscription = event.data.object;
  const userId = getUserIdFromMetadata(subscription.metadata);
  if (!userId) return;

  await updateSubscriptionDocument(
    userId,
    {
      status: SUBSCRIPTION_STATUS.EXPIRED,
      plan: subscription.metadata?.plan || null,
      platform: SUBSCRIPTION_PLATFORM.WEB,
      externalId: subscription.id,
      customerId: subscription.customer,
      currentPeriodEnd: toTimestamp(subscription.ended_at || subscription.current_period_end),
      cancelAtPeriodEnd: false,
    },
    { eventId: event.id, eventType: event.type }
  );
}

async function handleInvoicePaymentFailed(event) {
  const invoice = event.data.object;
  if (!invoice.subscription) return;

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const userId = getUserIdFromMetadata(subscription.metadata);
  if (!userId) return;

  await updateSubscriptionDocument(
    userId,
    {
      status: SUBSCRIPTION_STATUS.FAILED_PAYMENT,
      plan: subscription.metadata?.plan || null,
      platform: SUBSCRIPTION_PLATFORM.WEB,
      externalId: subscription.id,
      customerId: subscription.customer,
      currentPeriodEnd: toTimestamp(subscription.current_period_end),
      gracePeriodEndsAt: toTimestamp(subscription.current_period_end),
    },
    { eventId: event.id, eventType: event.type }
  );
}

async function handleChargeRefunded(event) {
  const charge = event.data.object;
  const stripe = getStripe();

  let subscriptionId = charge.metadata?.subscriptionId;
  if (!subscriptionId && charge.invoice) {
    const invoice = await stripe.invoices.retrieve(charge.invoice);
    subscriptionId = invoice.subscription;
  }

  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = getUserIdFromMetadata(subscription.metadata);
  if (!userId) return;

  await updateSubscriptionDocument(
    userId,
    {
      status: SUBSCRIPTION_STATUS.REFUNDED,
      plan: subscription.metadata?.plan || null,
      platform: SUBSCRIPTION_PLATFORM.WEB,
      externalId: subscription.id,
      customerId: subscription.customer,
      refundedAt: toTimestamp(charge.created),
    },
    { eventId: event.id, eventType: event.type }
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
