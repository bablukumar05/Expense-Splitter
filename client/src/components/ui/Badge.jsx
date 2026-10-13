import { cn } from "@/lib/cn";

const tones = {
  neutral: "border-line bg-white/5 text-muted",
  brand: "border-brand/30 bg-brand/15 text-blue-300",

  good: "border-good/30 bg-good/15 text-good",
  bad: "border-bad/30 bg-bad/15 text-bad",
  warn: "border-warn/30 bg-warn/15 text-warn",
};

export default function Badge({ tone = "neutral", className, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
