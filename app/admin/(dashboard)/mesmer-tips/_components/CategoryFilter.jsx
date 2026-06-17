import React from "react";

const CategoryFilter = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="overflow-x-auto pb-2 scrollbar-hide">
      <div className="flex justify-start gap-4 min-w-max">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => onCategoryChange(isActive ? null : cat.name)}
              className={`flex min-w-fit h-[38px] items-center gap-[10px] px-[12px] py-[8px] rounded-[12px] border transition-all whitespace-nowrap ${
                isActive
                  ? "border-[#8F00FF] text-[#8F00FF]"
                  : "bg-white border-[#FFCFEE] text-black hover:bg-[#FFF5FB]"
              }`}
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 600,
                fontSize: "12px",
                lineHeight: "16px",
                backgroundColor: isActive ? "#E576BD1A" : undefined,
              }}
            >
              <span className="flex-1 text-left truncate">{cat.name}</span>
              <span
                className={`flex items-center justify-center min-w-[25px] h-[25px] rounded-md text-[14px] font-medium ${
                  isActive ? "bg-[#8F00FF] text-white" : "text-black"
                }`}
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 500,
                  fontSize: "14px",
                  lineHeight: "14px",
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
