"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MesmerLoader from "@/components/ui/MesmerLoader";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setState("error");
      setError("Missing payment session. Please contact support if you were charged.");
      return;
    }

    async function confirm() {
      try {
        const res = await fetch("/api/subscribe/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to activate subscription");
        }
        setState("done");
      } catch (err) {
        setState("error");
        setError(err.message || "Something went wrong");
      }
    }

    confirm();
  }, [sessionId]);

  if (state === "loading") {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <MesmerLoader message="Activating subscription…" />
      </div>
    );
  }

  if (state === "error") {
    return (
      <Card className="border-0 text-center shadow-lg">
        <CardHeader className="space-y-3">
          <CardTitle className="text-xl">Activation issue</CardTitle>
          <CardDescription className="text-base">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-0 text-center shadow-lg">
      <CardHeader className="space-y-3">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-2xl">
          ✓
        </div>
        <CardTitle className="text-xl">Thank you!</CardTitle>
        <CardDescription className="text-base">
          Payment was successful and the subscription is now active on their account. They can
          return to the Mesmer app.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

export default function SubscribeSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <MesmerLoader />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
