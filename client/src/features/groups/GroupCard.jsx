import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "@/components/ui/Card";
import MoneyText from "@/components/ui/MoneyText";
import Skeleton from "@/components/ui/Skeleton";
import { typeLabel } from "@/lib/constants";

function BalanceChip({ balance, currency, loading }) {
  if (loading) return <Skeleton className="h-9 w-16" />;
  if (balance === undefined || balance === null) return null;

  if (balance === 0) {
    return <span className="shrink-0 text-xs font-medium text-muted">Settled up</span>;
  }

  const owed = balance > 0;
  return (
    <div className="shrink-0 text-right">
      <p className="text-[11px] uppercase tracking-wide text-muted">{owed ? "you get" : "you owe"}</p>
      <MoneyText
        value={Math.abs(balance)}
        currency={currency}
        className={owed ? "text-good" : "text-bad"}
      />
    </div>
  );
}

export default function GroupCard({ group, balance, balanceLoading }) {
  const members = group.memberCount ?? 1;

  return (
    <Card
      as={Link}
      to={`/groups/${group._id}`}
      variant="flat"
      interactive
      padded={false}
      className="flex items-center gap-3 p-3.5 sm:p-4"
    >
      <span
        aria-hidden="true"
        className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-2xl"
      >
        {group.emoji || "💸"}
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold">{group.name}</h3>
        <p className="truncate text-xs text-muted">
          {members} {members === 1 ? "member" : "members"} · {typeLabel(group.type)}
        </p>
      </div>

      <BalanceChip balance={balance} currency={group.currency} loading={balanceLoading} />
      <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden="true" />
    </Card>
  );
}

export function GroupListSkeleton({ count = 4 }) {
  return (
    <div role="status" aria-label="Loading groups" className="grid gap-3 md:grid-cols-2">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-2xl border border-line bg-white/[0.04] p-3.5 sm:p-4"
        >
          <Skeleton className="size-12 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}
