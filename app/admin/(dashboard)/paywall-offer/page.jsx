"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import MesmerLoader from "@/components/ui/MesmerLoader";

const PROMO_TIERS = [
  { value: "launch", label: "launch" },
  { value: "annual_promo_gbp20", label: "annual_promo_gbp20" },
  { value: "annual_promo_gbp22", label: "annual_promo_gbp22" },
  { value: "annual_promo_gbp25", label: "annual_promo_gbp25" },
];

function pad2(n) {
  return String(n).padStart(2, "0");
}

/** Milliseconds since epoch → datetime-local string in local TZ */
function msToDatetimeLocal(ms) {
  const n = Number(ms);
  if (!Number.isFinite(n) || n <= 0) return "";
  const d = new Date(n);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** datetime-local string → unix ms */
function datetimeLocalToMs(value) {
  if (!value || typeof value !== "string") return 0;
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : 0;
}

const emptyFormDefaults = () => ({
  name: "",
  annualNowPriceLabel: "",
  annualWasPriceLabel: "",
  discountLabel: "",
  annualPromoTier: "launch",
  enable: false,
  startsAtLocal: "",
  endsAtLocal: "",
});

const PaywallOfferPage = () => {
  const [form, setForm] = useState(emptyFormDefaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [docMissing, setDocMissing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/paywall-offer");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to load");
      }
      setDocMissing(!data.exists);
      setForm({
        name: data.name ?? "",
        annualNowPriceLabel: data.annualNowPriceLabel ?? "",
        annualWasPriceLabel: data.annualWasPriceLabel ?? "",
        discountLabel: data.discountLabel ?? "",
        annualPromoTier:
          typeof data.annualPromoTier === "string" && data.annualPromoTier.trim() ?
            data.annualPromoTier.trim()
          : "launch",
        enable: data.enable === true,
        startsAtLocal: msToDatetimeLocal(data.startsAt),
        endsAtLocal: msToDatetimeLocal(data.endsAt),
      });
    } catch (e) {
      console.error(e);
      setError(e.message || "Could not load paywall offer");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patch = (updates) =>
    setForm((prev) => ({
      ...prev,
      ...updates,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const startsAt = datetimeLocalToMs(form.startsAtLocal);
    const endsAt = datetimeLocalToMs(form.endsAtLocal);

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/paywall-offer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          annualNowPriceLabel: form.annualNowPriceLabel,
          annualWasPriceLabel: form.annualWasPriceLabel,
          discountLabel: form.discountLabel,
          annualPromoTier: form.annualPromoTier,
          enable: form.enable,
          startsAt,
          endsAt,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to save");
      }
      setDocMissing(false);
      patch({
        startsAtLocal: msToDatetimeLocal(data.startsAt),
        endsAtLocal: msToDatetimeLocal(data.endsAt),
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const tierOptions = useMemo(() => {
    const tier = form.annualPromoTier?.trim();
    const isKnown = PROMO_TIERS.some((o) => o.value === tier);
    if (!tier || isKnown) return PROMO_TIERS;
    return [...PROMO_TIERS, { value: tier, label: `${tier} (current)` }];
  }, [form.annualPromoTier]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <MesmerLoader variant="orbital" size="md" message="Loading paywall offer…" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 max-w-2xl">
      <div>
        <h1
          className="text-2xl font-bold text-[#1A1A1A]"
          style={{ fontFamily: "var(--font-nunito-sans)" }}
        >
          Paywall Offer
        </h1>
        <p
          className="text-[#6C6C6C] text-[15px] mt-2"
          style={{ fontFamily: "'Inter Display', var(--font-inter), sans-serif" }}
        >
          Edits Firestore{" "}
          <code className="text-[13px] bg-gray-100 px-1.5 py-0.5 rounded">{`app_config / paywall_offer`}</code>
          . Start and end times are stored as Unix time in milliseconds.
        </p>
        {docMissing && (
          <p className="text-amber-700 text-[14px] mt-2 font-medium">
            No document yet — saving will create it.
          </p>
        )}
      </div>

      {error && (
        <div
          className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-[14px]"
          role="alert"
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-[20px] border-[1.5px] border-[#EED9FF] bg-white p-5 md:p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <span
              className="text-[13px] font-medium text-[#717171] block"
              style={{ fontFamily: "'Inter Display', var(--font-inter), sans-serif" }}
            >
              Enable offer
            </span>
            <span className="text-[12px] text-[#9CA3AF]">Show paywall promotional state in the app</span>
          </div>
          <Switch checked={form.enable} onCheckedChange={(v) => patch({ enable: v })} />
        </div>

        <Field label="Name">
          <input
            type="text"
            value={form.name}
            onChange={(e) => patch({ name: e.target.value })}
            className="w-full h-11 rounded-[12px] border border-[#E5E7EB] px-3 text-[15px] outline-none focus:border-[#8F00FF] focus:ring-1 focus:ring-[#8F00FF]"
            placeholder='e.g. "LAUNCH OFFER"'
          />
        </Field>

        <Field label="Annual now price label">
          <input
            type="text"
            value={form.annualNowPriceLabel}
            onChange={(e) => patch({ annualNowPriceLabel: e.target.value })}
            className="w-full h-11 rounded-[12px] border border-[#E5E7EB] px-3 text-[15px] outline-none focus:border-[#8F00FF]"
            placeholder='e.g. "£20"'
          />
        </Field>

        <Field label="Annual was price label">
          <input
            type="text"
            value={form.annualWasPriceLabel}
            onChange={(e) => patch({ annualWasPriceLabel: e.target.value })}
            className="w-full h-11 rounded-[12px] border border-[#E5E7EB] px-3 text-[15px] outline-none focus:border-[#8F00FF]"
            placeholder='e.g. "£39.99"'
          />
        </Field>

        <Field label="Discount label">
          <input
            type="text"
            value={form.discountLabel}
            onChange={(e) => patch({ discountLabel: e.target.value })}
            className="w-full h-11 rounded-[12px] border border-[#E5E7EB] px-3 text-[15px] outline-none focus:border-[#8F00FF]"
            placeholder='e.g. "50% off"'
          />
        </Field>

        <Field label="Annual promo tier">
          <Select
            value={form.annualPromoTier}
            onValueChange={(v) => patch({ annualPromoTier: v })}
          >
            <SelectTrigger className="w-full max-w-none h-11 rounded-[12px] border-[#E5E7EB]">
              <SelectValue placeholder="Select tier" />
            </SelectTrigger>
            <SelectContent>
              {tierOptions.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label={`Starts at (stored as unix ms)`}>
          <input
            type="datetime-local"
            value={form.startsAtLocal}
            onChange={(e) => patch({ startsAtLocal: e.target.value })}
            className="w-full h-11 rounded-[12px] border border-[#E5E7EB] px-3 text-[15px] outline-none focus:border-[#8F00FF]"
          />
        </Field>

        <Field label={`Ends at (stored as unix ms)`}>
          <input
            type="datetime-local"
            value={form.endsAtLocal}
            onChange={(e) => patch({ endsAtLocal: e.target.value })}
            className="w-full h-11 rounded-[12px] border border-[#E5E7EB] px-3 text-[15px] outline-none focus:border-[#8F00FF]"
          />
        </Field>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[#8F00FF] hover:bg-[#7B00DB] h-11 px-8"
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => load()}
            disabled={saving}
            className="rounded-full border-[#8F00FF] text-[#8F00FF]"
          >
            Reload
          </Button>
        </div>
      </form>
    </div>
  );
};

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span
        className="text-[12px] font-medium text-[#717171]"
        style={{ fontFamily: "'Inter Display', var(--font-inter), sans-serif" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

export default PaywallOfferPage;
