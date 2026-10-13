import { Wallet } from "lucide-react";
import Spinner from "@/components/ui/Spinner";

export default function FullPageLoader({ label = "Loading…" }) {
  return (
    <div role="status" aria-live="polite" className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-brand-gradient shadow-sm">

        <Wallet className="size-7 text-white" />
      </span>
      <div className="flex items-center gap-2 text-sm text-muted">
        <Spinner className="size-4" /> {label}
      </div>
    </div>
  );
}
