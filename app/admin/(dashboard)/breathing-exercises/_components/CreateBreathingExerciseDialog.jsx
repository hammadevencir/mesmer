import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CloseCircleIcon } from "./Icons";

const Label = ({ children, required }) => (
  <label
    className="text-[12px] font-medium text-[#717171] mb-1.5 block"
    style={{ fontFamily: "'Inter Display', var(--font-inter), sans-serif" }}
  >
    {children}
    {required && <span className="text-[#8F00FF] ml-1">*</span>}
  </label>
);

const emptyForm = () => ({
  title: "",
  subTitle: "",
  cycleCount: "",
  breathInDuration: "",
  breathOutDuration: "",
  sheetTitle: "",
});

const CreateBreathingExerciseDialog = ({ children, onCreate }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const handleChange = (key) => (e) => {
    const v = e.target.value;
    setForm((prev) => ({ ...prev, [key]: v }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        subTitle: form.subTitle.trim(),
        cycleCount: form.cycleCount === "" ? 0 : Number(form.cycleCount),
        breathInDuration:
          form.breathInDuration === "" ? 0 : Number(form.breathInDuration),
        breathOutDuration:
          form.breathOutDuration === "" ? 0 : Number(form.breathOutDuration),
        sheetTitle: form.sheetTitle.trim(),
      };
      if (onCreate) {
        await onCreate(payload);
      }
      setForm(emptyForm());
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setForm(emptyForm());
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="w-[95%] sm:max-w-[560px] max-h-[90vh] overflow-y-auto p-5 sm:p-6 bg-white rounded-[20px] sm:rounded-[24px] border-none shadow-xl"
      >
        <div className="flex justify-between items-start gap-3 mb-4">
          <div>
            <DialogTitle className="text-[18px] sm:text-[20px] font-bold text-[#111827]">
              New breathing exercise
            </DialogTitle>
            <p
              className="text-[13px] sm:text-[14px] text-[#6B7280] mt-1"
              style={{
                fontFamily: "'Inter Display', var(--font-inter), sans-serif",
              }}
            >
              Fill in the fields below. Durations are in seconds.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="outline-none shrink-0"
            aria-label="Close"
          >
            <CloseCircleIcon className="w-6 h-6 cursor-pointer" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <Label required>Title</Label>
            <input
              type="text"
              value={form.title}
              onChange={handleChange("title")}
              className="w-full h-11 rounded-[12px] border border-[#E5E7EB] px-3 text-[15px] outline-none focus:border-[#8F00FF] focus:ring-1 focus:ring-[#8F00FF]"
              placeholder="Exercise name"
            />
          </div>
          <div>
            <Label>Subtitle</Label>
            <input
              type="text"
              value={form.subTitle}
              onChange={handleChange("subTitle")}
              className="w-full h-11 rounded-[12px] border border-[#E5E7EB] px-3 text-[15px] outline-none focus:border-[#8F00FF]"
              placeholder="Short line under the title"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Cycle count</Label>
              <input
                type="number"
                min={0}
                step={1}
                value={form.cycleCount}
                onChange={handleChange("cycleCount")}
                className="w-full h-11 rounded-[12px] border border-[#E5E7EB] px-3 text-[15px] outline-none focus:border-[#8F00FF]"
                placeholder="0"
              />
            </div>
            <div>
              <Label>Breath in (seconds)</Label>
              <input
                type="number"
                min={0}
                step={1}
                value={form.breathInDuration}
                onChange={handleChange("breathInDuration")}
                className="w-full h-11 rounded-[12px] border border-[#E5E7EB] px-3 text-[15px] outline-none focus:border-[#8F00FF]"
                placeholder="0"
              />
            </div>
            <div>
              <Label>Breath out (seconds)</Label>
              <input
                type="number"
                min={0}
                step={1}
                value={form.breathOutDuration}
                onChange={handleChange("breathOutDuration")}
                className="w-full h-11 rounded-[12px] border border-[#E5E7EB] px-3 text-[15px] outline-none focus:border-[#8F00FF]"
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <Label>Sheet title</Label>
            <input
              type="text"
              value={form.sheetTitle}
              onChange={handleChange("sheetTitle")}
              className="w-full h-11 rounded-[12px] border border-[#E5E7EB] px-3 text-[15px] outline-none focus:border-[#8F00FF]"
              placeholder="Bottom sheet heading"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="w-full sm:w-auto rounded-full border-[#8F00FF] text-[#8F00FF] h-11 sm:h-12 px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !form.title.trim()}
              className="w-full sm:flex-1 rounded-full bg-[#8F00FF] hover:bg-[#7a00d9] h-11 sm:h-12 text-[15px] font-semibold"
            >
              {saving ? "Saving..." : "Save exercise"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBreathingExerciseDialog;
