import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { CheckmarkIcon } from "./Icons";
import { cn } from "@/lib/utils";

const Label = ({ children, required }) => (
  <label
    className="text-[12px] font-medium text-[#717171] mb-1.5 block font-medium"
    style={{ fontFamily: "'Inter Display', var(--font-inter), sans-serif" }}
  >
    {children}
    {required && <span className="text-[#8F00FF] ml-1">*</span>}
  </label>
);

const CategoryChip = ({ name, isSelected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "px-3 py-2 rounded-[12px] text-[14px] font-medium transition-all flex items-center gap-4",
      isSelected
        ? "bg-[#F3E8FF] text-[#8F00FF] border border-[#8F00FF]"
        : "bg-[#F3E8FF] text-[#6B7280] border border-transparent hover:border-[#8F00FF]/30",
    )}
  >
    {name}
    {isSelected && (
      <div className="w-4 h-4 rounded-full bg-[#8F00FF] flex items-center justify-center translate-y-[1px]">
        <CheckmarkIcon className="w-2.5 h-2.5" />
      </div>
    )}
  </button>
);

const AddStoryDialog = ({ children, onCreate }) => {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [content, setContent] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [fetchedCategories, setFetchedCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      setLoadingCategories(true);
      try {
        const res = await fetch("/api/admin/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setFetchedCategories(data.categories || []);
      } catch (e) {
        console.error("Error loading categories:", e);
      } finally {
        setLoadingCategories(false);
      }
    }
    if (open) {
      loadCategories();
    }
  }, [open]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!content.trim() || !selectedCategory) return;

    setSaving(true);
    try {
      let finalDate = "";
      if (isScheduling) {
        finalDate = scheduledDate;
      } else {
        const today = new Date();
        finalDate = today.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }); // e.g., "May 12, 2025"
      }

      const newStory = {
        content,
        category: selectedCategory,
        date: finalDate,
        isScheduled: isScheduling,
      };

      if (onCreate) {
        await onCreate(newStory);
      }
      setOpen(false);
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setContent("");
    setSelectedCategory("");
    setIsScheduling(false);
    setScheduledDate("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) resetForm();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[570px] p-0 gap-0 max-h-[90vh] flex flex-col bg-white rounded-[12px] overflow-hidden border-none outline-none shadow-2xl max-sm:w-[90vw]"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-[#F3F4F6] shrink-0">
          <DialogTitle className="text-[28px] font-semibold text-[#111827]">
            {isScheduling ? "Schedule Story" : "Add New Story"}
          </DialogTitle>
          <button
            onClick={() => setOpen(false)}
            className="outline-none hover:bg-gray-100 rounded-full p-1 transition-colors"
          >
            <X className="w-5 h-5 text-[#111827]" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-2 flex-1 sm:flex-none overflow-y-auto flex flex-col">
          <div>
            <Label>Enter your story</Label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Brief description"
              className="w-full h-[144px] rounded-[10px] border border-[#E5E7EB] p-3 text-[14px] text-[#111827] focus:outline-none focus:border-[#8F00FF] transition-colors resize-none placeholder:text-[#9CA3AF]"
              style={{
                fontFamily: "'Inter Display', var(--font-inter), sans-serif",
              }}
            />
          </div>

          <div className="mt-2">
            <Label required>Category</Label>
            <div className="flex flex-wrap gap-2">
              {loadingCategories ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-9 w-24 bg-gray-100 animate-pulse rounded-[12px]"
                  />
                ))
              ) : fetchedCategories.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No categories found</p>
              ) : (
                fetchedCategories.map((cat) => (
                  <CategoryChip
                    key={cat.id}
                    name={cat.name}
                    isSelected={selectedCategory === cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                  />
                ))
              )}
            </div>
          </div>

          {isScheduling && (
            <div className="mt-4">
              <Label>Add Date</Label>
              <input
                type="text"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                placeholder="Ex: May 12, 2025"
                className="w-full h-[42px] rounded-[10px] border border-[#E5E7EB] px-3 text-[14px] text-[#111827] focus:outline-none focus:border-[#8F00FF] transition-colors placeholder:text-[#9CA3AF]"
                style={{
                  fontFamily: "'Inter Display', var(--font-inter), sans-serif",
                }}
              />
            </div>
          )}
        </div>

        <div className="px-4 max-w-[570px] w-full py-5 border-t border-[#F3F4F6] flex sm:flex-row items-center justify-between gap-3 bg-white shrink-0">
          {!isScheduling ? (
            <button
              onClick={() => setIsScheduling(true)}
              className="text-[#8F00FF] text-[18px] font-bold hover:underline whitespace-nowrap"
              style={{
                fontFamily: "'Inter Display', var(--font-inter), sans-serif",
              }}
            >
              Schedule for Later
            </button>
          ) : (
            <div className="text-[18px]" /> /* Spacer */
          )}

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                if (isScheduling) setIsScheduling(false);
                else setOpen(false);
              }}
              className="h-[54px] w-[107px] rounded-full border-[#8F00FF] text-[#8F00FF] hover:bg-[#F3E8FF] hover:text-[#8F00FF] text-[18px] font-bold"
              style={{
                fontFamily: "'Inter Display', var(--font-inter), sans-serif",
              }}
              disabled={saving}
            >
              {isScheduling ? "Back" : "Cancel"}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !content.trim() || !selectedCategory}
              className="h-[54px] w-full sm:w-[194px] rounded-full bg-[#8F00FF] hover:bg-[#7a00d9] text-white text-[18px] font-bold whitespace-nowrap"
              style={{
                fontFamily: "'Inter Display', var(--font-inter), sans-serif",
              }}
            >
              {saving
                ? "Saving..."
                : isScheduling
                ? "Schedule Now"
                : "Add Story for Today"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddStoryDialog;
