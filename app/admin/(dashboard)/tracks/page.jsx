"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import PageHeader from "./_components/PageHeader";
import TriageSummary from "@/components/dashboard/TriageSummary";
import MesmerLoader from "@/components/ui/MesmerLoader";

/**
 * Read-only summary of the Home screen triage list. The list itself is
 * edited on the exercise cards in Exercises ("Add to Home triage").
 */
const HomeTriagePage = () => {
  const [triageExercises, setTriageExercises] = useState([]);
  const [maxTriageExercises, setMaxTriageExercises] = useState(4);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTriage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/exercises");
      if (!res.ok) throw new Error("Failed to fetch exercises");
      const data = await res.json();
      setTriageExercises(data.triageExercises || []);
      if (typeof data.maxTriageExercises === "number") {
        setMaxTriageExercises(data.maxTriageExercises);
      }
    } catch (e) {
      console.error("Error fetching triage:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTriage();
  }, [fetchTriage]);

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 min-h-screen">
      <PageHeader
        title="Home screen exercises (Triage)"
        subtitle="The exercises shown on the Home screen when a user selects Calm or Stress & Overthinking, in the order shown below."
      />

      {loading && (
        <div className="flex items-center justify-center py-20">
          <MesmerLoader
            variant="orbital"
            size="md"
            message="Loading home screen exercises..."
          />
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-red-500 text-[16px] font-medium">
              Failed to load home screen exercises
            </p>
            <p className="text-[#6C6C6C] text-[14px]">{error}</p>
            <button
              onClick={fetchTriage}
              className="mt-2 px-6 py-2 rounded-full border border-[#8F00FF] text-[#8F00FF] text-[14px] font-medium hover:bg-[#F3E8FF] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <TriageSummary
          exercises={triageExercises}
          max={maxTriageExercises}
          footer={
            <p className="text-[14px] text-[#6C6C6C]">
              To add, remove or reorder these, use the{" "}
              <span className="font-medium text-[#1A1A1A]">
                Add to Home triage
              </span>{" "}
              switch and position on any exercise card in{" "}
              <Link
                href="/admin/mood-exercises"
                className="text-[#8F00FF] font-medium underline underline-offset-2"
              >
                Exercises
              </Link>
              .
            </p>
          }
        />
      )}
    </div>
  );
};

export default HomeTriagePage;
