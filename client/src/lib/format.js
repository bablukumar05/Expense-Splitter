
export const formatMoney = (amount, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${Number(amount).toFixed(2)}`;
  }
};

export const formatDate = (value, options = {}) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(new Date(value));

export const timeAgo = (value) => {
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return rtf.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours < 24) return rtf.format(-hours, "hour");
  const days = Math.round(hours / 24);
  if (days < 7) return rtf.format(-days, "day");
  return formatDate(value);
};

export const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("") || "?";

export const parseMoney = (value) => {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : NaN;
};

export const timeUntil = (value) => {
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  if (seconds <= 0) return "expired";

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "always" });
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return rtf.format(Math.max(minutes, 1), "minute");
  const hours = Math.round(minutes / 60);
  if (hours < 24) return rtf.format(hours, "hour");
  return rtf.format(Math.round(hours / 24), "day");
};

export const formatDay = (value, options = {}) =>
  formatDate(value, { timeZone: "UTC", ...options });

export const formatMonth = (value) =>
  new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(value)
  );

export const todayInputValue = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const dateInputValue = (value) => new Date(value).toISOString().slice(0, 10);

export const currencySymbol = (code = "INR") => {
  try {
    return (
      new Intl.NumberFormat("en", {
        style: "currency",
        currency: code,
        currencyDisplay: "narrowSymbol",
      })
        .formatToParts(0)
        .find((part) => part.type === "currency")?.value ?? code
    );
  } catch {
    return code;
  }
};

export const formatTime = (value) =>
  new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(new Date(value));

const isSameLocalDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const dayHeading = (value) => {
  const date = new Date(value);
  const now = new Date();
  if (isSameLocalDay(date, now)) return "Today";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameLocalDay(date, yesterday)) return "Yesterday";

  return formatDate(value);
};

export const localDayKey = (value) => {
  const d = new Date(value);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

export const compactMoney = (amount, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  } catch {
    return String(Math.round(amount));
  }
};

export const monthLabel = (key, options = { month: "short", year: "2-digit" }) => {
  const [year, month] = String(key).split("-").map(Number);
  if (!year || !month) return String(key);
  return new Intl.DateTimeFormat("en-IN", { ...options, timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, 1))
  );
};
