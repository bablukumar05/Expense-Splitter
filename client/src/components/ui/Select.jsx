import { forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { fieldBase, Message } from "./Input";

const Select = forwardRef(function Select(
  { label, error, hint, className, id, children, ...props },
  ref
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const messageId = `${selectId}-msg`;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-ink/90">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          className={cn(
            fieldBase,
            "h-11 appearance-none pr-10 [&>option]:bg-canvas-2",
            error ? "border-bad/60" : "border-line",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
      </div>
      <Message id={messageId} error={error} hint={hint} />
    </div>
  );
});

export default Select;
