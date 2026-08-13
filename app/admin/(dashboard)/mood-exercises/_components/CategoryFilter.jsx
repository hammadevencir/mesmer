import React from "react";
import { getCategoryType, getCategoryColor } from "@/lib/categories";

const CategoryFilter = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex justify-start gap-4 min-w-max">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.name;
          const color = getCategoryColor(getCategoryType(cat.name));
          return (
            <button
              key={cat.name}
              onClick={() => onCategoryChange(isActive ? null : cat.name)}
              className="flex min-w-fit h-[38px] items-center gap-[10px] px-[12px] py-[8px] rounded-[12px] border transition-all whitespace-nowrap"
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 600,
                fontSize: "12px",
                lineHeight: "16px",
                borderColor: color.border,
                color: isActive ? color.text : "#000",
                backgroundColor: isActive ? `${color.bg}` : "#fff",
              }}
            >
              <span className="flex-1 text-left truncate">{cat.name}</span>
              <span
                className="flex items-center justify-center min-w-[25px] h-[25px] rounded-md"
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 500,
                  fontSize: "14px",
                  lineHeight: "14px",
                  backgroundColor: isActive ? color.text : "transparent",
                  color: isActive ? "#fff" : "#000",
                }}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
