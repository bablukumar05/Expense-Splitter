import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import MoneyText from "@/components/ui/MoneyText";
import Skeleton from "@/components/ui/Skeleton";
import { typeLabel } from "@/lib/constants";

function BalanceChip({ balance, currency, loading }) {
  if (loading) return <Skeleton className="h-9 w-16" />;
  if (balance === undefined || balance === null) return null;

  if (balance === 0) {
    return <span className="shrink-0 text-xs font-medium text-slate-400">Settled up</span>;
  }

  const owed = balance > 0;
  return (
    <div className="shrink-0 text-right">
      <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
        {owed ? "YOU GET" : "YOU OWE"}
      </p>
      <MoneyText
        value={Math.abs(balance)}
        currency={currency}
        className={
          owed
            ? "text-base font-bold text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]"
            : "text-base font-bold text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]"
        }
      />
    </div>
  );
}

export default function GroupCard({ group, balance, balanceLoading }) {
  const members = group.memberCount ?? 1;

  return (
    <Link
      to={`/groups/${group._id}`}
      className="group flex items-center gap-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:bg-white/[0.07] hover:shadow-[0_8px_25px_rgba(16,185,129,0.12)]"
    >
      <span
        aria-hidden="true"
        className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-2xl shadow-inner backdrop-blur-md"
      >
        {group.emoji || "💸"}
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-semibold text-white transition-colors group-hover:text-emerald-300">
          {group.name}
        </h3>
        <p className="mt-0.5 truncate text-xs text-slate-400">
          {members} {members === 1 ? "member" : "members"} · {typeLabel(group.type)}
        </p>
      </div>

      <BalanceChip balance={balance} currency={group.currency} loading={balanceLoading} />
      <ChevronRight
        className="size-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-white"
        aria-hidden="true"
      />
    </Link>
  );
}

export function GroupListSkeleton({ count = 4 }) {
  return (
    <div role="status" aria-label="Loading groups" className="grid gap-3.5 md:grid-cols-2">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-xl"
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
