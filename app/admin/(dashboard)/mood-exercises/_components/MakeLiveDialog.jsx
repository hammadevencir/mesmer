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

const MakeLiveDialog = ({ children, onConfirm }) => {
  const [open, setOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleConfirm = async () => {
    if (!onConfirm) return;
    setProcessing(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        {children}
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        // Figma specs: 562px width, 216px height, 24px gap, 24px radius
        className="max-w-[562px] w-full p-6 flex flex-col gap-6 bg-white rounded-[24px] overflow-hidden border-none outline-none shadow-xl fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-sm:w-[90%] max-sm:max-w-[400px]"
        style={{ height: "216px" }}
        // Prevent click propogation from the content if necessary, though Dialog overlay handles modal behavior
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-[20px] font-bold text-[#111827]">
              Make it Live?
            </DialogTitle>
            <p className="text-[16px] text-[#6B7280]">
              Are you sure you want to make the exercise live?
            </p>
          </div>
          <DialogClose className="outline-none">
            <CloseCircleIcon className="w-6 h-6 cursor-pointer" />
          </DialogClose>
        </div>

        {/* Footer / Actions */}
        <div className="flex items-center gap-4 mt-auto">
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
            className="flex-1 h-[52px] rounded-full bg-[#8F00FF] hover:bg-[#7a00d9] text-white text-[16px] font-bold"
            disabled={processing}
            style={{
              fontFamily: "'Inter Display', var(--font-inter), sans-serif",
            }}
            onClick={handleConfirm}
          >
            {processing ? "Going Live..." : "Go Live"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MakeLiveDialog;
