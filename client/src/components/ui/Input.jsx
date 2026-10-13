import { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

export const fieldBase =
  "w-full rounded-xl border bg-white/5 px-3.5 text-base text-ink outline-none transition " +
  "placeholder:text-muted/70 focus:border-brand focus:ring-2 focus:ring-brand/30 " +
  "disabled:opacity-50 sm:text-sm";

export function Message({ id, error, hint }) {
  if (error) return <p id={id} className="text-xs text-bad">{error}</p>;
  if (hint) return <p id={id} className="text-xs text-muted">{hint}</p>;
  return null;
}

export const Input = forwardRef(function Input(
  { label, error, hint, icon: Icon, prefix, className, id, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-msg`;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-ink/90">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
        )}
        {prefix && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          className={cn(
            fieldBase,
            "h-11",
            Icon && "pl-10",
            prefix && "pl-8",
            error ? "border-bad/60" : "border-line",
            className
          )}
          {...props}
        />
      </div>
      <Message id={messageId} error={error} hint={hint} />
    </div>
  );
});

export const Textarea = forwardRef(function Textarea(
  { label, error, hint, className, id, rows = 3, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-msg`;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-ink/90">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? messageId : undefined}
        className={cn(fieldBase, "resize-none py-2.5", error ? "border-bad/60" : "border-line", className)}
        {...props}
      />
      <Message id={messageId} error={error} hint={hint} />
    </div>
  );
});

export default Input;
