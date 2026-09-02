import React, { useRef } from "react";

/**
 * Multi-line text field with light markdown formatting for the exercise
 * copy that Alicia writes long-form — The Science and Mesmer Fact.
 *
 * These were single-line `<input>`s, so there was no way to add a bold run
 * or a paragraph break at all. Storage stays a plain string; the markers
 * are markdown (`**bold**`, `*italic*`, `- ` bullets, blank line =
 * paragraph) so the app renders them with a markdown widget.
 */

const TOOLBAR = [
  { key: "bold", label: "B", title: "Bold (Ctrl+B)", wrap: "**", className: "font-bold" },
  { key: "italic", label: "I", title: "Italic (Ctrl+I)", wrap: "*", className: "italic" },
];

const FormattedTextField = ({
  label,
  value,
  onChange,
  placeholder = "Enter",
  rows = 5,
  hint = "Blank line starts a new paragraph. Use the buttons for **bold** or *italic*.",
}) => {
  const textareaRef = useRef(null);

  /** Wrap the current selection (or insert a placeholder) in `marker`. */
  const applyWrap = (marker) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const current = value || "";
    const selected = current.slice(start, end);
    const inner = selected || "text";
    const next =
      current.slice(0, start) + marker + inner + marker + current.slice(end);
    onChange(next);
    // Re-select the wrapped text so the author can keep typing over it.
    requestAnimationFrame(() => {
      el.focus();
      const from = start + marker.length;
      el.setSelectionRange(from, from + inner.length);
    });
  };

  const insertBullet = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const current = value || "";
    const atLineStart = start === 0 || current[start - 1] === "\n";
    const prefix = atLineStart ? "- " : "\n- ";
    const next = current.slice(0, start) + prefix + current.slice(start);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + prefix.length;
      el.setSelectionRange(caret, caret);
    });
  };

  const handleKeyDown = (e) => {
    if (!(e.metaKey || e.ctrlKey)) return;
    const key = e.key.toLowerCase();
    if (key === "b") {
      e.preventDefault();
      applyWrap("**");
    } else if (key === "i") {
      e.preventDefault();
      applyWrap("*");
    }
  };

  return (
    <div>
      <label
        className="text-[14px] font-medium text-[#717171] mb-2 block"
        style={{ fontFamily: "'Inter Display', var(--font-inter), sans-serif" }}
      >
        {label}
      </label>

      <div className="rounded-[12px] border border-[#E5E7EB] focus-within:border-[#8F00FF] transition-colors overflow-hidden bg-white">
        <div className="flex items-center gap-1 px-2 py-1.5 border-b border-[#F3F4F6] bg-[#FDFAFF]">
          {TOOLBAR.map((btn) => (
            <button
              key={btn.key}
              type="button"
              title={btn.title}
              onClick={() => applyWrap(btn.wrap)}
              className={`w-8 h-8 rounded-[8px] text-[15px] text-[#8F00FF] hover:bg-[#F3E8FF] transition-colors ${btn.className}`}
            >
              {btn.label}
            </button>
          ))}
          <button
            type="button"
            title="Bullet point"
            onClick={insertBullet}
            className="w-8 h-8 rounded-[8px] text-[15px] text-[#8F00FF] hover:bg-[#F3E8FF] transition-colors"
          >
            •
          </button>
        </div>

        <textarea
          ref={textareaRef}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={rows}
          className="w-full p-4 text-[16px] text-[#111827] focus:outline-none resize-y placeholder:text-[#9CA3AF] bg-white"
        />
      </div>

      {hint && <p className="text-[12px] text-[#9CA3AF] mt-1">{hint}</p>}
    </div>
  );
};

export default FormattedTextField;
