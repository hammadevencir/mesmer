"use client";

import React from "react";
import { useRouter } from "next/navigation";

const OtpPage = () => {
  const router = useRouter();

  return (
    <div className="w-full">
      {/* Heading */}
      <h1 className="text-[40px] font-bold text-[#24282E] mb-10 tracking-tight text-center">
        OTP
      </h1>

      <h2 className="text-xl font-medium mb-4 text-left">OTP</h2>

      <form className="flex flex-col gap-2">
        {/* OTP Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[#717171] text-[16px]">Enter OTP</label>
          <input
            type="text"
            placeholder="Enter"
            className="w-full h-[50px] bg-white border border-[#EDEDED] rounded-[10px] px-5 py-4 text-gray-900 placeholder:text-gray-300 focus:ring-purple-500 outline-none text-[15px]"
          />
        </div>

        {/* Resend Timer */}
        <div className="mt-2 text-[16px] font-medium text-[#9D28F0] text-center w-full">
          Resend 01:59
        </div>

        {/* Continue Button */}
        <button
          type="button"
          onClick={() => router.push("/admin/new-password")}
          className="w-full mt-9 bg-[#8F00FF] hover:bg-[#8b2ef0] text-white font-normal text-[16px] py-4 rounded-2xl transition-all shadow-[0_4px_14px_0_rgba(157,40,240,0.39)] hover:shadow-[0_6px_20px_rgba(157,40,240,0.23)]"
        >
          Continue
        </button>
      </form>
    </div>
  );
};

export default OtpPage;
