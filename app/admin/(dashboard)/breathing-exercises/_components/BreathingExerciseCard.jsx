import React from "react";
import { EditIcon, TrashIcon } from "./Icons";
import EditBreathingExerciseDialog from "./EditBreathingExerciseDialog";
import DeleteBreathingExerciseDialog from "./DeleteBreathingExerciseDialog";

const BreathingExerciseCard = ({ exercise, onUpdate, onDelete }) => {
  const sub = exercise.subTitle?.trim() || "—";
  const sheet = exercise.sheetTitle?.trim() || "—";

  return (
    <div className="bg-white w-full p-5 flex flex-col gap-5 rounded-[24px] border-[1.5px] border-[#EED9FF] hover:shadow-md transition-shadow text-left">
      <div className="flex justify-between items-start gap-2 min-w-0">
        <div className="min-w-0 flex-1">
          <h3
            className="text-black text-[18px] font-semibold leading-tight line-clamp-2"
            style={{
              fontFamily: "'Inter Display', var(--font-inter), sans-serif",
            }}
          >
            {exercise.title || "Untitled"}
          </h3>
          <p
            className="text-[#6C6C6C] text-[14px] mt-1 line-clamp-2"
            style={{
              fontFamily: "'Inter Display', var(--font-inter), sans-serif",
            }}
          >
            {sub}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <EditBreathingExerciseDialog exercise={exercise} onUpdate={onUpdate}>
            <button
              type="button"
              className="p-1 hover:bg-gray-50 rounded-full transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <EditIcon />
            </button>
          </EditBreathingExerciseDialog>
          <DeleteBreathingExerciseDialog
            title={exercise.title}
            onConfirm={onDelete}
          >
            <button
              type="button"
              className="p-1 hover:bg-red-50 rounded-full transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <TrashIcon />
            </button>
          </DeleteBreathingExerciseDialog>
        </div>
      </div>

      <div className="bg-[#F3E8FF] rounded-[16px] p-4 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3 text-[13px] sm:text-[14px]">
          <div>
            <span className="text-[#6C6C6C] block text-[12px]">Cycles</span>
            <span className="font-medium text-[#111827]">{exercise.cycleCount ?? 0}</span>
          </div>
          <div>
            <span className="text-[#6C6C6C] block text-[12px]">Breath in</span>
            <span className="font-medium text-[#111827]">
              {exercise.breathInDuration ?? 0}s
            </span>
          </div>
          <div>
            <span className="text-[#6C6C6C] block text-[12px]">Breath out</span>
            <span className="font-medium text-[#111827]">
              {exercise.breathOutDuration ?? 0}s
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-[#6C6C6C] block text-[12px]">Sheet title</span>
            <span className="font-medium text-[#111827] line-clamp-2">{sheet}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreathingExerciseCard;
