"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeClosed } from "lucide-react";
import { getClientAuth } from "@/lib/firebase/client";
import { signInWithEmailAndPassword } from "firebase/auth";

const SignInPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const auth = getClientAuth();
    if (!auth) {
      setError("Auth not available.");
      setLoading(false);
      return;
    }

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCred.user.getIdToken();
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create session");
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      const message =
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
          ? "Invalid email or password."
          : err.message || "Sign in failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Heading */}
      <h1 className="text-[40px] font-bold text-[#24282E] mb-8 tracking-tight text-center">
        Sign In
      </h1>

      <h2 className="text-xl font-medium mb-3 text-left">Enter your details</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-1">
        {error && (
          <p className="text-red-600 text-sm mb-2 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        {/* Email Input */}
        <div className="flex flex-col gap-1">
          <label className="text-[#717171] text-[15px]">Email</label>
          <input
            type="email"
            placeholder="Enter"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="w-full h-[50px] bg-white border border-[#EDEDED] rounded-[10px] px-5 py-4 text-gray-900 placeholder:text-gray-300 focus:ring-purple-500 outline-none text-[15px] disabled:opacity-70"
          />
        </div>

        {/* Password Input */}
        <div className="flex flex-col gap-1">
          <label className="text-[#717171] text-[15px]">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full h-[50px] bg-white border border-[#EDEDED] rounded-[10px] px-5 py-4 pr-12 text-gray-900 placeholder:text-gray-300 focus:ring-purple-500 outline-none text-[15px] disabled:opacity-70"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#717171] hover:text-gray-900 rounded-md transition-colors outline-none border-0 bg-transparent cursor-pointer focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 select-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeClosed className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Forgot Password Link */}
        <Link
          href="/admin/forget-password"
          className="text-[#9D28F0] pl-[14px] mt-1 font-medium text-[14px] hover:text-[#8b2ef0] transition-colors"
        >
          Forgot Password?
        </Link>

        {/* Continue Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-9 bg-[#8F00FF] hover:bg-[#8b2ef0] disabled:opacity-70 disabled:cursor-not-allowed text-white font-normal text-[16px] py-4 rounded-2xl transition-all shadow-[0_4px_14px_0_rgba(157,40,240,0.39)] hover:shadow-[0_6px_20px_rgba(157,40,240,0.23)]"
        >
          {loading ? "Signing in…" : "Continue"}
        </button>
      </form>
    </div>
  );
};

export default SignInPage;
