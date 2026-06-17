"use client";

import React from "react";
import Image from "next/image";

const AdminAuthLayout = ({ children }) => {
  return (
    <div
      className="min-h-screen w-full md:min-w-[464.15px] flex flex-col items-center justify-center"
      style={{
        background:
          "linear-gradient(180.01deg, #FFFFFF 0.01%, #F5E9FC 88.16%, #FAD1F0 108.56%)",
      }}
    >
      {/* --- Static Logo Section --- */}
      <div className="my-3">
        <Image
          src="/mesmer.png"
          alt="MESMER"
          width={280}
          height={100}
          className="mx-auto"
          priority
        />
      </div>

      {/* --- Dynamic Content Section --- */}
      <div className="w-full max-w-[464.15px] px-5 md:px-0">{children}</div>
    </div>
  );
};

export default AdminAuthLayout;
