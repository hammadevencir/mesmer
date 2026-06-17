"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SubscribeCancelledPage() {
  return (
    <Card className="border-0 text-center shadow-lg">
      <CardHeader className="space-y-3">
        <CardTitle className="text-xl">Checkout cancelled</CardTitle>
        <CardDescription className="text-base">
          No payment was taken. You can return to the subscription link and try again when
          you&apos;re ready.
        </CardDescription>
      </CardHeader>
      <div className="flex justify-center px-6 pb-6">
        <Button variant="outline" onClick={() => window.history.back()}>
          Go back
        </Button>
      </div>
    </Card>
  );
}
