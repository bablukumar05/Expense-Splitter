export const APP_NAME = "SplitMate";

export const GROUP_TYPES = [
  { value: "trip", label: "Trip", emoji: "✈️" },
  { value: "home", label: "Home", emoji: "🏠" },
  { value: "couple", label: "Couple", emoji: "❤️" },
  { value: "friends", label: "Friends", emoji: "🎉" },
  { value: "other", label: "Other", emoji: "💸" },
];

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

export const MAX_MEMBERS = 50;

export const CATEGORIES = [
  { value: "general", label: "General", emoji: "🧾" },
  { value: "food", label: "Food & drinks", emoji: "🍽️" },
  { value: "groceries", label: "Groceries", emoji: "🛒" },
  { value: "transport", label: "Transport", emoji: "🚕" },
  { value: "travel", label: "Travel", emoji: "✈️" },
  { value: "stay", label: "Stay", emoji: "🏨" },
  { value: "entertainment", label: "Entertainment", emoji: "🎬" },
  { value: "shopping", label: "Shopping", emoji: "🛍️" },
  { value: "bills", label: "Bills", emoji: "💡" },
  { value: "rent", label: "Rent", emoji: "🏠" },
  { value: "health", label: "Health", emoji: "💊" },
  { value: "other", label: "Other", emoji: "📦" },
];

export const categoryOf = (value) =>
  CATEGORIES.find((category) => category.value === value) ?? CATEGORIES[CATEGORIES.length - 1];

export const SPLIT_TYPES = [
  { value: "EQUAL", label: "Equally", full: "Split equally", hint: "Everyone selected pays the same share." },
  { value: "EXACT", label: "Exact", full: "Exact amounts", hint: "Enter exactly how much each person owes." },
  { value: "PERCENTAGE", label: "Percent", full: "By percentage", hint: "Split by percentage. It must add up to 100%." },
  { value: "SHARES", label: "Shares", full: "By shares", hint: "Split in proportion to shares. 2 shares pays double of 1." },
];

export const splitTypeLabel = (value) =>
  SPLIT_TYPES.find((type) => type.value === value)?.full ?? value;
