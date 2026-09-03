import React from "react";

/**
 * Renders the light markdown subset that FormattedTextField writes:
 * `**bold**`, `*italic*`, `- ` bullets and blank-line paragraphs.
 *
 * Hand-rolled instead of pulling in a markdown library — the input is a
 * fixed, tiny grammar and building React nodes keeps it injection-safe
 * (no dangerouslySetInnerHTML).
 */

// Bold first so `**x**` never falls through to the italic rule.
const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;

const renderInline = (text, keyPrefix) =>
  text
    .split(INLINE)
    .filter((part) => part !== "")
    .map((part, i) => {
      const key = `${keyPrefix}-${i}`;
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        return (
          <strong key={key} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
        return <em key={key}>{part.slice(1, -1)}</em>;
      }
      return <React.Fragment key={key}>{part}</React.Fragment>;
    });

/** Group a block's lines into runs of bullets and runs of plain text. */
const groupLines = (lines) => {
  const groups = [];
  lines.forEach((line) => {
    const bullet = /^\s*[-*]\s+/.test(line);
    const last = groups[groups.length - 1];
    if (last && last.bullet === bullet) {
      last.lines.push(line);
    } else {
      groups.push({ bullet, lines: [line] });
    }
  });
  return groups;
};

const FormattedText = ({ value, className = "" }) => {
  const text = (value || "").trim();
  if (!text) return null;

  // A blank line (optionally with stray whitespace) starts a new paragraph.
  const blocks = text.split(/\n\s*\n/);

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {blocks.map((block, b) =>
        groupLines(block.split("\n").filter((l) => l.trim() !== "")).map(
          (group, g) => {
            const key = `${b}-${g}`;
            if (group.bullet) {
              return (
                <ul key={key} className="list-disc pl-5 flex flex-col gap-1">
                  {group.lines.map((line, i) => (
                    <li key={i}>
                      {renderInline(line.replace(/^\s*[-*]\s+/, ""), `${key}-${i}`)}
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={key} className="whitespace-pre-wrap">
                {group.lines.map((line, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && "\n"}
                    {renderInline(line, `${key}-${i}`)}
                  </React.Fragment>
                ))}
              </p>
            );
          }
        )
      )}
    </div>
  );
};

export default FormattedText;
