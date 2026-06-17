import React from "react";

const Tabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex gap-6 ml-6 mb-3">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`pb-3 text-[16px] font-medium transition-all relative ${
            activeTab === tab ? "text-[#8F00FF]" : "text-[#8E8E93]"
          }`}
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          {tab}
          {activeTab === tab && (
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#8F00FF] rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
