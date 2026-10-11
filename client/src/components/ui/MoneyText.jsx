import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";

export default function MoneyText({ value, currency = "INR", signed = false, className }) {
  const tone = value > 0 ? "text-good" : value < 0 ? "text-bad" : "text-muted";
  const sign = signed ? (value > 0 ? "+" : value < 0 ? "−" : "") : "";

  return (
    <span className={cn("font-semibold tabular-nums", signed && tone, className)}>
      {sign} {formatMoney(Math.abs(value), currency)}
    </span>
  );
}
