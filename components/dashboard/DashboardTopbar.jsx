"use client";

import React from "react";
import NotificationDropdown from "./NotificationDropdown";
import { MobileSidebar } from "@/components/dashboard/sidebar/DashboardSidebar";

const DashboardTopbar = () => {
  return (
    <div className="w-full h-[64px] lg:h-[80px] flex items-end shrink-0">
      <header className="w-full h-[64px] lg:h-[80px] bg-white border-b lg:border-t lg:border-l border-gray-200 lg:rounded-tl-[30px] flex items-center justify-between px-4 lg:px-6">
        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <MobileSidebar />
        </div>

        {/* Spacer for desktop */}
        <div className="hidden lg:block"></div>

        {/* Right Side Content */}
        <div className="flex items-center">
          {/* Notification Dropdown */}
          <NotificationDropdown />
        </div>
      </header>
    </div>
  );
};

export default DashboardTopbar;
