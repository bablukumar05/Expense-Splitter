import { AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import MoneyText from "@/components/ui/MoneyText";
import Skeleton from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";

function CurrencyBlock({ currency, data, showCurrency }) {
  const { net, youAreOwed, youOwe } = data;
  const settled = youAreOwed === 0 && youOwe === 0;

  const headline = settled
    ? "All settled up"
    : net > 0
      ? "You are owed"
      : net < 0
        ? "You owe"
        : "You're even overall";

  const toneClass = net > 0 ? "text-emerald-400" : net < 0 ? "text-rose-400" : "text-slate-100";
  const glowShadow =
    net > 0
      ? "drop-shadow-[0_0_16px_rgba(16,185,129,0.35)]"
      : net < 0
        ? "drop-shadow-[0_0_16px_rgba(244,63,94,0.35)]"
        : "";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] sm:p-7">
      <div
        className="pointer-events-none absolute -right-16 -top-16 size-60 rounded-full bg-emerald-500/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 size-52 rounded-full bg-cyan-400/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10">
        <p className="text-sm font-medium text-slate-400">
          Overall balance{showCurrency && ` · ${currency}`}
        </p>

        {settled ? (
          <p className="mt-1 text-2xl font-bold text-white sm:text-3xl">🎉 {headline}</p>
        ) : (
          <>
            <p className={cn("mt-1 text-sm font-semibold tracking-wide", toneClass)}>{headline}</p>
            <MoneyText
              value={Math.abs(net)}
              currency={currency}
              className={cn("mt-0.5 block text-4xl font-extrabold sm:text-5xl", toneClass, glowShadow)}
            />
          </>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3.5">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-xl">
            <p className="text-xs font-medium text-slate-400">You are owed</p>
            <MoneyText
              value={youAreOwed}
              currency={currency}
              className={cn(
                "mt-1 block text-2xl font-bold",
                youAreOwed > 0
                  ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.25)]"
                  : "text-slate-100"
              )}
            />
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-xl">
            <p className="text-xs font-medium text-slate-400">You owe</p>
            <MoneyText
              value={youOwe}
              currency={currency}
              className={cn(
                "mt-1 block text-2xl font-bold",
                youOwe > 0
                  ? "text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.25)]"
                  : "text-slate-100"
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BalanceSummary({ summary, loading, error, onRetry }) {
  if (loading) {
    return (
      <div
        role="status"
        aria-label="Loading your balance"
        className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl sm:p-7"
      >
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-2 gap-3.5">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
        <AlertCircle className="size-5 shrink-0 text-amber-400" aria-hidden="true" />
        <p className="flex-1 text-sm text-slate-300">Couldn't load your balance.</p>
        <Button size="sm" variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  const entries = Object.entries(summary ?? {});
  if (entries.length === 0) return null;

  return (
    <div className={cn("grid gap-4", entries.length > 1 && "md:grid-cols-2")}>
      {entries.map(([currency, data]) => (
        <CurrencyBlock
          key={currency}
          currency={currency}
          data={data}
          showCurrency={entries.length > 1}
        />
      ))}
    </div>
  );
}
