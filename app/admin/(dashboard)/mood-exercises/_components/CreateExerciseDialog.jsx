import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { BackArrow, CloudUploadIcon, ReadIcon, CheckmarkIcon, TrashIconWhite } from "./Icons";
import { cn } from "@/lib/utils";
import { getClientStorage } from "@/lib/firebase/client";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const Label = ({ children, required }) => (
  <label
    className="text-[14px] font-medium text-[#717171] mb-2 block"
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
      "px-4 py-2 rounded-[12px] text-[14px] font-medium transition-all flex items-center gap-2",
      isSelected
        ? "bg-[#F3E8FF] text-[#8F00FF] border border-[#8F00FF]"
        : "bg-[#F3E8FF] text-[#6B7280] border border-transparent hover:border-[#8F00FF]/30",
    )}
  >
    {name}
    {isSelected && (
      <div className="w-4 h-4 rounded-full bg-[#8F00FF] flex items-center justify-center">
        <CheckmarkIcon className="w-2.5 h-2.5" />
      </div>
    )}
  </button>
);

const StepCard = ({ index, step, onChange, onDelete }) => {
  const stepNumber = String(index + 1).padStart(2, "0");
  return (
    <div className="bg-[#F3E8FF] rounded-[24px] p-6 relative flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h4 className="text-[18px] font-bold text-[#111827]">
          Step {stepNumber}
        </h4>
        <button
          onClick={onDelete}
          className="w-10 h-10 bg-[#FF4B4B] rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
        >
          <TrashIconWhite className="w-5 h-5" />
        </button>
      </div>

      <div>
        <Label required>Step Title</Label>
        <input
          type="text"
          value={step.title || ""}
          onChange={(e) => onChange(index, "title", e.target.value)}
          placeholder="Enter step title"
          className="w-full h-[52px] rounded-[12px] border border-[#E5E7EB] bg-white px-4 text-[16px] text-[#111827] focus:outline-none focus:border-[#8F00FF] transition-colors placeholder:text-[#9CA3AF]"
        />
      </div>

      <div>
        <Label required>Description</Label>
        <textarea
          value={step.description || ""}
          onChange={(e) => onChange(index, "description", e.target.value)}
          placeholder="Brief description of the step"
          rows={3}
          className="w-full rounded-[12px] border border-[#E5E7EB] bg-white p-4 text-[16px] text-[#111827] focus:outline-none focus:border-[#8F00FF] transition-colors resize-none placeholder:text-[#9CA3AF]"
        />
      </div>
    </div>
  );
};

/** Reusable file-upload field for media (listen / watch) with inline preview */
const FileUploadField = ({ label, accept, value, onChange, uploading, progress, onFileSelect, placeholder, mediaType }) => {
  const inputRef = useRef(null);
  const isAudio = mediaType === "audio";
  const isVideo = mediaType === "video";
  const hasPreview = value && value.trim().length > 0;

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-col gap-2">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 h-[52px] rounded-[12px] border border-[#E5E7EB] px-4 pr-[52px] text-[16px] text-[#111827] focus:outline-none focus:border-[#8F00FF] transition-colors placeholder:text-[#9CA3AF]"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="absolute right-2 w-9 h-9 rounded-[8px] bg-[#F3E8FF] hover:bg-[#E9D5FF] flex items-center justify-center transition-colors disabled:opacity-50"
            title="Upload from computer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8F00FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileSelect(file);
              e.target.value = "";
            }}
          />
        </div>
        {uploading && (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-[#F3E8FF] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#8F00FF] rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[12px] text-[#8F00FF] font-medium whitespace-nowrap">
              {Math.round(progress)}%
            </span>
          </div>
        )}
        {/* Inline media preview */}
        {hasPreview && !uploading && (
          <div className="relative rounded-[12px] border border-[#E9D5FF] bg-[#FDFAFF] p-3 mt-1">
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#FF4B4B] hover:bg-red-600 flex items-center justify-center transition-colors z-10"
              title="Remove media"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            {isAudio && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F3E8FF] flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#8F00FF" stroke="none">
                    <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
                  </svg>
                </div>
                <audio
                  controls
                  src={value}
                  className="flex-1 h-10"
                  style={{ maxWidth: "100%" }}
                  preload="metadata"
                />
              </div>
            )}
            {isVideo && (
              <video
                controls
                src={value}
                className="w-full rounded-[8px] max-h-[200px] bg-black"
                preload="metadata"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const CreateExerciseDialog = ({
  children,
  onCreate,
  onboardingCount = 0,
  maxOnboardingExercises = 3,
}) => {
  const initialForm = {
    title: "",
    description: "",
    category: "",
    order: "0",
    duration: "",
    theScience: "",
    mesmerFact: "",
    whatItIs: "",
    whatYouDo: "",
    whenToUse: "",
    read: "",
    listen: "",
    watch: "",
    isOnBoarding: false,
  };

  const [formData, setFormData] = useState(initialForm);
  const [steps, setSteps] = useState([{ title: "", description: "" }]);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [listenUploading, setListenUploading] = useState(false);
  const [listenProgress, setListenProgress] = useState(0);
  const [watchUploading, setWatchUploading] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);
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

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStepChange = (index, field, value) => {
    setSteps((prev) => {
      const newSteps = [...prev];
      newSteps[index] = { ...newSteps[index], [field]: value };
      return newSteps;
    });
  };

  const addStep = () => {
    setSteps([...steps, { title: "", description: "" }]);
  };

  const deleteStep = (index) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const uploadFile = async (file, folder, setUploading, setProgress, field) => {
    const storage = getClientStorage();
    if (!storage) {
      alert("Firebase Storage is not configured.");
      return;
    }

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storageRef = ref(storage, `exercises/${folder}/${timestamp}_${safeName}`);

    setUploading(true);
    setProgress(0);

    try {
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(pct);
          },
          (error) => reject(error),
          () => resolve(),
        );
      });

      const url = await getDownloadURL(storageRef);
      handleChange(field, url);
    } catch (err) {
      console.error(`Upload failed (${folder}):`, err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (isDraft = false) => {
    if (!onCreate) return;

    setSaving(true);
    try {
      const selectedCat = fetchedCategories.find(
        (c) => c.name === formData.category,
      );
      // Remove the local 'category' field used for the form,
      // as we save it as categoryName/categoryId
      const { category, ...restFormData } = formData;

      await onCreate({
        ...restFormData,
        categoryName: formData.category,
        categoryId: selectedCat?.id || "",
        order: Number(formData.order) || 0,
        duration: Number(formData.duration) || 0,
        isMood: true,
        isDraft,
        isOnBoarding: formData.isOnBoarding === true,
        steps: steps.filter((s) => s.title || s.description),
      });
      // Reset form
      setFormData(initialForm);
      setSteps([{ title: "", description: "" }]);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="fixed right-6 left-auto top-1/2 -translate-y-1/2 translate-x-0 sm:max-w-[562px] w-full p-0 gap-0 h-[calc(100vh-48px)] flex flex-col bg-white rounded-[24px] overflow-hidden border-none outline-none shadow-2xl max-sm:left-1/2 max-sm:right-auto max-sm:-translate-x-1/2 max-sm:w-[90vw] max-sm:h-[80vh] max-sm:rounded-[20px]"
      >
        {/* Header */}
        <div className="flex flex-col gap-2 p-6 border-b border-[#8F00FF] shrink-0">
          <DialogClose className="outline-none">
            <BackArrow className="flex justify-start w-6 h-6 cursor-pointer" />
          </DialogClose>
          <DialogTitle className="flex justify-start text-[24px] font-bold text-[#111827]">
            Create New Exercise
          </DialogTitle>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div className="flex flex-col gap-2">
            <h3 className="text-[18px] font-bold text-[#111827]">Basics</h3>

            <div>
              <Label required>Title</Label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Enter"
                className="w-full h-[52px] rounded-[12px] border border-[#E5E7EB] px-4 text-[16px] text-[#111827] focus:outline-none focus:border-[#8F00FF] transition-colors placeholder:text-[#9CA3AF]"
              />
            </div>

            <div>
              <Label>Description</Label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Brief description of the exercise"
                rows={4}
                className="w-full rounded-[12px] border border-[#E5E7EB] p-4 text-[16px] text-[#111827] focus:outline-none focus:border-[#8F00FF] transition-colors resize-none placeholder:text-[#9CA3AF]"
              />
            </div>

            <div className="flex flex-row items-start justify-between gap-4 mt-2 p-4 rounded-[16px] border border-[#E9D5FF] bg-[#FDFAFF]">
              <div className="min-w-0 pr-2">
                <p className="text-[15px] font-semibold text-[#111827]">
                  Onboarding exercise
                </p>
                <p
                  className="text-[12px] text-[#6B7280] mt-1 leading-snug"
                  style={{
                    fontFamily: "'Inter Display', var(--font-inter), sans-serif",
                  }}
                >
                  Include in onboarding ({onboardingCount}/{maxOnboardingExercises}{" "}
                  used). Maximum {maxOnboardingExercises} exercises can have this on.
                </p>
              </div>
              <Switch
                checked={formData.isOnBoarding === true}
                onCheckedChange={(v) => handleChange("isOnBoarding", v)}
                disabled={
                  formData.isOnBoarding !== true &&
                  onboardingCount >= maxOnboardingExercises
                }
                aria-label="Onboarding exercise"
              />
            </div>

            <div>
              <Label required>Category</Label>
              <div className="flex flex-wrap gap-3 mt-2">
                {loadingCategories ? (
                  [1, 2, 3, 4, 5, 6].map((i) => (
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
                      isSelected={formData.category === cat.name}
                      onClick={() => handleChange("category", cat.name)}
                    />
                  ))
                )}
              </div>
            </div>

            <div>
              <Label>Order Number</Label>
              <div className="relative h-[52px] w-full rounded-[12px] border border-[#E5E7EB] flex items-center bg-white focus-within:border-[#8F00FF] transition-colors overflow-hidden">
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => handleChange("order", e.target.value)}
                  placeholder="0"
                  className="flex-1 h-full px-4 text-[16px] text-[#111827] focus:outline-none placeholder:text-[#9CA3AF] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <div className="flex flex-col border-l border-[#E5E7EB] h-full w-[40px]">
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center hover:bg-gray-50 border-b border-[#E5E7EB] transition-colors text-gray-500 hover:text-gray-900"
                    onClick={() => handleChange("order", Math.max(0, (Number(formData.order) || 0) + 1))}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                  </button>
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-900"
                    onClick={() => handleChange("order", Math.max(0, (Number(formData.order) || 0) - 1))}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <Label>Duration</Label>
              <div className="relative h-[52px] w-full rounded-[12px] border border-[#E5E7EB] flex items-center bg-white focus-within:border-[#8F00FF] transition-colors overflow-hidden">
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleChange("duration", e.target.value)}
                  placeholder="10"
                  className="flex-1 h-full px-4 text-[16px] text-[#111827] focus:outline-none placeholder:text-[#9CA3AF] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-[#9CA3AF] mr-2">mins</span>
                <div className="flex flex-col border-l border-[#E5E7EB] h-full w-[40px]">
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center hover:bg-gray-50 border-b border-[#E5E7EB] transition-colors text-gray-500 hover:text-gray-900"
                    onClick={() => handleChange("duration", Math.max(0, (Number(formData.duration) || 0) + 1))}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                  </button>
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-900"
                    onClick={() => handleChange("duration", Math.max(0, (Number(formData.duration) || 0) - 1))}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <Label>The Science</Label>
              <input
                type="text"
                value={formData.theScience}
                onChange={(e) => handleChange("theScience", e.target.value)}
                placeholder="Enter"
                className="w-full h-[52px] rounded-[12px] border border-[#E5E7EB] px-4 text-[16px] text-[#111827] focus:outline-none focus:border-[#8F00FF] transition-colors placeholder:text-[#9CA3AF]"
              />
            </div>

            <div>
              <Label>Mesmer Fact</Label>
              <input
                type="text"
                value={formData.mesmerFact}
                onChange={(e) => handleChange("mesmerFact", e.target.value)}
                placeholder="Enter"
                className="w-full h-[52px] rounded-[12px] border border-[#E5E7EB] px-4 text-[16px] text-[#111827] focus:outline-none focus:border-[#8F00FF] transition-colors placeholder:text-[#9CA3AF]"
              />
            </div>

            <div>
              <Label>What It Is</Label>
              <input
                type="text"
                value={formData.whatItIs}
                onChange={(e) => handleChange("whatItIs", e.target.value)}
                placeholder="e.g: Athletes use this to access peak performance on demand"
                className="w-full h-[52px] rounded-[12px] border border-[#E5E7EB] px-4 text-[16px] text-[#111827] focus:outline-none focus:border-[#8F00FF] transition-colors placeholder:text-[#9CA3AF]"
              />
            </div>

            <div>
              <Label>What You Do</Label>
              <input
                type="text"
                value={formData.whatYouDo}
                onChange={(e) => handleChange("whatYouDo", e.target.value)}
                placeholder="e.g: Create an imaginary circle, fill it with confidence, step in when you need it"
                className="w-full h-[52px] rounded-[12px] border border-[#E5E7EB] px-4 text-[16px] text-[#111827] focus:outline-none focus:border-[#8F00FF] transition-colors placeholder:text-[#9CA3AF]"
              />
            </div>

            <div>
              <Label>When To Use</Label>
              <input
                type="text"
                value={formData.whenToUse}
                onChange={(e) => handleChange("whenToUse", e.target.value)}
                placeholder="e.g: Before presentations, social situations, difficult conversations"
                className="w-full h-[52px] rounded-[12px] border border-[#E5E7EB] px-4 text-[16px] text-[#111827] focus:outline-none focus:border-[#8F00FF] transition-colors placeholder:text-[#9CA3AF]"
              />
            </div>

            <div>
              <Label>Read</Label>
              <textarea
                value={formData.read}
                onChange={(e) => handleChange("read", e.target.value)}
                placeholder="Enter reading content"
                rows={3}
                className="w-full rounded-[12px] border border-[#E5E7EB] p-4 text-[16px] text-[#111827] focus:outline-none focus:border-[#8F00FF] transition-colors resize-none placeholder:text-[#9CA3AF]"
              />
            </div>

            <FileUploadField
              label="Listen URL (.mp3)"
              accept="audio/*,.mp3"
              value={formData.listen}
              onChange={(val) => handleChange("listen", val)}
              uploading={listenUploading}
              progress={listenProgress}
              onFileSelect={(file) =>
                uploadFile(file, "audio", setListenUploading, setListenProgress, "listen")
              }
              placeholder="Paste URL or upload from computer"
              mediaType="audio"
            />

            <FileUploadField
              label="Watch URL (.mp4)"
              accept="video/*,.mp4"
              value={formData.watch}
              onChange={(val) => handleChange("watch", val)}
              uploading={watchUploading}
              progress={watchProgress}
              onFileSelect={(file) =>
                uploadFile(file, "video", setWatchUploading, setWatchProgress, "watch")
              }
              placeholder="Paste URL or upload from computer"
              mediaType="video"
            />

            {/* Steps Section */}
            <h3 className="text-[18px] font-bold text-[#111827] mt-4">
              Exercise Steps <span className="text-[#8F00FF] ml-1">*</span>
            </h3>

            <div className="flex flex-col gap-6">
              {steps.map((step, index) => (
                <StepCard
                  key={index}
                  index={index}
                  step={step}
                  onChange={handleStepChange}
                  onDelete={() => deleteStep(index)}
                />
              ))}
            </div>

            <button
              onClick={addStep}
              className="w-max px-6 py-2 rounded-full border border-[#8F00FF] text-[#8F00FF] text-[14px] font-medium hover:bg-[#F3E8FF] transition-colors"
            >
              Add Step
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#F3F4F6] shrink-0 flex gap-4 bg-white">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="w-[110px] h-[52px] rounded-full border-[#8F00FF] text-[#8F00FF] hover:bg-[#F3E8FF] hover:text-[#8F00FF] text-[16px] font-bold"
              style={{
                fontFamily: "'Inter Display', var(--font-inter), sans-serif",
              }}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="outline"
            className="hidden sm:inline-flex w-[150px] h-[52px] rounded-full border-[#d1d5db] text-[#4b5563] hover:bg-gray-50 hover:text-gray-900 text-[16px] font-bold"
            onClick={() => handleCreate(true)}
            disabled={saving || !formData.title}
          >
            Save as Draft
          </Button>
          <Button
            className="flex-1 h-[52px] rounded-full bg-[#8F00FF] hover:bg-[#7a00d9] text-white text-[16px] font-bold disabled:opacity-50"
            onClick={() => handleCreate(false)}
            disabled={saving || !formData.title}
            style={{
              fontFamily: "'Inter Display', var(--font-inter), sans-serif",
            }}
          >
            {saving ? "Creating..." : "Create Exercise"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateExerciseDialog;
