import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CloseCircleIcon } from "./Icons";

const DeleteExerciseDialog = ({ children, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    if (!onConfirm) return;
    setDeleting(true);
    try {
      await onConfirm();
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
        className="w-[90%] sm:w-[562px] sm:h-[216px] gap-0 py-9 flex flex-col bg-white rounded-[24px] overflow-hidden border-none outline-none shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-[18px] sm:text-[20px] font-bold text-[#111827]">
              Delete Exercise?
            </DialogTitle>
            <p
              className="text-[14px] sm:text-[16px] text-[#6B7280]"
              style={{
                fontFamily: "'Inter Display', var(--font-inter), sans-serif",
              }}
            >
              Are you sure you want to delete this exercise? This action cannot
              be undone.
            </p>
          </div>
          <DialogClose className="outline-none">
            <CloseCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer" />
          </DialogClose>
        </div>

        {/* Footer / Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-auto w-full">
          <DialogClose asChild className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-[110px] h-[44px] sm:h-[52px] rounded-full border-[#8F00FF] text-[#8F00FF] hover:bg-[#F3E8FF] hover:text-[#8F00FF] text-[14px] sm:text-[16px] font-bold"
              style={{
                fontFamily: "'Inter Display', var(--font-inter), sans-serif",
              }}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            className="w-full sm:flex-1 h-[44px] sm:h-[52px] rounded-full bg-[#8F00FF] hover:bg-[#7a00d9] text-white text-[14px] sm:text-[16px] font-bold disabled:opacity-50"
            onClick={handleDelete}
            disabled={deleting}
            style={{
              fontFamily: "'Inter Display', var(--font-inter), sans-serif",
            }}
          >
            {deleting ? "Deleting..." : "Yes, Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteExerciseDialog;
