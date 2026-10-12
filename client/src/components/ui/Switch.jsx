import { useId } from "react";
import { cn } from "@/lib/cn";

export default function Switch({ checked, onChange, label, description, disabled = false }) {
  const labelId = useId();
  const descId = useId();

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p id={labelId} className="text-sm font-medium">
          {label}
        </p>
        {description && (
          <p id={descId} className="text-xs text-muted">
            {description}
          </p>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={description ? descId : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="inline-flex h-11 shrink-0 items-center px-1 disabled:opacity-50"
      >
        <span className={cn("relative h-7 w-12 rounded-full transition-colors", checked ? "bg-brand-gradient" : "bg-white/15")}>
          <span
            className={cn(
              "absolute left-0.5 top-0.5 size-6 rounded-full bg-white shadow transition-transform",
              checked ? "translate-x-5" : "translate-x-0"
            )}
          />
        </span>
      </button>
    </div>
  );
}
