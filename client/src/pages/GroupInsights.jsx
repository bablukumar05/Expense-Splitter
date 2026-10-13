import { useMemo, useState } from "react";
import { AlertCircle, Receipt } from "lucide-react";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import MoneyText from "@/components/ui/MoneyText";
import Select from "@/components/ui/Select";
import { buildMemberLookup } from "@/features/expenses/members";
import { useGroupContext } from "@/features/groups/useGroupContext";
import CategoryBars from "@/features/insights/CategoryBars";
import ExportCard from "@/features/insights/ExportCard";
import { useGroupStats } from "@/features/insights/hooks";
import InsightsSkeleton from "@/features/insights/InsightsSkeleton";
import { Kpi, KpiGrid } from "@/features/insights/Kpi";
import MemberChart from "@/features/insights/MemberChart";
import MonthlyChart from "@/features/insights/MonthlyChart";
import RangePicker from "@/features/insights/RangePicker";
import { fillMonths, useDateRange } from "@/features/insights/range";
import { cn } from "@/lib/cn";
import { CATEGORIES } from "@/lib/constants";

export default function GroupInsights() {
  const { group } = useGroupContext();
  const lookup = useMemo(() => buildMemberLookup(group), [group]);
  const { preset, setPreset, custom, setCustom, range, error: rangeError } = useDateRange("6");
  const [category, setCategory] = useState("");
  const query = useGroupStats(group._id, range, category);
  const stats = query.data;
  const currency = group.currency;

  const monthly = useMemo(
    () => (stats && range ? fillMonths(stats.monthly, range.from, range.to) : []),
    [stats, range]
  );

  const members = useMemo(
    () =>
      (stats?.byMember ?? [])
        .map((row) => ({ ...row, name: row.name || lookup.name(row.member) }))
        .sort((a, b) => b.paid - a.paid),
    [stats, lookup]
  );

  const isEmpty = stats && stats.totalSpend === 0 && stats.expenseCount === 0;
  const topName = stats?.topSpender ? stats.topSpender.name || lookup.name(stats.topSpender.member) : "";

  const renderBody = () => {
    if (!range) {
      return (
        <p className="rounded-xl border border-line bg-white/[0.04] px-4 py-3 text-sm text-muted">
          Pick a start and end date to see insights.
        </p>
      );
    }

    if (query.isPending) return <InsightsSkeleton />;

    if (query.isError && !stats) {
      return (
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load insights"
          description="Check your connection and try again."
          action={<Button onClick={() => query.refetch()}>Try again</Button>}
        />
      );
    }

    if (isEmpty) {
      return (
        <EmptyState
          icon={Receipt}
          title="No expenses in this period"
          description="Try a longer date range or another category."
          action={
            <ButtonLink to={`/groups/${group._id}/expenses/new`} variant="secondary">
              Add expense
            </ButtonLink>
          }
        />
      );
    }

    return (
      <div className={cn("space-y-4 transition-opacity", query.isPlaceholderData && "opacity-60")}>
        <KpiGrid>
          <Kpi label="Total spent">
            <MoneyText value={stats.totalSpend} currency={currency} />
          </Kpi>
          <Kpi label="Expenses">{stats.expenseCount}</Kpi>
          <Kpi label="Average per expense">
            <MoneyText value={stats.averagePerExpense} currency={currency} />
          </Kpi>
          <Kpi label="Biggest expense" hint={stats.biggestExpense?.description}>
            {stats.biggestExpense ? <MoneyText value={stats.biggestExpense.amount} currency={currency} /> : "—"}
          </Kpi>
        </KpiGrid>

        {monthly.length > 0 && (
          <Card className="space-y-3">
            <h2 className="font-semibold">Spending by month</h2>
            <MonthlyChart data={monthly} currency={currency} />
          </Card>
        )}

        {stats.byCategory.length > 0 && (
          <Card className="space-y-4">
            <h2 className="font-semibold">By category</h2>
            <CategoryBars data={stats.byCategory} currency={currency} />
          </Card>
        )}

        {members.length > 0 && (
          <Card className="space-y-4">
            <div>
              <h2 className="font-semibold">By member</h2>
              {stats.topSpender && stats.topSpender.paid > 0 && (
                <p className="text-xs text-muted">
                  Top payer: <span className="text-ink">{topName}</span> (
                  <MoneyText value={stats.topSpender.paid} currency={currency} className="text-xs" />)
                </p>
              )}
            </div>

            <MemberChart members={members} currency={currency} />

            <ul className="divide-y divide-line">
              {members.map((row) => (
                <li key={row.member} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{row.name}</p>
                    <p className="truncate text-xs text-muted">
                      Paid <MoneyText value={row.paid} currency={currency} className="text-xs" /> · Share{" "}
                      <MoneyText value={row.share} currency={currency} className="text-xs" />
                    </p>
                  </div>
                  <MoneyText value={row.net} currency={currency} signed className="text-sm" />
                </li>
              ))}
            </ul>

            <p className="text-xs text-muted">
              Net = paid minus share for this period. Green means the group owes them, red means they owe the group.
              Payments between members aren't counted here.
            </p>
          </Card>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Insights</h2>
      </div>

      <Card variant="flat" className="mb-4 space-y-4">
        <RangePicker
          preset={preset}
          onPresetChange={setPreset}
          custom={custom}
          onCustomChange={setCustom}
          error={rangeError}
        />

        <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.emoji} {c.label}
            </option>
          ))}
        </Select>
      </Card>

      {renderBody()}

      <div className="mt-4">
        <ExportCard
          group={group}
          range={range}
          category={category}
          disabled={!range || !stats || Boolean(isEmpty)}
        />
      </div>
    </>
  );
}
