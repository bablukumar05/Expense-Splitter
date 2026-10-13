import { useMemo, useState } from "react";
import { todayInputValue } from "@/lib/format";

export const RANGE_PRESETS = [
  { value: "1", label: "This month" },
  { value: "3", label: "3 months" },
  { value: "6", label: "6 months" },
  { value: "12", label: "12 months" },
  { value: "custom", label: "Custom" },
];

export const MAX_RANGE_MONTHS = 24;

const pad = (n) => String(n).padStart(2, "0");
const toInput = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const monthsSpan = (from, to) => {
  const [fy, fm] = from.split("-").map(Number);
  const [ty, tm] = to.split("-").map(Number);
  return (ty - fy) * 12 + (tm - fm) + 1;
};

export const monthKeys = (from, to) => {
  const [fy, fm] = from.split("-").map(Number);
  const count = monthsSpan(from, to);
  return Array.from({ length: Math.max(count, 0) }, (_, i) => {
    const index = fm - 1 + i;
    return `${fy + Math.floor(index / 12)}-${pad((index % 12) + 1)}`;
  });
};

export function fillMonths(monthly, from, to) {
  const byMonth = new Map(monthly.map((row) => [row.month, row]));
  const keys = new Set([...monthKeys(from, to), ...byMonth.keys()]);
  return [...keys].sort().map((month) => ({
    month,
    amount: byMonth.get(month)?.amount ?? 0,
    count: byMonth.get(month)?.count ?? 0,
  }));
}

export function useDateRange(defaultPreset = "6") {
  const [preset, setPresetState] = useState(defaultPreset);
  const [custom, setCustom] = useState({ from: "", to: "" });

  const { range, error } = useMemo(() => {
    const today = todayInputValue();
    if (preset !== "custom") {
      const months = Number(preset);
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
      return { range: { from: toInput(start), to: today }, error: "" };
    }

    const { from, to } = custom;
    if (!from || !to) return { range: null, error: from || to ? "Pick both dates." : "" };
    if (from > to) return { range: null, error: "The start date is after the end date." };
    if (to > today) return { range: null, error: "The end date can't be in the future." };
    if (monthsSpan(from, to) > MAX_RANGE_MONTHS) {
      return { range: null, error: `Choose a range of up to ${MAX_RANGE_MONTHS} months.` };
    }
    return { range: { from, to }, error: "" };
  }, [preset, custom]);

  const setPreset = (next) => {
    if (next === "custom" && !custom.from && !custom.to && range) setCustom(range);
    setPresetState(next);
  };

  return { preset, setPreset, custom, setCustom, range, error };
}
