"use client";

import React, { useState, useEffect, useCallback } from "react";
import PageHeader from "./_components/PageHeader";
import CategoryFilter from "./_components/CategoryFilter";
import TipCard from "./_components/TipCard";
import AddTipDialog from "./_components/AddTipDialog";
import MesmerLoader from "@/components/ui/MesmerLoader";

const MesmerTipsPage = () => {
  const [activeCategory, setActiveCategory] = useState("Scheduled");
  const [tips, setTips] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeCategory) {
        params.set("category", activeCategory);
      }
      const url = `/api/admin/tips${params.toString() ? `?${params}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to fetch tips");
      }
      const data = await res.json();
      setTips(data.tips || []);
      setCategories(data.categories || []);
    } catch (e) {
      console.error("Error fetching tips:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchTips();
  }, [fetchTips]);

  const handleDelete = async (tipId) => {
    try {
      const res = await fetch(`/api/admin/tips?id=${tipId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      fetchTips();
    } catch (e) {
      console.error("Error deleting tip:", e);
    }
  };

  const handleUpdate = async (updatedTip) => {
    try {
      const res = await fetch("/api/admin/tips", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTip),
      });
      if (!res.ok) throw new Error("Failed to update");
      fetchTips();
    } catch (e) {
      console.error("Error updating tip:", e);
    }
  };

  const handleCreate = async (newTip) => {
    try {
      const res = await fetch("/api/admin/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTip),
      });
      if (!res.ok) throw new Error("Failed to create");
      fetchTips();
    } catch (e) {
      console.error("Error creating tip:", e);
    }
  };

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 min-h-screen">
      <PageHeader
        title="Manage Mesmer Tips"
        subtitle="Create and manage tips for different mood categories"
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
            message="Loading tips..."
          />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-red-500 text-[16px] font-medium">
              Failed to load tips
            </p>
            <p className="text-[#6C6C6C] text-[14px]">{error}</p>
            <button
              onClick={fetchTips}
              className="mt-2 px-6 py-2 rounded-full border border-[#8F00FF] text-[#8F00FF] text-[14px] font-medium hover:bg-[#F3E8FF] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && tips.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-center">
            <AddTipDialog onCreate={handleCreate}>
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
            </AddTipDialog>
            <p className="text-[#111827] text-[18px] font-medium">
              No tips found
            </p>
            <p className="text-[#6C6C6C] text-[14px]">
              {activeCategory !== "Scheduled"
                ? `No tips in the "${activeCategory}" category yet.`
                : "Create your first schedule tip to get started."}
            </p>
          </div>
        </div>
      )}

      {/* Tips Grid */}
      {!loading && !error && tips.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tips.map((tip) => (
            <TipCard
              key={tip.id}
              tip={tip}
              onUpdate={handleUpdate}
              onDelete={() => handleDelete(tip.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MesmerTipsPage;
