import React from "react";

/**
 * MesmerLoader — A premium animated loading component.
 *
 * Variants:
 * - "orbital"  (default) — Orbiting dots around a pulsing core
 * - "wave"     — Animated sound-wave bars
 * - "minimal"  — Simple elegant spinner
 *
 * Sizes: "sm" | "md" (default) | "lg"
 */
const MesmerLoader = ({
  variant = "orbital",
  size = "md",
  message = "Loading...",
  showMessage = true,
}) => {
  const sizeMap = {
    sm: { wrapper: "w-12 h-12", text: "text-[12px]", gap: "gap-2" },
    md: { wrapper: "w-16 h-16", text: "text-[14px]", gap: "gap-3" },
    lg: { wrapper: "w-24 h-24", text: "text-[16px]", gap: "gap-4" },
  };

  const s = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex flex-col items-center justify-center ${s.gap}`}>
      {variant === "orbital" && (
        <div className={`${s.wrapper} relative`}>
          {/* Pulsing core */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="mesmer-loader-core" />
          </div>
          {/* Orbital ring */}
          <div className="absolute inset-0 mesmer-loader-orbit">
            <div className="mesmer-loader-dot mesmer-dot-1" />
            <div className="mesmer-loader-dot mesmer-dot-2" />
            <div className="mesmer-loader-dot mesmer-dot-3" />
          </div>
          {/* Outer glow ring */}
          <div className="absolute inset-[-4px] rounded-full mesmer-loader-ring" />
        </div>
      )}

      {variant === "wave" && (
        <div className={`flex items-end ${s.gap} ${s.wrapper} justify-center`}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="mesmer-wave-bar"
              style={{ animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
      )}

      {variant === "minimal" && (
        <div className={`${s.wrapper} relative`}>
          <div className="absolute inset-0 mesmer-loader-arc" />
          <div className="absolute inset-[6px] mesmer-loader-arc-inner" />
        </div>
      )}

      {showMessage && (
        <p
          className={`${s.text} text-[#8E8E93] font-medium mesmer-loader-text`}
          style={{
            fontFamily: "'Inter Display', var(--font-inter), sans-serif",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default MesmerLoader;
