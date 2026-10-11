import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/cn";
import { passwordRules } from "./schemas";

export default function PasswordRules({ value = "" }) {
  return (
    <ul className="grid gap-1 text-xs" aria-label="Password requirements">
      {passwordRules.map((rule) => {
        const passed = rule.test(value);
        return (
          <li key={rule.id} className={cn("flex items-center gap-2", passed ? "text-good" : "text-muted")}>
            {passed ? <Check className="size-3.5" aria-hidden="true" /> : <Circle className="size-3.5" aria-hidden="true" />}
            {rule.label}
            <span className="sr-only">{passed ? "(done)" : "(not yet)"}</span>
          </li>
        );
      })}
    </ul>
  );
}
