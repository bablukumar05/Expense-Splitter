import { AlertCircle, Plus } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import EmptyState from "@/components/ui/EmptyState";
import MoneyText from "@/components/ui/MoneyText";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Skeleton from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";

function PlanRow({ transaction, meId, currency, canSettle, onSettle }) {
  const youPay = transaction.from.member === meId;
  const youGet = transaction.to.member === meId;

  const text = youPay
    ? `You pay ${transaction.to.name}`
    : youGet
      ? `${transaction.from.name} pays you`
      : `${transaction.from.name} pays ${transaction.to.name}`;

  const avatarName = youPay ? transaction.to.name : transaction.from.name;

  return (
    <li className="flex items-center gap-3 px-3.5 py-3">
      <Avatar name={avatarName} size="sm" />
      <p className="min-w-0 flex-1 truncate text-sm font-medium">{text}</p>
      <MoneyText
        value={transaction.amount}
        currency={currency}
        className={cn("text-sm", youPay && "text-bad", youGet && "text-good")}
      />
      {canSettle && (
        <Button size="sm" variant="secondary" onClick={() => onSettle(transaction)}>
          Settle
        </Button>
      )}
    </li>
  );
}

export default function PlanSection({ query, view, onViewChange, me, isAdmin, currency, hasActivity, groupId, onSettle }) {
  if (query.isPending) {
    return (
      <div role="status" aria-label="Loading settle-up plan" className="space-y-2">
        <Skeleton className="h-11" />
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
      </div>
    );
  }

  if (query.isError && !query.data) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Couldn't load the settle-up plan"
        description="Check your connection and try again."
        action={<Button onClick={() => query.refetch()}>Try again</Button>}
      />
    );
  }

  const transactions = query.data.transactions;

  if (transactions.length === 0) {
    return hasActivity ? (
      <EmptyState
        icon={null}
        title="🎉 Everyone is settled up"
        description="No payments are needed right now."
      />
    ) : (
      <EmptyState
        icon={null}
        title="Nothing to settle yet"
        description="Add an expense and the group's balances will show up here."
        action={
          <ButtonLink to={`/groups/${groupId}/expenses/new`}>
            <Plus className="size-4" /> Add expense
          </ButtonLink>
        }
      />
    );
  }

  const mine = transactions.filter((t) => t.from.member === me._id || t.to.member === me._id);
  const shown = view === "mine" ? mine : transactions;
  const canSettle = (t) => isAdmin || t.from.member === me._id || t.to.member === me._id;

  return (
    <div className="space-y-3">
      <SegmentedControl
        label="Show payments"
        value={view}
        onChange={onViewChange}
        options={[
          { value: "mine", label: `My payments${mine.length ? ` (${mine.length})` : ""}` },
          { value: "all", label: `Everyone (${transactions.length})` },
        ]}
      />

      {shown.length === 0 ? (
        <p className="rounded-xl border border-line bg-white/[0.04] px-4 py-3 text-sm text-muted">
          You have nothing to pay or receive. Switch to "Everyone" to see the rest of the group.
        </p>
      ) : (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-white/[0.04]">
          {shown.map((t) => (
            <PlanRow
              key={`${t.from.member}-${t.to.member}`}
              transaction={t}
              meId={me._id}
              currency={currency}
              canSettle={canSettle(t)}
              onSettle={onSettle}
            />
          ))}
        </ul>
      )}

      <p className="text-xs text-muted">
        These payments are simplified so the whole group settles with as few transfers as possible.
      </p>
    </div>
  );
}
