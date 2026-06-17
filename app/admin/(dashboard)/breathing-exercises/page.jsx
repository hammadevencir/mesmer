"use client";

import React, { useState, useEffect, useCallback } from "react";
import PageHeader from "./_components/PageHeader";
import BreathingExerciseCard from "./_components/BreathingExerciseCard";
import MesmerLoader from "@/components/ui/MesmerLoader";
import CreateBreathingExerciseDialog from "./_components/CreateBreathingExerciseDialog";

const BreathingExercisesPage = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/breathing-exercises");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to fetch breathing exercises");
      }
      const data = await res.json();
      setExercises(data.exercises || []);
    } catch (e) {
      console.error("Error fetching breathing exercises:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const handleDelete = async (exerciseId) => {
    try {
      const res = await fetch(
        `/api/admin/breathing-exercises?id=${encodeURIComponent(exerciseId)}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error("Failed to delete");
      fetchExercises();
    } catch (e) {
      console.error("Error deleting breathing exercise:", e);
    }
  };

  const handleUpdate = async (updated) => {
    try {
      const res = await fetch("/api/admin/breathing-exercises", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Failed to update");
      fetchExercises();
    } catch (e) {
      console.error("Error updating breathing exercise:", e);
    }
  };

  const handleCreate = async (newExercise) => {
    try {
      const res = await fetch("/api/admin/breathing-exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExercise),
      });
      if (!res.ok) throw new Error("Failed to create");
      fetchExercises();
    } catch (e) {
      console.error("Error creating breathing exercise:", e);
    }
  };

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 min-h-screen">
      <PageHeader
        title="Breathing exercises"
        subtitle="Create and edit guided breathing patterns stored in Firestore"
        onCreate={handleCreate}
      />

      {loading && (
        <div className="flex items-center justify-center py-20">
          <MesmerLoader
            variant="orbital"
            size="md"
            message="Loading breathing exercises..."
          />
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-red-500 text-[16px] font-medium">
              Failed to load breathing exercises
            </p>
            <p className="text-[#6C6C6C] text-[14px]">{error}</p>
            <button
              type="button"
              onClick={fetchExercises}
              className="mt-2 px-6 py-2 rounded-full border border-[#8F00FF] text-[#8F00FF] text-[14px] font-medium hover:bg-[#F3E8FF] transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {!loading && !error && exercises.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-center">
            <CreateBreathingExerciseDialog onCreate={handleCreate}>
              <button
                type="button"
                className="w-16 h-16 rounded-full bg-[#F3E8FF] flex items-center justify-center hover:bg-[#EED9FF] transition-colors cursor-pointer border-none outline-none"
              >
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
            </CreateBreathingExerciseDialog>
            <p className="text-[#111827] text-[18px] font-medium">
              No breathing exercises yet
            </p>
            <p className="text-[#6C6C6C] text-[14px]">
              Add one to save it to the{" "}
              <code className="text-[13px] bg-gray-100 px-1.5 py-0.5 rounded">
                breathingExercises
              </code>{" "}
              collection.
            </p>
          </div>
        </div>
      )}

      {!loading && !error && exercises.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((exercise) => (
            <BreathingExerciseCard
              key={exercise.id}
              exercise={exercise}
              onUpdate={handleUpdate}
              onDelete={() => handleDelete(exercise.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BreathingExercisesPage;
