"use client";

import React, { useState, useEffect, useCallback } from "react";
import PageHeader from "./_components/PageHeader";
import Tabs from "./_components/Tabs";
import CategoryFilter from "./_components/CategoryFilter";
import ExerciseCard from "./_components/ExerciseCard";
import MesmerLoader from "@/components/ui/MesmerLoader";
import CreateExerciseDialog from "./_components/CreateExerciseDialog";
import OnboardingOrderPanel from "./_components/OnboardingOrderPanel";
import TriageSummary from "@/components/dashboard/TriageSummary";

const DEFAULT_MAX_ONBOARDING = 3;
const ONBOARDING_TAB = "Onboarding";
const DEFAULT_MAX_TRIAGE = 4;

const MoodExercisesPage = () => {
  const [activeTab, setActiveTab] = useState("My Exercises");
  const [activeCategory, setActiveCategory] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [categories, setCategories] = useState([]);
  const [onboardingCount, setOnboardingCount] = useState(0);
  const [onboardingExercises, setOnboardingExercises] = useState([]);
  const [maxOnboardingExercises, setMaxOnboardingExercises] = useState(
    DEFAULT_MAX_ONBOARDING,
  );
  const [triageExercises, setTriageExercises] = useState([]);
  const [maxTriageExercises, setMaxTriageExercises] = useState(
    DEFAULT_MAX_TRIAGE,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeCategory) {
        params.set("category", activeCategory);
      }
      const url = `/api/admin/exercises${params.toString() ? `?${params}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch exercises");
      const data = await res.json();
      setExercises(data.exercises || []);
      setCategories(data.categories || []);
      setOnboardingExercises(data.onboardingExercises || []);
      setOnboardingCount(
        typeof data.onboardingCount === "number" ? data.onboardingCount : 0,
      );
      if (typeof data.maxOnboardingExercises === "number") {
        setMaxOnboardingExercises(data.maxOnboardingExercises);
      }
      setTriageExercises(data.triageExercises || []);
      if (typeof data.maxTriageExercises === "number") {
        setMaxTriageExercises(data.maxTriageExercises);
      }
    } catch (e) {
      console.error("Error fetching exercises:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  // These intentionally do NOT catch — a failed create/update/delete must
  // reject so the calling dialog knows to keep itself open and show the
  // error, instead of silently closing as if it had saved.
  const handleDelete = async (exerciseId) => {
    const res = await fetch(`/api/admin/exercises?id=${exerciseId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to delete exercise");
    }
    fetchExercises();
  };

  const handleUpdate = async (updatedExercise) => {
    const res = await fetch("/api/admin/exercises", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedExercise),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to update exercise");
    }
    fetchExercises();
  };

  const handleCreate = async (newExercise) => {
    const res = await fetch("/api/admin/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newExercise),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to create exercise");
    }
    fetchExercises();
  };

  const handleSaveOnboardingOrder = async (orderedIds) => {
    const res = await fetch("/api/admin/exercises", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboardingOrder: orderedIds }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to save onboarding order");
    }
    fetchExercises();
  };

  // Move one triage exercise to `position` (1-based); the others shift.
  const handleTriageMove = async (exerciseId, position) => {
    const ids = triageExercises
      .map((ex) => ex.id)
      .filter((id) => id !== exerciseId);
    ids.splice(position - 1, 0, exerciseId);
    const res = await fetch("/api/admin/exercises", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ triageOrder: ids }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to change triage order");
    }
    fetchExercises();
  };

  const isOnboardingTab = activeTab === ONBOARDING_TAB;

  // The Onboarding tab ignores the category filter and shows every
  // onboarding exercise in the order users see them.
  const displayedExercises = isOnboardingTab
    ? onboardingExercises
    : exercises.filter((ex) =>
        activeTab === "Drafts" ? ex.isDraft : !ex.isDraft
      );

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 min-h-screen">
      <PageHeader
        title="Manage Exercises"
        subtitle="Create and manage exercises for different mood categories"
        onCreate={handleCreate}
        onboardingCount={onboardingCount}
        maxOnboardingExercises={maxOnboardingExercises}
      />

      <Tabs
        tabs={["My Exercises", "Drafts", ONBOARDING_TAB]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {isOnboardingTab ? (
        !loading &&
        !error && (
          <OnboardingOrderPanel
            exercises={onboardingExercises}
            onSaveOrder={handleSaveOnboardingOrder}
          />
        )
      ) : (
        <>
          {activeTab === "My Exercises" && (
            <TriageSummary
              exercises={triageExercises}
              max={maxTriageExercises}
            />
          )}
          <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          />
        </>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <MesmerLoader
            variant="orbital"
            size="md"
            message="Loading exercises..."
          />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-red-500 text-[16px] font-medium">
              Failed to load exercises
            </p>
            <p className="text-[#6C6C6C] text-[14px]">{error}</p>
            <button
              onClick={fetchExercises}
              className="mt-2 px-6 py-2 rounded-full border border-[#8F00FF] text-[#8F00FF] text-[14px] font-medium hover:bg-[#F3E8FF] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && displayedExercises.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-center">
            <CreateExerciseDialog
              onCreate={handleCreate}
              onboardingCount={onboardingCount}
              maxOnboardingExercises={maxOnboardingExercises}
            >
              <button className="w-16 h-16 rounded-full bg-[#F3E8FF] flex items-center justify-center cursor-pointer hover:bg-[#8F00FF]/10 transition-colors outline-none">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8F00FF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </CreateExerciseDialog>
            <p className="text-[#111827] text-[18px] font-medium">
              No exercises found
            </p>
            <p className="text-[#6C6C6C] text-[14px]">
              {isOnboardingTab
                ? "No exercises are in onboarding yet. Turn on \"Include in onboarding\" on an exercise to add it."
                : activeCategory
                ? `No exercises in the "${activeCategory}" category yet.`
                : "Create your first exercise to get started."}
            </p>
          </div>
        </div>
      )}

      {/* Exercises Grid */}
      {!loading && !error && displayedExercises.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center md:justify-items-start">
          {displayedExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              isDraft={isOnboardingTab ? exercise.isDraft : activeTab === "Drafts"}
              onboardingCount={onboardingCount}
              maxOnboardingExercises={maxOnboardingExercises}
              showTriage={!isOnboardingTab}
              triageCount={triageExercises.length}
              maxTriageExercises={maxTriageExercises}
              onTriageMove={(position) =>
                handleTriageMove(exercise.id, position)
              }
              onDelete={() => handleDelete(exercise.id)}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MoodExercisesPage;
