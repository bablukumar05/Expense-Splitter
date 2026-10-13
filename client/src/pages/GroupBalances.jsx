import { useMemo, useState } from "react";
import { AlertCircle, ArrowRightLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/api/errors";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import MoneyText from "@/components/ui/MoneyText";
import Skeleton from "@/components/ui/Skeleton";
import { useAuth } from "@/features/auth/useAuth";
import { toPaise } from "@/features/expenses/split";
import BalanceRow from "@/features/balances/BalanceRow";
import {
  useGroupBalances,
  useSettlementPlan,
  useSettlements,
  useUndoSettlement,
} from "@/features/balances/hooks";
import PlanSection from "@/features/balances/PlanSection";
import SettleModal from "@/features/balances/SettleModal";
import SettlementItem from "@/features/balances/SettlementItem";
import { canRecordPayment, settleOptions } from "@/features/balances/utils";
import { useGroupContext } from "@/features/groups/useGroupContext";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";

function MySummary({ query, currency }) {
  if (query.isPending) {
    return (
      <Card role="status" aria-label="Loading your balance" className="space-y-3">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-9 w-40" />
      </Card>
    );
  }

  if (query.isError && !query.data) {
    return (
      <Card variant="flat" className="flex items-center gap-3">
        <AlertCircle className="size-5 shrink-0 text-warn" aria-hidden="true" />
        <p className="flex-1 text-sm text-muted">Couldn't load balances.</p>
        <Button size="sm" variant="secondary" onClick={() => query.refetch()}>
          Retry
        </Button>
      </Card>
    );
  }

  const balance = query.data.you.balance;
  const paise = toPaise(balance);
  const tone = paise > 0 ? "text-good" : paise < 0 ? "text-bad" : "text-ink";

  return (
    <Card className="relative overflow-hidden">
      <div className="hero-glow pointer-events-none absolute -right-12 -top-12 size-44" aria-hidden="true" />
      <div className="relative">
        <p className="text-sm text-muted">In this group</p>
        {paise === 0 ? (
          <p className="mt-1 text-2xl font-bold">🎉 You're settled up</p>
        ) : (
          <>
            <p className={cn("mt-1 text-sm font-medium", tone)}>{paise > 0 ? "You are owed" : "You owe"}</p>
            <MoneyText
              value={Math.abs(balance)}
              currency={currency}
              className={cn("block text-3xl font-bold sm:text-4xl", tone)}
            />
          </>
        )}
      </div>
    </Card>
  );
}

function ListSkeleton({ rows = 3 }) {
  return (
    <div role="status" aria-label="Loading" className="space-y-2">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-14" />
      ))}
    </div>
  );
}

