"use client";

import React, { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MODES = [
  { key: "manual", label: "Pick 2 manually" },
  { key: "random", label: "Random daily" },
];

/**
 * One card per category ("track"). Admin chooses the mode and, in manual
 * mode, the exact 2 exercises the app should show. Random mode lets the app
 * pick 2 from this category each day.
 */
const TrackCard = ({ track, onSave }) => {
  const { categoryName, exercises = [], exerciseCount = 0 } = track;

  const [mode, setMode] = useState(track.mode || "random");
  const [exercise1Id, setExercise1Id] = useState(track.exercise1Id || "");
  const [exercise2Id, setExercise2Id] = useState(track.exercise2Id || "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // { type: "success" | "error", message }

  const notEnough = exerciseCount < 2;

  const dirty =
    mode !== (track.mode || "random") ||
    exercise1Id !== (track.exercise1Id || "") ||
    exercise2Id !== (track.exercise2Id || "");

  const manualValid =
    mode !== "manual" ||
    (!!exercise1Id && !!exercise2Id && exercise1Id !== exercise2Id);

  const canSave = dirty && manualValid && !notEnough && !saving;

  // Prevent picking the same exercise in both slots.
  const optionsForSlot1 = useMemo(
    () => exercises.filter((e) => e.id !== exercise2Id),
    [exercises, exercise2Id],
  );
  const optionsForSlot2 = useMemo(
    () => exercises.filter((e) => e.id !== exercise1Id),
    [exercises, exercise1Id],
  );

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      await onSave({
        categoryName,
        mode,
        exercise1Id: mode === "manual" ? exercise1Id : "",
        exercise2Id: mode === "manual" ? exercise2Id : "",
      });
      setStatus({ type: "success", message: "Saved" });
    } catch (e) {
      setStatus({ type: "error", message: e.message || "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white w-full p-5 flex flex-col gap-5 rounded-[16px] border-[1.5px] border-[#EED9FF]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <h3 className="text-[18px] font-semibold text-[#1A1A1A] truncate">
            {categoryName}
          </h3>
          <span className="bg-[#F3E8FF] text-[#8F00FF] text-[12px] font-medium py-1 px-2.5 rounded-full shrink-0">
            {String(exerciseCount).padStart(2, "0")} live
          </span>
        </div>
      </div>

      {notEnough && (
        <p className="text-[13px] text-amber-700 bg-amber-50 border border-amber-200 rounded-[10px] px-3 py-2">
          This category needs at least 2 live exercises before a track can be
          configured.
        </p>
      )}

      {/* Mode toggle */}
      <div className="flex gap-2 p-1 bg-[#F7F0FF] rounded-[12px] w-full sm:w-fit">
        {MODES.map((m) => {
          const active = mode === m.key;
          return (
            <button
              key={m.key}
              type="button"
              disabled={notEnough}
              onClick={() => {
                setMode(m.key);
                setStatus(null);
              }}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-[9px] text-[14px] font-medium transition-all disabled:opacity-50 ${
                active
                  ? "bg-[#8F00FF] text-white shadow-sm"
                  : "text-[#6C6C6C] hover:text-[#8F00FF]"
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Mode body */}
      {mode === "manual" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-[#6C6C6C]">Exercise 1</label>
            <Select
              value={exercise1Id || undefined}
              onValueChange={(v) => {
                setExercise1Id(v);
                setStatus(null);
              }}
              disabled={notEnough}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an exercise" />
              </SelectTrigger>
              <SelectContent>
                {optionsForSlot1.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-[#6C6C6C]">Exercise 2</label>
            <Select
              value={exercise2Id || undefined}
              onValueChange={(v) => {
                setExercise2Id(v);
                setStatus(null);
              }}
              disabled={notEnough}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an exercise" />
              </SelectTrigger>
              <SelectContent>
                {optionsForSlot2.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : (
        <p className="text-[14px] text-[#6C6C6C] bg-[#FDFAFF] border border-[#E9D5FF] rounded-[10px] px-3 py-2.5">
          The app will pick 2 exercises at random from this category, refreshed
          once per day.
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 pt-1">
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
          disabled={!canSave}
          className="min-w-[110px] h-[42px] px-5 rounded-[14px] bg-[#8F00FF] text-white text-[14px] font-medium hover:bg-[#7B00DB] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
};

export default TrackCard;
