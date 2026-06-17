import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Subscription activated — Mesmer",
};

export default function SubscribeSuccessPage() {
  return (
    <Card className="border-0 text-center shadow-lg">
      <CardHeader className="space-y-3">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-2xl">
          ✓
        </div>
        <CardTitle className="text-xl">Thank you!</CardTitle>
        <CardDescription className="text-base">
          Payment was successful. The Mesmer subscription will be activated on their account
          shortly. They can close this page and return to the app.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
