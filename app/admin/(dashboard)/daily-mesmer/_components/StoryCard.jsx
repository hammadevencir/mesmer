import React from "react";
import { EditIcon, TrashIcon, CalendarIcon } from "./Icons";
import EditStoryDialog from "./EditStoryDialog";
import DeleteStoryDialog from "./DeleteStoryDialog";

const StoryCard = ({ story, onUpdate, onDelete }) => {
  return (
    <div className="bg-white w-full p-5 flex flex-col gap-5 rounded-[24px] border-[1.5px] border-[#EED9FF] hover:shadow-md transition-shadow cursor-pointer text-left">
      {/* Card Header */}
      <div className="flex justify-between items-center">
        <span className="bg-[#F3E8FF] text-[#8F00FF] text-[14px] font-bold py-1.5 px-4 rounded-full">
          {story.category}
        </span>
        <div className="flex items-center gap-2">
          <EditStoryDialog story={story} onUpdate={onUpdate}>
            <button
              className="p-1 hover:bg-gray-50 rounded-full transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <EditIcon className="w-6 h-6" />
            </button>
          </EditStoryDialog>
          <DeleteStoryDialog
            storyContent={story.content}
            onConfirm={onDelete}
          >
            <button
              className="p-1 hover:bg-red-50 rounded-full transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <TrashIcon className="w-6 h-6" />
            </button>
          </DeleteStoryDialog>
        </div>
      </div>

      {/* Content Box */}
      <div className="bg-[#F3E8FF] h-fit rounded-[16px] p-3 flex flex-col items-start justify-start overflow-hidden">
        <p
          className="text-[#6C6C6C] text-[16px] tracking-tight"
          style={{
            fontFamily: "'Inter Display', var(--font-inter), sans-serif",
          }}
        >
          {story.content}
        </p>
      </div>

      {/* Card Footer */}
      <div className="flex items-center gap-2 text-[#6C6C6C] text-[14px] font-medium mt-auto">
        <CalendarIcon className="w-5 h-5" />
        <span
          style={{
            fontFamily: "'Inter Display', var(--font-inter), sans-serif",
          }}
        >
          {story.date}
        </span>
      </div>
    </div>
  );
};

export default StoryCard;
