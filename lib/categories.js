/**
 * Canonical mood-exercise categories.
 *
 * Categories live in Firestore as free-text docs with no admin UI to manage
 * them, which is how typos ("Social Anixety") and inconsistent names
 * ("School & Exam" vs "School & Exams") crept in. This file is the single
 * source of truth for the two sets Alicia asked for, a typo/rename map so
 * existing data displays correctly today, and the colour used to tell the
 * two sets apart when tagging an exercise.
 *
 * `scripts/fix-categories.js` uses this file to migrate the actual
 * Firestore docs; `app/api/admin/categories/route.js` uses it to normalize
 * whatever is currently stored on every read.
 */

export const MOOD_CATEGORIES = [
  "Confident",
  "Calm",
  "Motivated",
  "Accepted",
  "Focused",
  "Free",
];

export const IMPROVE_CATEGORIES = [
  "Sleep",
  "Friendships & Relationships",
  "School & Exams",
  "Social Anxiety",
  "Self-Esteem & Body Image",
  "Stress & Overthinking",
];

/** Known bad spellings/names -> canonical name. */
const NAME_FIXES = {
  "social anixety": "Social Anxiety",
  "school & exam": "School & Exams",
  "self esteem & body image": "Self-Esteem & Body Image",
};

export function normalizeCategoryName(name) {
  const trimmed = String(name || "").trim();
  const fixed = NAME_FIXES[trimmed.toLowerCase()];
  return fixed || trimmed;
}

export function getCategoryType(name) {
  const normalized = normalizeCategoryName(name);
  if (MOOD_CATEGORIES.includes(normalized)) return "mood";
  if (IMPROVE_CATEGORIES.includes(normalized)) return "improve";
  return "improve";
}

/** Chip colours for the two sets — distinct so admins can tell them apart when tagging. */
export const CATEGORY_COLORS = {
  mood: { bg: "#F3E8FF", text: "#8F00FF", border: "#8F00FF" },
  improve: { bg: "#E0F2FE", text: "#0369A1", border: "#0369A1" },
};

export function getCategoryColor(type) {
  return CATEGORY_COLORS[type] || CATEGORY_COLORS.improve;
}
