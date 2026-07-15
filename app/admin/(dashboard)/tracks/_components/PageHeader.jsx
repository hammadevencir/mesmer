import React from "react";

const PageHeader = ({ title, subtitle }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="space-y-1 sm:space-y-3">
        <h1
          className="text-2xl font-bold text-[#1A1A1A]"
          style={{ fontFamily: "var(--font-nunito-sans)" }}
        >
          {title}
        </h1>
        <p
          className="text-[#6C6C6C] font-normal text-[14px] sm:text-[20px] tracking-tight"
          style={{
            fontFamily: "'Inter Display', var(--font-inter), sans-serif",
          }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default PageHeader;
