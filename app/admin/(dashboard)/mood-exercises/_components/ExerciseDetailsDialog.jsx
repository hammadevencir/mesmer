import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  BackArrow,
  ReadIcon,
  ListenIcon,
  WatchIcon,
} from "./Icons";

const Label = ({ children }) => (
  <label
    className="text-[14px] font-medium text-[#717171] mb-2 block"
    style={{ fontFamily: "'Inter Display', var(--font-inter), sans-serif" }}
  >
    {children}
  </label>
);

const ReadOnlyField = ({ value, placeholder }) => (
  <div className="w-full min-h-[52px] rounded-[12px] border border-[#E5E7EB] px-4 py-3 text-[16px] text-[#111827] bg-gray-50">
    {value || <span className="text-[#9CA3AF]">{placeholder || "—"}</span>}
  </div>
);

const ReadOnlyTextArea = ({ value, placeholder }) => (
  <div className="w-full rounded-[12px] border border-[#E5E7EB] p-4 text-[16px] text-[#111827] bg-gray-50 min-h-[80px] whitespace-pre-wrap">
    {value || <span className="text-[#9CA3AF]">{placeholder || "—"}</span>}
  </div>
);

const MediaField = ({ label, icon, url }) => (
  <div className="flex flex-col gap-1">
    <Label>{label}</Label>
    <div className="w-full min-h-[56px] bg-[#EED9FF] rounded-[8px] flex items-center px-4 justify-between gap-3">
      <span className="text-[#555] text-[14px] truncate flex-1">
        {url || "No media attached"}
      </span>
      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-[#8F00FF] shrink-0">
        {icon}
      </div>
    </div>
  </div>
);

const StepItem = ({ step, index }) => {
  const stepNumber = String(index + 1).padStart(2, "0");
  return (
    <div className="bg-[#F3E8FF] rounded-[16px] p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="bg-[#8F00FF] text-white text-[12px] font-bold w-7 h-7 rounded-full flex items-center justify-center">
          {stepNumber}
        </span>
        <h4 className="text-[16px] font-semibold text-[#111827]">
          {step.title || `Step ${stepNumber}`}
        </h4>
      </div>
      <p className="text-[14px] text-[#6B7280] leading-relaxed pl-9">
        {step.description || "—"}
      </p>
    </div>
  );
};

const ExerciseDetailsDialog = ({ children, exercise }) => {
  const stepsCount = Array.isArray(exercise.steps)
    ? exercise.steps.length
    : 0;

  return (
    <Dialog>
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
            Exercise Details
          </DialogTitle>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-4">
            {/* Basics Section */}
            <h3 className="text-[18px] font-bold text-[#111827]">Basics</h3>

            <div>
              <Label>Title</Label>
              <ReadOnlyField value={exercise.title} />
            </div>

            <div>
              <Label>Description</Label>
              <ReadOnlyTextArea value={exercise.description} />
            </div>

            <div>
              <Label>Category</Label>
              <ReadOnlyField
                value={exercise.categoryName || exercise.category}
              />
            </div>

            <div>
              <Label>Duration</Label>
              <ReadOnlyField
                value={exercise.duration ? `${exercise.duration} mins` : ""}
              />
            </div>

            <div>
              <Label>The Science</Label>
              <ReadOnlyTextArea value={exercise.theScience} />
            </div>

            <div>
              <Label>Mesmer Fact</Label>
              <ReadOnlyTextArea value={exercise.mesmerFact} />
            </div>

            <div>
              <Label>What It Is</Label>
              <ReadOnlyTextArea value={exercise.whatItIs} />
            </div>

            <div>
              <Label>What You Do</Label>
              <ReadOnlyTextArea value={exercise.whatYouDo} />
            </div>

            <div>
              <Label>When To Use</Label>
              <ReadOnlyTextArea value={exercise.whenToUse} />
            </div>

            {/* Media Section */}
            <MediaField
              label="Read"
              icon={<ReadIcon className="w-5 h-5" />}
              url={exercise.read}
            />
            <MediaField
              label="Listen"
              icon={<ListenIcon className="w-5 h-5" />}
              url={exercise.listen}
            />
            <MediaField
              label="Watch"
              icon={<WatchIcon className="w-5 h-5" />}
              url={exercise.watch}
            />

            {/* Steps Section */}
            {stepsCount > 0 && (
              <>
                <h3 className="text-[18px] font-bold text-[#111827] mt-4">
                  Steps ({String(stepsCount).padStart(2, "0")})
                </h3>
                <div className="flex flex-col gap-3">
                  {exercise.steps.map((step, index) => (
                    <StepItem key={index} step={step} index={index} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#F3F4F6] shrink-0 flex gap-4 bg-white">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="w-[96px] h-[52px] rounded-full border-[#8F00FF] text-[#8F00FF] hover:bg-[#F3E8FF] hover:text-[#8F00FF] text-[16px] font-bold"
              style={{
                fontFamily: "'Inter Display', var(--font-inter), sans-serif",
              }}
            >
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseDetailsDialog;
