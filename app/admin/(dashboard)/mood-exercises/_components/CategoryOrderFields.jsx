import React from "react";

/**
 * One order number per selected category.
 *
 * An exercise usually belongs to several categories and needs a different
 * position in each — the single `order` field forced the same position
 * everywhere. That default order stays (it is what the app uses for any
 * category left blank here, and for unfiltered lists); these inputs write
 * the per-category overrides.
 */

const OrderInput = ({ value, placeholder, onChange }) => {
  const step = (delta) =>
    onChange(String(Math.max(0, (Number(value) || 0) + delta)));

  return (
    <div className="relative h-[44px] w-[120px] shrink-0 rounded-[12px] border border-[#E5E7EB] flex items-center bg-white focus-within:border-[#8F00FF] transition-colors overflow-hidden">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-w-0 h-full px-3 text-[15px] text-[#111827] focus:outline-none placeholder:text-[#9CA3AF] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <div className="flex flex-col border-l border-[#E5E7EB] h-full w-[32px]">
        <button
          type="button"
          onClick={() => step(1)}
          className="flex-1 flex items-center justify-center hover:bg-gray-50 border-b border-[#E5E7EB] transition-colors text-gray-500 hover:text-gray-900"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
        </button>
        <button
          type="button"
          onClick={() => step(-1)}
          className="flex-1 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-900"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </button>
      </div>
    </div>
  );
};

const CategoryOrderFields = ({
  categoryNames = [],
  categoryOrders = {},
  defaultOrder = 0,
  onChange,
}) => {
  if (categoryNames.length === 0) return null;

  return (
    <div>
      <label
        className="text-[14px] font-medium text-[#717171] mb-2 block"
        style={{ fontFamily: "'Inter Display', var(--font-inter), sans-serif" }}
      >
        Order within each category
      </label>
      <p className="text-[12px] text-[#9CA3AF] mb-2 -mt-1">
        Each category has its own ordering. Leave a category blank to use the
        default order ({Number(defaultOrder) || 0}).
      </p>
      <div className="flex flex-col gap-2">
        {categoryNames.map((name) => {
          const raw = categoryOrders?.[name];
          return (
            <div
              key={name}
              className="flex items-center justify-between gap-3 rounded-[12px] border border-[#E9D5FF] bg-[#FDFAFF] px-3 py-2"
            >
              <span className="text-[14px] text-[#111827] font-medium min-w-0 truncate">
                {name}
              </span>
              <OrderInput
                value={raw === undefined || raw === null ? "" : String(raw)}
                placeholder={String(Number(defaultOrder) || 0)}
                onChange={(val) => onChange(name, val)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryOrderFields;
