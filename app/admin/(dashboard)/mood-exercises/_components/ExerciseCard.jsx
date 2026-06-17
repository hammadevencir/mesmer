import React from "react";
import { Switch } from "@/components/ui/switch";
import { EditIcon, TrashIcon, ClockIcon, StepsIcon } from "./Icons";
import ExerciseDetailsDialog from "./ExerciseDetailsDialog";
import MakeLiveDialog from "./MakeLiveDialog";
import EditExerciseDialog from "./EditExerciseDialog";
import DeleteExerciseDialog from "./DeleteExerciseDialog";

const ExerciseCard = ({
  exercise,
  isDraft,
  onDelete,
  onUpdate,
  onboardingCount = 0,
  maxOnboardingExercises = 3,
}) => {
  const stepsCount = Array.isArray(exercise.steps) ? exercise.steps.length : 0;
  const durationDisplay = `${exercise.duration || 0} mins`;
  const stepsDisplay = `${String(stepsCount).padStart(2, "0")} steps`;
  const categoryDisplay = exercise.categoryName || exercise.category || "—";
  const descriptionDisplay = exercise.description?.trim() || "—";

  const otherOnboardingCount =
    onboardingCount - (exercise.isOnBoarding ? 1 : 0);
  const onboardingToggleDisabled =
    !exercise.isOnBoarding &&
    otherOnboardingCount >= maxOnboardingExercises;

  return (
    <ExerciseDetailsDialog exercise={exercise}>
      <div className="bg-white w-full h-full min-h-[226px] p-4 flex flex-col gap-6 rounded-[16px] border-[1.5px] border-[#EED9FF] hover:shadow-md transition-shadow cursor-pointer text-left min-w-0 overflow-hidden">
        {/* Card Header */}
        <div className="flex justify-between items-center mb-0.5 gap-2 min-w-0 shrink-0">
          <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
            <span className="bg-[#F3E8FF] text-[#8F00FF] text-[13px] font-medium py-2.5 px-3 rounded-full truncate min-w-0 max-w-[60%]">
              {categoryDisplay}
            </span>
            {exercise.isOnBoarding && (
              <span className="bg-emerald-50 text-emerald-800 text-[12px] font-semibold py-2 px-2.5 rounded-full shrink-0 border border-emerald-200">
                Onboarding
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <EditExerciseDialog
              exercise={exercise}
              onUpdate={onUpdate}
              onboardingCount={onboardingCount}
              maxOnboardingExercises={maxOnboardingExercises}
            >
              <button
                className="p-1 hover:bg-gray-50 rounded-full transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <EditIcon />
              </button>
            </EditExerciseDialog>
            <DeleteExerciseDialog onConfirm={onDelete}>
              <button
                className="p-1 hover:bg-red-50 rounded-full transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <TrashIcon />
              </button>
            </DeleteExerciseDialog>
          </div>
        </div>

        {/* Onboarding toggle */}
        {!isDraft && (
          <div
            className="flex items-center justify-between gap-3 py-2 px-1 rounded-[12px] border border-[#E9D5FF] bg-[#FDFAFF]/80 -mt-1"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <span
              className="text-[13px] text-[#374151]"
              style={{
                fontFamily: "'Inter Display', var(--font-inter), sans-serif",
              }}
            >
              Include in onboarding ({onboardingCount}/{maxOnboardingExercises})
            </span>
            <Switch
              checked={exercise.isOnBoarding === true}
              disabled={onboardingToggleDisabled}
              onCheckedChange={(checked) =>
                onUpdate({ ...exercise, isOnBoarding: checked })
              }
              aria-label="Toggle onboarding exercise"
            />
          </div>
        )}

        {/* Inner Content Box */}
        <div className="bg-[#F3E8FF] rounded-[12px] p-4 flex-1 flex flex-col justify-center min-h-0 overflow-hidden">
          <p
            className="text-[14px] font-normal text-[#6C6C6C] mb-2 flex items-start gap-2 tracking-tight line-clamp-2 wrap-break-word overflow-hidden min-w-0"
            style={{
              fontFamily: "'Inter Display', var(--font-inter), sans-serif",
            }}
          >
            <span className="w-4 h-px bg-[#6C6C6C] shrink-0 mt-1.5" />{" "}
            <span className="line-clamp-2 wrap-break-word">{descriptionDisplay}</span>
          </p>
          <h3
            className="text-black text-[18px] font-medium leading-[1.2] line-clamp-2 tracking-tight wrap-break-word overflow-hidden min-w-0"
            style={{
              fontFamily: "'Inter Display', var(--font-inter), sans-serif",
            }}
          >
            {exercise.title}
          </h3>
        </div>

        {/* Card Footer */}
        <div className="flex items-center gap-4 text-[#6C6C6C] text-[14px] font-normal mt-2">
          <div className="flex items-center gap-2">
            <ClockIcon />
            {durationDisplay}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 bg-[#6C6C6C] rounded-full" />
            <StepsIcon />
            {stepsDisplay}
          </div>
        </div>

        {/* Draft Action Button */}
        {isDraft && (
          <MakeLiveDialog onConfirm={() => onUpdate({ ...exercise, isDraft: false })}>
            <button
              className="w-full py-2.5 rounded-full border-[1.5px] border-[#8F00FF] text-[#8F00FF] text-[18px] font-bold hover:bg-[#F3E8FF] transition-colors mt-[-8px]"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              Make it Live
            </button>
          </MakeLiveDialog>
        )}
      </div>
    </ExerciseDetailsDialog>
  );
};

export default ExerciseCard;
