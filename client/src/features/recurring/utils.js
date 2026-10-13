import { dateInputValue } from "@/lib/format";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const ordinal = (n) => {
  const suffix = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${suffix[(v - 20) % 10] || suffix[v] || suffix[0]}`;
};

export function describeSchedule(frequencyOrTemplate, maybeStartDate) {
  let frequency;
  let startDate;

  if (frequencyOrTemplate && typeof frequencyOrTemplate === "object") {
    frequency = frequencyOrTemplate.frequency;
    startDate = frequencyOrTemplate.startDate || frequencyOrTemplate.startsAt;
  } else {
    frequency = frequencyOrTemplate;
    startDate = maybeStartDate;
  }

  if (!startDate) return frequency === "weekly" ? "Every week" : "Every month";
  const date = new Date(startDate);
  if (Number.isNaN(date.getTime())) return frequency === "weekly" ? "Every week" : "Every month";
  if (frequency === "weekly") return `Every ${WEEKDAYS[date.getUTCDay()]}`;
  const day = date.getUTCDate();
  return day > 28
    ? `Monthly on the ${ordinal(day)} (last day in shorter months)`
    : `Monthly on the ${ordinal(day)}`;
}

export function recurringStatus(template) {
  if (!template) return "active";
  if (!template.isActive) return template.nextRunAt ? "paused" : "ended";
  if (template.failureCount > 0 || template.lastError) return "attention";
  return "active";
}

export const STATUS_UI = {
  active: { label: "Active", tone: "good", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  attention: { label: "Needs attention", tone: "warn", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  paused: { label: "Paused", tone: "warn", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  ended: { label: "Ended", tone: "neutral", className: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
};

export function splitStateFromTemplate(template) {
  const included = {};
  const values = {};
  for (const split of template?.splits || []) {
    const id = String(split.member?._id ?? split.member);
    included[id] = true;
    values[id] = {
      amount: split.amount != null ? String(Math.round(Number(split.amount) * 100) / 100) : "",
      percentage: split.percentage != null ? String(split.percentage) : "",
      shares: split.shares != null ? String(split.shares) : "1",
    };
  }
  return { type: template?.splitType || "EQUAL", included, values };
}

export const initialEnd = (template) => {
  if (template?.endDate) return { mode: "date", date: dateInputValue(template.endDate), count: "" };
  if (template?.maxOccurrences) return { mode: "count", date: "", count: String(template.maxOccurrences) };
  return { mode: "never", date: "", count: "" };
};

export function payerStateFromTemplate(template) {
  const paidBy = template?.paidBy || [];
  if (paidBy.length <= 1) {
    const single = paidBy[0] ? String(paidBy[0].member?._id ?? paidBy[0].member) : "";
    return { mode: "single", single, amounts: {} };
  }
  return {
    mode: "multi",
    single: String(paidBy[0].member?._id ?? paidBy[0].member),
    amounts: Object.fromEntries(
      paidBy.map((p) => [String(p.member?._id ?? p.member), String(p.amount)])
    ),
  };
}
