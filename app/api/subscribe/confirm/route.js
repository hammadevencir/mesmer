import { NextResponse } from "next/server";
import { getStripe } from "@/lib/subscription/stripe";
import { activateSubscriptionFromStripeSession } from "@/lib/subscription/update-subscription";
import { getAdminFirestore } from "@/lib/firebase/admin";

/**
 * Confirms a Stripe Checkout session after redirect (no webhook required).
 * Called from /subscribe/success?session_id=...
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const sessionId = body?.sessionId;

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const db = getAdminFirestore();
    const processedRef = db.collection("subscription_webhook_events").doc(sessionId);
    const processedSnap = await processedRef.get();
    if (processedSnap.exists) {
      const data = processedSnap.data();
      return NextResponse.json({
        ok: true,
        alreadyProcessed: true,
        userId: data?.userId,
        status: data?.status,
      });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    const subscription = session.subscription;
    if (!subscription || typeof subscription === "string") {
      return NextResponse.json({ error: "Subscription not found on session" }, { status: 400 });
    }

    const result = await activateSubscriptionFromStripeSession(session, subscription);

    await processedRef.set({
      userId: result.userId,
      status: result.status,
      processedAt: new Date(),
      source: "checkout_confirm",
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("POST /api/subscribe/confirm error:", e);
    return NextResponse.json({ error: e.message || "Failed to confirm subscription" }, { status: 500 });
  }
}
