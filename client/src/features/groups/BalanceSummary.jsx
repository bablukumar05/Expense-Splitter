import { AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
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
  const tone = net > 0 ? "text-good" : net < 0 ? "text-bad" : "text-ink";

  return (
    <Card className="relative overflow-hidden">
      <div className="hero-glow pointer-events-none absolute -right-12 -top-12 size-44" aria-hidden="true" />
      <div className="relative">
        <p className="text-sm text-muted">Overall balance{showCurrency && ` · ${currency}`}</p>

        {settled ? (
          <p className="mt-1 text-2xl font-bold sm:text-3xl">🎉 {headline}</p>
        ) : (
          <>
            <p className={cn("mt-1 text-sm font-medium", tone)}>{headline}</p>
            <MoneyText
              value={Math.abs(net)}
              currency={currency}
              className={cn("block text-3xl font-bold sm:text-4xl", tone)}
            />
          </>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-xs text-muted">You are owed</p>
            <MoneyText value={youAreOwed} currency={currency} className="text-lg text-good" />
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-xs text-muted">You owe</p>
            <MoneyText value={youOwe} currency={currency} className="text-lg text-bad" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function BalanceSummary({ summary, loading, error, onRetry }) {
  if (loading) {
    return (
      <Card role="status" aria-label="Loading your balance" className="space-y-3">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-9 w-44" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="flat" className="flex items-center gap-3">
        <AlertCircle className="size-5 shrink-0 text-warn" aria-hidden="true" />
        <p className="flex-1 text-sm text-muted">Couldn't load your balance.</p>
        <Button size="sm" variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      </Card>
    );
  }

  const entries = Object.entries(summary ?? {});
  if (entries.length === 0) return null; // koi group nahi, to summary ka matlab nahi

  return (
    <div className={cn("grid gap-4", entries.length > 1 && "md:grid-cols-2")}>
      {entries.map(([currency, data]) => (
        <CurrencyBlock key={currency} currency={currency} data={data} showCurrency={entries.length > 1} />
      ))}
    </div>
  );
}
