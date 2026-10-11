import { useId } from "react";
import { cn } from "@/lib/cn";

export default function SegmentedControl({ options, value, onChange, label, name, className }) {
  const autoName = useId();
  const groupName = name ?? autoName;

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("flex w-full gap-1 overflow-x-auto rounded-xl border border-line bg-white/5 p-1", className)}
    >
      {options.map((option) => (
        <label key={option.value} className="min-w-fit flex-1">
          <input
            type="radio"
            name={groupName}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="peer sr-only"
          />
          <span
            className={
              "flex h-11 cursor-pointer items-center justify-center whitespace-nowrap rounded-lg px-3 text-sm font-medium " +
              "text-muted transition hover:text-ink peer-checked:bg-brand-gradient peer-checked:text-white " +
              "peer-checked:shadow-glow peer-focus-visible:ring-2 peer-focus-visible:ring-brand-2 sm:h-9"
            }
          >
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}
