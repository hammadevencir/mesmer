"use client";

import React, { useEffect, useState } from "react";

const ArrowIcon = ({ up }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: up ? "none" : "rotate(180deg)" }}
  >
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);

/**
 * Lists onboarding exercises in the order users see them and lets the
 * admin move them up/down, then save the new order.
 */
const OnboardingOrderPanel = ({ exercises, onSaveOrder }) => {
  const [items, setItems] = useState(exercises);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // { type: "success" | "error", message }

  // Reset to the server order whenever it changes (toggle, refetch, save).
  useEffect(() => {
    setItems(exercises);
  }, [exercises]);

  const dirty = items.some((ex, i) => ex.id !== exercises[i]?.id);

  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = items.slice();
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    setStatus(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      await onSaveOrder(items.map((ex) => ex.id));
      setStatus({ type: "success", message: "Order saved" });
    } catch (e) {
      setStatus({ type: "error", message: e.message || "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="bg-white w-full p-5 flex flex-col gap-4 rounded-[16px] border-[1.5px] border-[#EED9FF]">
      <div className="space-y-1">
        <h3 className="text-[18px] font-semibold text-[#1A1A1A]">
          Onboarding order
        </h3>
        <p className="text-[14px] text-[#6C6C6C]">
          Users see these exercises during onboarding in the order below. Use
          the arrows to reorder, then save.
        </p>
      </div>

      <ol className="flex flex-col gap-2">
        {items.map((ex, index) => (
          <li
            key={ex.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] border border-[#E9D5FF] bg-[#FDFAFF]"
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#8F00FF] text-white text-[13px] font-semibold shrink-0">
              {index + 1}
            </span>
            <span className="flex-1 min-w-0 text-[15px] text-[#1A1A1A] truncate">
              {ex.title}
            </span>
            {ex.isDraft && (
              <span className="text-[12px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 shrink-0">
                Draft
              </span>
            )}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0 || saving}
                aria-label={`Move ${ex.title} up`}
                className="p-1.5 rounded-full text-[#8F00FF] hover:bg-[#F3E8FF] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowIcon up />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === items.length - 1 || saving}
                aria-label={`Move ${ex.title} down`}
                className="p-1.5 rounded-full text-[#8F00FF] hover:bg-[#F3E8FF] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowIcon />
              </button>
            </div>
          </li>
        ))}
      </ol>

      <div className="flex items-center justify-between gap-3">
        <span
          className={`text-[13px] ${
            status?.type === "error"
              ? "text-red-500"
              : status?.type === "success"
                ? "text-emerald-600"
                : "text-transparent"
          }`}
        >
          {status?.message || "placeholder"}
        </span>
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className="min-w-[130px] h-[42px] px-5 rounded-[14px] bg-[#8F00FF] text-white text-[14px] font-medium hover:bg-[#7B00DB] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : "Save order"}
        </button>
      </div>
    </div>
  );
};

export default OnboardingOrderPanel;
