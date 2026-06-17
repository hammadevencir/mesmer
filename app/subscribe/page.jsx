"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GIFT_PLANS } from "@/lib/subscription/constants";
import MesmerLoader from "@/components/ui/MesmerLoader";

function SubscribeContent() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const exp = searchParams.get("exp");
  const sig = searchParams.get("sig");

  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [purchaserEmail, setPurchaserEmail] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (!uid || !exp || !sig) {
      setError("This subscription link is invalid. Please ask for a new link from the Mesmer app.");
      setLoading(false);
      return;
    }

    async function loadUser() {
      try {
        const params = new URLSearchParams({ uid, exp, sig });
        const res = await fetch(`/api/subscribe/user?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to load subscription page");
        }
        setUser(data);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [uid, exp, sig]);

  const handleCheckout = async () => {
    if (!selectedPlan) return;
    setCheckoutLoading(true);
    setError("");

    try {
      const res = await fetch("/api/subscribe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          exp,
          sig,
          plan: selectedPlan,
          purchaserEmail: purchaserEmail.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err.message || "Checkout failed");
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <MesmerLoader />
      </div>
    );
  }

  if (error && !user) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Link unavailable</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Gift Mesmer Premium
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You&apos;re paying for <span className="font-medium text-foreground">{user.displayName}</span>
          &apos;s subscription. They&apos;ll get full access as soon as payment completes.
        </p>
      </div>

      <div className="space-y-3">
        {GIFT_PLANS.map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => setSelectedPlan(plan.id)}
            className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
              selectedPlan === plan.id
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">
                  {plan.name}
                  {plan.highlight && (
                    <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Best value
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-foreground">{plan.price}</p>
                <p className="text-xs text-muted-foreground">per {plan.interval}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Your email (optional)</CardTitle>
          <CardDescription>
            For your receipt. The subscription is applied to {user.displayName}&apos;s account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            type="email"
            value={purchaserEmail}
            onChange={(e) => setPurchaserEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </CardContent>
        <CardFooter className="flex-col gap-3">
          {error && <p className="w-full text-sm text-destructive">{error}</p>}
          <Button
            className="h-11 w-full text-base"
            disabled={!selectedPlan || checkoutLoading}
            onClick={handleCheckout}
          >
            {checkoutLoading ? "Redirecting to checkout…" : "Continue to secure checkout"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Recurring subscription. Cancel anytime. Payments processed securely by Stripe.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <MesmerLoader />
        </div>
      }
    >
      <SubscribeContent />
    </Suspense>
  );
}
