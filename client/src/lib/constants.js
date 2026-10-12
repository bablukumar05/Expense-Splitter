export const APP_NAME = "Splitly";

export const GROUP_TYPES = [
  { value: "trip", label: "Trip", emoji: "✈️" },
  { value: "home", label: "Home", emoji: "🏠" },
  { value: "couple", label: "Couple", emoji: "❤️" },
  { value: "friends", label: "Friends", emoji: "🎉" },
  { value: "other", label: "Other", emoji: "💸" },
];

// Emoji sirf presets mein se: invalid ya bahut lamba emoji server tak jaata hi nahi
export const GROUP_EMOJIS = [
  "✈️", "🏖️", "🏠", "🍕", "🎉", "❤️", "🛒", "🚗",
  "🎬", "🎓", "⚽", "🎂", "💼", "🐶", "🏕️", "💸",
];

export const CURRENCIES = [
  { code: "INR", label: "INR (₹)" },
  { code: "USD", label: "USD ($)" },
  { code: "EUR", label: "EUR (€)" },
  { code: "GBP", label: "GBP (£)" },
  { code: "AED", label: "AED (د.إ)" },
  { code: "SGD", label: "SGD (S$)" },
  { code: "CAD", label: "CAD (C$)" },
  { code: "AUD", label: "AUD (A$)" },
];

export const typeLabel = (value) =>
  GROUP_TYPES.find((type) => type.value === value)?.label ?? "Other";

export const typeEmoji = (value) =>
  GROUP_TYPES.find((type) => type.value === value)?.emoji ?? "💸";

export const MAX_MEMBERS = 50; // backend ka limit
