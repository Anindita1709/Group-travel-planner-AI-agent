/**
 * Format a date string to human-readable form.
 * @param {string} dateStr  ISO or YYYY-MM-DD string
 * @param {Intl.DateTimeFormatOptions} opts  Optional Intl options
 */
export function formatDate(dateStr, opts = { month: "short", day: "numeric", year: "numeric" }) {
  if (!dateStr) return "TBD";
  return new Date(dateStr).toLocaleDateString("en-US", opts);
}

/**
 * Calculate number of days between two date strings.
 */
export function tripDuration(start, end) {
  if (!start || !end) return null;
  const diff = new Date(end) - new Date(start);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Format a number as currency.
 * @param {number} amount
 * @param {string} currency  e.g. "USD", "EUR"
 */
export function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generate a deterministic avatar background colour from a string.
 */
export function avatarColor(name = "") {
  const hue = (name.charCodeAt(0) * 137 + name.charCodeAt(1) * 29) % 360;
  return `hsl(${hue}, 55%, 42%)`;
}

/**
 * Return initials (up to 2 chars) from a full name.
 */
export function initials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Truncate a string with ellipsis.
 */
export function truncate(str = "", maxLen = 60) {
  return str.length > maxLen ? `${str.slice(0, maxLen)}…` : str;
}

/**
 * Deep-clone a plain object (avoids reference sharing in forms).
 */
export function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounce a function call.
 */
export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Return the winning destination from a poll.
 */
export function pollWinner(poll) {
  if (!poll?.destinations?.length) return null;
  return [...poll.destinations].sort((a, b) => b.count - a.count)[0];
}

/**
 * Map an activity type string to a readable label + emoji.
 */
export const ACTIVITY_META = {
  sightseeing:  { label: "Sightseeing",  emoji: "🏛️", color: "blue" },
  food:         { label: "Food & Drink", emoji: "🍜", color: "orange" },
  adventure:    { label: "Adventure",    emoji: "⛰️", color: "red" },
  culture:      { label: "Culture",      emoji: "🎭", color: "purple" },
  relaxation:   { label: "Relaxation",   emoji: "🧘", color: "teal" },
  transport:    { label: "Transport",    emoji: "🚆", color: "slate" },
};

export function activityMeta(type) {
  return ACTIVITY_META[type] ?? { label: type, emoji: "📍", color: "slate" };
}
