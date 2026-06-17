"use client";

import React, { useState, useEffect, useCallback } from "react";
import PageHeader from "./_components/PageHeader";
import CategoryFilter from "./_components/CategoryFilter";
import StoryCard from "./_components/StoryCard";
import AddStoryDialog from "./_components/AddStoryDialog";
import MesmerLoader from "@/components/ui/MesmerLoader";

const DailyMesmerPage = () => {
  const [activeCategory, setActiveCategory] = useState("Scheduled");
  const [stories, setStories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeCategory) {
        params.set("category", activeCategory);
      }
      const url = `/api/admin/stories${params.toString() ? `?${params}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to fetch stories");
      }
      const data = await res.json();
      setStories(data.stories || []);
      setCategories(data.categories || []);
    } catch (e) {
      console.error("Error fetching stories:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleDelete = async (storyId) => {
    try {
      const res = await fetch(`/api/admin/stories?id=${storyId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      fetchStories();
    } catch (e) {
      console.error("Error deleting story:", e);
    }
  };

  const handleUpdate = async (updatedStory) => {
    try {
      const res = await fetch("/api/admin/stories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedStory),
      });
      if (!res.ok) throw new Error("Failed to update");
      fetchStories();
    } catch (e) {
      console.error("Error updating story:", e);
    }
  };

  const handleCreate = async (newStory) => {
    try {
      const res = await fetch("/api/admin/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStory),
      });
      if (!res.ok) throw new Error("Failed to create");
      fetchStories();
    } catch (e) {
      console.error("Error creating story:", e);
    }
  };

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 min-h-screen">
      <PageHeader
        title="Manage Daily Mesmer Stories"
        subtitle="Create and manage exercises for different mood categories"
        onCreate={handleCreate}
      />

      <CategoryFilter
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={(cat) => setActiveCategory(cat || "Scheduled")}
      />

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <MesmerLoader
            variant="orbital"
            size="md"
            message="Loading stories..."
          />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-red-500 text-[16px] font-medium">
              Failed to load stories
            </p>
            <p className="text-[#6C6C6C] text-[14px]">{error}</p>
            <button
              onClick={fetchStories}
              className="mt-2 px-6 py-2 rounded-full border border-[#8F00FF] text-[#8F00FF] text-[14px] font-medium hover:bg-[#F3E8FF] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && stories.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-center">
            <AddStoryDialog onCreate={handleCreate}>
              <button className="w-16 h-16 rounded-full bg-[#F3E8FF] flex items-center justify-center hover:bg-[#EED9FF] transition-colors cursor-pointer border-none outline-none">
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
            </AddStoryDialog>
            <p className="text-[#111827] text-[18px] font-medium">
              No stories found
            </p>
            <p className="text-[#6C6C6C] text-[14px]">
              {activeCategory !== "Scheduled"
                ? `No stories in the "${activeCategory}" category yet.`
                : "Create your first schedule story to get started."}
            </p>
          </div>
        </div>
      )}

      {/* Stories Grid */}
      {!loading && !error && stories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onUpdate={handleUpdate}
              onDelete={() => handleDelete(story.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DailyMesmerPage;