export default function GroupBalances() {
  const { group, me, isAdmin } = useGroupContext();
  const { user } = useAuth();
  const currency = group.currency;

  const balancesQuery = useGroupBalances(group._id);
  const planQuery = useSettlementPlan(group._id);
  const settlements = useSettlements(group._id);
  const undo = useUndoSettlement(group._id);

  const [view, setView] = useState("mine");
  const [settle, setSettle] = useState(null);
  const [undoTarget, setUndoTarget] = useState(null);
  const [undoError, setUndoError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const data = balancesQuery.data;
  const rows = useMemo(() => data?.balances ?? [], [data]);
  const hasActivity = rows.some((row) => row.paid || row.owed || row.settledPaid || row.settledReceived);

  const options = useMemo(() => settleOptions(rows, me._id, isAdmin), [rows, me._id, isAdmin]);
  const canRecord = canRecordPayment(options);

  const payments = useMemo(
    () => settlements.data?.pages.flatMap((page) => page.settlements) ?? [],
    [settlements.data]
  );
  const canUndo = (settlement) => isAdmin || settlement.createdBy === user._id;

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([balancesQuery.refetch(), planQuery.refetch(), settlements.refetch()]);
    setRefreshing(false);
  };

  const openSettle = (transaction) =>
    setSettle({
      prefill: transaction
        ? { from: transaction.from.member, to: transaction.to.member, amount: transaction.amount }
        : null,
    });

  const confirmUndo = async () => {
    setUndoError("");
    try {
      await undo.mutateAsync(undoTarget._id);
      toast.success("Payment undone");
      setUndoTarget(null);
    } catch (error) {
      setUndoError(getErrorMessage(error));
    }
  };

  const recordHint = (() => {
    if (!data || canRecord) return "";
    if (!hasActivity) return "Add an expense first. Payments can be recorded once someone owes money.";
    if (!isAdmin && toPaise(data.you.balance) === 0) {
      return "You're settled up, so there's nothing for you to record. Admins can record payments for others.";
    }
    return "Everyone is settled up. There's nothing to record.";
  })();

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Balances</h2>
        <Button
          variant="secondary"
          size="icon"
          onClick={refresh}
          disabled={refreshing}
          aria-label="Refresh balances"
          aria-busy={refreshing}
        >
          <RefreshCw className={cn("size-5", refreshing && "animate-spin")} />
        </Button>
      </div>

      <MySummary query={balancesQuery} currency={currency} />

      {data && !data.isBalanced && (
        <div role="alert" className="mt-4 rounded-xl border border-warn/30 bg-warn/10 px-4 py-3 text-sm text-warn">
          These balances don't add up correctly. Tap refresh. If this keeps happening, something is wrong with the
          group's data.
        </div>
      )}

      <Card className="mt-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">Settle up</h2>
          <Button size="sm" onClick={() => openSettle(null)} disabled={!canRecord}>
            <ArrowRightLeft className="size-4" /> Record payment
          </Button>
        </div>
        {recordHint && <p className="text-xs text-muted">{recordHint}</p>}

        <PlanSection
          query={planQuery}
          view={view}
          onViewChange={setView}
          me={me}
          isAdmin={isAdmin}
          currency={currency}
          hasActivity={hasActivity}
          groupId={group._id}
          onSettle={openSettle}
        />
      </Card>

      <section className="mt-8" aria-labelledby="all-balances-heading">
        <h2 id="all-balances-heading" className="mb-3 text-lg font-semibold">
          Everyone's balance
        </h2>

        {balancesQuery.isPending ? (
          <ListSkeleton />
        ) : balancesQuery.isError && !data ? (
          <EmptyState
            icon={AlertCircle}
            title="Couldn't load balances"
            action={<Button onClick={() => balancesQuery.refetch()}>Try again</Button>}
          />
        ) : (
          <Card as="ul" variant="flat" padded={false} aria-label="Member balances" className="divide-y divide-line">
            {rows.map((row) => (
              <BalanceRow key={row.member} row={row} isMe={String(row.member) === me._id} currency={currency} />
            ))}
          </Card>
        )}
      </section>

      <section className="mt-8" aria-labelledby="payments-heading">
        <h2 id="payments-heading" className="mb-3 text-lg font-semibold">
          Payments
        </h2>

        {settlements.isPending ? (
          <ListSkeleton rows={2} />
        ) : settlements.isError && !settlements.data ? (
          <EmptyState
            icon={AlertCircle}
            title="Couldn't load payments"
            action={<Button onClick={() => settlements.refetch()}>Try again</Button>}
          />
        ) : payments.length === 0 ? (
          <p className="rounded-xl border border-line bg-white/[0.04] px-4 py-3 text-sm text-muted">
            No payments recorded yet.
          </p>
        ) : (
          <>
            <Card as="ul" variant="flat" padded={false} aria-label="Recorded payments" className="divide-y divide-line">
              {payments.map((settlement) => (
                <SettlementItem
                  key={settlement._id}
                  settlement={settlement}
                  meId={me._id}
                  currency={currency}
                  canUndo={canUndo(settlement)}
                  onUndo={(item) => {
                    setUndoError("");
                    setUndoTarget(item);
                  }}
                />
              ))}
            </Card>

            {settlements.hasNextPage && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <Button
                  variant="secondary"
                  loading={settlements.isFetchingNextPage}
                  onClick={() => settlements.fetchNextPage()}
                >
                  Load more
                </Button>
                {settlements.isFetchNextPageError && (
                  <p className="text-xs text-bad">Couldn't load more. Please try again.</p>
                )}
              </div>
            )}
          </>
        )}
      </section>

      <SettleModal
        open={Boolean(settle)}
        onClose={() => setSettle(null)}
        group={group}
        me={me}
        isAdmin={isAdmin}
        rows={rows}
        prefill={settle?.prefill ?? null}
      />

      <ConfirmDialog
        open={Boolean(undoTarget)}
        onClose={() => setUndoTarget(null)}
        onConfirm={confirmUndo}
        title="Undo this payment?"
        message={
          undoTarget
            ? `${undoTarget.fromName}'s payment of ${formatMoney(undoTarget.amount, currency)} to ${undoTarget.toName} will be removed, and the balances go back to how they were.`
            : ""
        }
        confirmText="Undo payment"
        loading={undo.isPending}
        error={undoError}
      />
    </>
  );
}
