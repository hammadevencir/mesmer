import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BackArrow, TrashIconWhite } from "./Icons";
import AddResultDialog from "./AddResultDialog";

const Label = ({ children, required }) => (
  <label
    className="text-[14px] font-medium text-[#717171] mb-2 block"
    style={{ fontFamily: "'Inter Display', var(--font-inter), sans-serif" }}
  >
    {children}
    {required && <span className="text-[#8F00FF] ml-1">*</span>}
  </label>
);

const Input = ({ value, placeholder, type = "text" }) => (
  <div className="relative">
    <input
      type={type}
      defaultValue={value}
      placeholder={placeholder}
      className="w-full h-[52px] rounded-[12px] border border-[#E5E7EB] bg-white px-4 text-[16px] text-[#111827] focus:outline-none focus:border-[#8F00FF] transition-colors placeholder:text-[#9CA3AF]"
    />
  </div>
);

const TextArea = ({ value, placeholder, rows = 4 }) => (
  <textarea
    defaultValue={value}
    placeholder={placeholder}
    rows={rows}
    className="w-full rounded-[12px] border border-[#E5E7EB] bg-white p-4 text-[16px] text-[#111827] focus:outline-none focus:border-[#8F00FF] transition-colors resize-none placeholder:text-[#9CA3AF]"
  />
);

const StepCard = ({ index, onDelete }) => {
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
        <Input placeholder="Enter" />
      </div>

      <div>
        <Label required>Description</Label>
        <TextArea placeholder="Brief description of the exercise" rows={3} />
      </div>
    </div>
  );
};

const CreateExerciseStepsDialog = ({ children }) => {
  const [steps, setSteps] = useState([{}]);

  const addStep = () => {
    setSteps([...steps, {}]);
  };

  const deleteStep = (index) => {
    if (steps.length > 1) {
      const newSteps = steps.filter((_, i) => i !== index);
      setSteps(newSteps);
    }
  };

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
            Create Exercise Steps
          </DialogTitle>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div className="flex flex-col gap-2">
            <h3 className="text-[18px] font-bold text-[#111827]">
              Exercise Steps <span className="text-[#8F00FF] ml-1">*</span>
            </h3>

            <div className="flex flex-col gap-6">
              {steps.map((_, index) => (
                <StepCard
                  key={index}
                  index={index}
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
          <AddResultDialog>
            <Button
              className="flex-1 h-[52px] rounded-full bg-[#8F00FF] hover:bg-[#7a00d9] text-white text-[16px] font-bold"
              style={{
                fontFamily: "'Inter Display', var(--font-inter), sans-serif",
              }}
            >
              Create Exercise
            </Button>
          </AddResultDialog>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateExerciseStepsDialog;
