import { NextResponse } from "next/server";
import { verifySubscriptionLinkToken } from "@/lib/subscription/link-token";
import { SUBSCRIPTION_PLAN } from "@/lib/subscription/constants";
import { getStripe, getStripePriceId } from "@/lib/subscription/stripe";

export async function POST(request) {
  try {
    const body = await request.json();
    const { uid, exp, sig, plan, purchaserEmail } = body || {};

    const verification = verifySubscriptionLinkToken(uid, exp, sig);
    if (!verification.valid) {
      return NextResponse.json({ error: "Invalid or expired link" }, { status: 403 });
    }

    if (![SUBSCRIPTION_PLAN.MONTHLY, SUBSCRIPTION_PLAN.ANNUAL].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const priceId = getStripePriceId(plan);
    if (!priceId) {
      return NextResponse.json({ error: "Stripe price not configured" }, { status: 500 });
    }

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
    if (!appUrl) {
      return NextResponse.json({ error: "App URL not configured" }, { status: 500 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/subscribe/cancelled?uid=${encodeURIComponent(uid)}`,
      customer_email: purchaserEmail || undefined,
      metadata: {
        userId: uid,
        plan,
        source: "gift",
      },
      subscription_data: {
        metadata: {
          userId: uid,
          plan,
          source: "gift",
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("POST /api/subscribe/checkout error:", e);
    return NextResponse.json({ error: e.message || "Failed to create checkout" }, { status: 500 });
  }
}
