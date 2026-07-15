"use client";

import React, { useState, useEffect, useCallback } from "react";
import PageHeader from "./_components/PageHeader";
import TrackCard from "./_components/TrackCard";
import MesmerLoader from "@/components/ui/MesmerLoader";

const TracksPage = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTracks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/tracks");
      if (!res.ok) throw new Error("Failed to fetch tracks");
      const data = await res.json();
      setTracks(data.tracks || []);
    } catch (e) {
      console.error("Error fetching tracks:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  const handleSave = async (payload) => {
    const res = await fetch("/api/admin/tracks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Failed to save track");
    }
    // Reflect the saved values as the new baseline.
    setTracks((prev) =>
      prev.map((t) =>
        t.categoryName === payload.categoryName
          ? {
              ...t,
              exercise1Id: data.exercise1Id,
              exercise2Id: data.exercise2Id,
            }
          : t,
      ),
    );
    return data;
  };

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 min-h-screen">
      <PageHeader
        title="Tracks"
        subtitle="Each track shows 2 exercises — pick them by hand for Calm and Stress & Overthinking"
      />

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <MesmerLoader
            variant="orbital"
            size="md"
            message="Loading tracks..."
          />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-red-500 text-[16px] font-medium">
              Failed to load tracks
            </p>
            <p className="text-[#6C6C6C] text-[14px]">{error}</p>
            <button
              onClick={fetchTracks}
              className="mt-2 px-6 py-2 rounded-full border border-[#8F00FF] text-[#8F00FF] text-[14px] font-medium hover:bg-[#F3E8FF] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && tracks.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-[#111827] text-[18px] font-medium">
              No tracks yet
            </p>
            <p className="text-[#6C6C6C] text-[14px]">
              Create exercises with categories to configure tracks.
            </p>
          </div>
        </div>
      )}

      {/* Tracks list */}
      {!loading && !error && tracks.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {tracks.map((track) => (
            <TrackCard
              key={track.categoryName}
              track={track}
              onSave={handleSave}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TracksPage;
