import React from "react";

/**
 * Read-only view of the Home screen triage list: slots 1..max in the order
 * the app shows them. Editing happens on the exercise cards.
 */
const TriageSummary = ({ exercises = [], max = 4, footer }) => {
  const slots = Array.from({ length: max }, (_, i) => exercises[i] || null);

  return (
    <div className="bg-white w-full p-4 flex flex-col gap-3 rounded-[16px] border-[1.5px] border-sky-200">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[16px] font-semibold text-[#1A1A1A]">
          Home triage ({exercises.length}/{max})
        </h3>
        <p className="text-[13px] text-[#6C6C6C]">
          Shown on Home when a user selects Calm or Stress &amp; Overthinking,
          in this order.
        </p>
      </div>
      <ol className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
        {slots.map((ex, i) => (
          <li
            key={ex?.id || `empty-${i}`}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-[12px] border min-w-0 ${
              ex
                ? "border-sky-200 bg-sky-50/60"
                : "border-dashed border-gray-300 bg-white"
            }`}
          >
            <span
              className={`flex items-center justify-center w-6 h-6 rounded-full text-[12px] font-semibold shrink-0 ${
                ex ? "bg-sky-700 text-white" : "bg-gray-100 text-gray-400"
              }`}
            >
              {i + 1}
            </span>
            <span className="min-w-0 flex flex-col">
              <span
                className={`text-[14px] truncate ${
                  ex ? "text-[#1A1A1A]" : "text-gray-400"
                }`}
              >
                {ex ? ex.title : "Empty"}
              </span>
              {ex?.categoryNames?.length > 0 && (
                <span className="text-[12px] text-[#6C6C6C] truncate">
                  {ex.categoryNames.join(", ")}
                </span>
              )}
            </span>
          </li>
        ))}
      </ol>
      {footer}
    </div>
  );
};

export default TriageSummary;
