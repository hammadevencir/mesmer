import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CloseCircleIcon } from "./Icons";

const DeleteBreathingExerciseDialog = ({ children, onConfirm, title }) => {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      if (onConfirm) {
        await onConfirm();
      }
      setOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        {children}
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="w-[90%] sm:max-w-[562px] p-5 sm:p-6 flex flex-col gap-5 sm:gap-6 bg-white rounded-[20px] sm:rounded-[24px] overflow-hidden border-none outline-none shadow-xl h-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1 min-w-0 pr-2">
            <DialogTitle className="text-[18px] sm:text-[20px] font-bold text-[#111827]">
              Delete breathing exercise
            </DialogTitle>
            <p
              className="text-[14px] sm:text-[16px] text-[#6B7280]"
              style={{
                fontFamily: "'Inter Display', var(--font-inter), sans-serif",
              }}
            >
              Are you sure you want to delete
              {title ? (
                <>
                  {" "}
                  <span className="font-medium text-[#111827]">&ldquo;{title}&rdquo;</span>
                </>
              ) : (
                " this exercise"
              )}
              ?
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="outline-none focus:outline-none shrink-0"
          >
            <CloseCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-auto w-full">
          <Button
            variant="outline"
            disabled={deleting}
            onClick={() => setOpen(false)}
            className="w-full sm:w-[110px] h-[44px] sm:h-[52px] rounded-full border-[#8F00FF] text-[#8F00FF] hover:bg-[#F3E8FF] hover:text-[#8F00FF] text-[14px] sm:text-[16px] font-bold"
            style={{
              fontFamily: "'Inter Display', var(--font-inter), sans-serif",
            }}
          >
            Cancel
          </Button>
          <Button
            className="w-full sm:flex-1 h-[44px] sm:h-[52px] rounded-full bg-[#8F00FF] hover:bg-[#7a00d9] text-white text-[14px] sm:text-[16px] font-bold shadow-md"
            onClick={handleDelete}
            disabled={deleting}
            style={{
              fontFamily: "'Inter Display', var(--font-inter), sans-serif",
            }}
          >
            {deleting ? "Deleting..." : "Yes, delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteBreathingExerciseDialog;
