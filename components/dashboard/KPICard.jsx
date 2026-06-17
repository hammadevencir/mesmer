"use client";

import React from "react";

const KPICard = ({
  title,
  value,
  percentage,
  icon: Icon,
  iconBgColor,
  iconColor,
  customIcon,
  rounded = "[20px]",
}) => {
  const roundedClass =
    rounded === "[20px]" ? "rounded-[20px]" : `rounded-${rounded}`;

  return (
    <div
      className={`bg-white ${roundedClass} p-5 sm:p-4 flex flex-col border-[1.5px] border-[#E7D9FF]`}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="flex flex-col">
          <p
            className="text-[#6C6C6C] text-sm font-medium mb-3"
            style={{ fontFamily: "var(--font-nunito-sans)" }}
          >
            {title}
          </p>
          <p
            className="text-3xl sm:text-[32px] font-bold text-[#1A1A1A]"
            style={{ fontFamily: "var(--font-nunito-sans)" }}
          >
            {value}
          </p>
        </div>
        <div
          className={`w-[40px] h-[40px] ${iconBgColor} rounded-full flex items-center justify-center shrink-0`}
        >
          {Icon && (
            <div className={iconColor}>
              <Icon className="w-[24px] h-[24px]" />
            </div>
          )}
          {customIcon && customIcon}
        </div>
      </div>
      <div>
        <p
          className="text-[#757575] text-sm"
          style={{ fontFamily: "var(--font-nunito-sans)" }}
        >
          <span className="text-[#1A1A1A] font-semibold">{percentage}</span>
        </p>
      </div>
    </div>
  );
};

export default KPICard;
