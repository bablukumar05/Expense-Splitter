import { useMemo, useState } from "react";
import { AlertCircle, PieChart } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import MoneyText from "@/components/ui/MoneyText";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { useAuth } from "@/features/auth/useAuth";
import CategoryBars from "@/features/insights/CategoryBars";
import { usePersonalStats } from "@/features/insights/hooks";
import InsightsSkeleton from "@/features/insights/InsightsSkeleton";
import { Kpi, KpiGrid } from "@/features/insights/Kpi";
import MonthlyChart from "@/features/insights/MonthlyChart";
import RangePicker from "@/features/insights/RangePicker";
import { fillMonths, useDateRange } from "@/features/insights/range";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { cn } from "@/lib/cn";

export default function PersonalInsights() {
  useDocumentTitle("Insights");
  const { user } = useAuth();
  const { preset, setPreset, custom, setCustom, range, error: rangeError } = useDateRange("6");
  const query = usePersonalStats(range);
  const stats = query.data;

  const currencies = useMemo(() => stats?.currencies ?? [], [stats?.currencies]);
  const defaultCurr = user?.defaultCurrency || "INR";
  const [selectedCurrency, setSelectedCurrency] = useState("");

  const activeCurrency = useMemo(() => {
    if (!currencies.length) return "";
    if (selectedCurrency && currencies.some((c) => c.currency === selectedCurrency)) {
      return selectedCurrency;
    }
    const match = currencies.find((c) => c.currency === defaultCurr);
    return match ? match.currency : currencies[0].currency;
  }, [currencies, selectedCurrency, defaultCurr]);

  const activeData = useMemo(
    () => currencies.find((c) => c.currency === activeCurrency),
    [currencies, activeCurrency]
  );

  const monthly = useMemo(
    () => (activeData && range ? fillMonths(activeData.monthly, range.from, range.to) : []),
    [activeData, range]
  );

  const isEmpty = !currencies.length || (activeData && activeData.totalShare === 0 && activeData.expenseCount === 0);

  const renderContent = () => {
    if (!range) {
      return (
        <p className="rounded-xl border border-line bg-white/[0.04] px-4 py-3 text-sm text-muted">
          Pick a start and end date to see your spending.
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
          icon={PieChart}
          title="No expenses in this period"
          description="You don't have any shared expenses in this date range."
        />
      );
    }

    return (
      <div className={cn("space-y-4 transition-opacity", query.isPlaceholderData && "opacity-60")}>
        {currencies.length > 1 && (
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-medium uppercase tracking-wider text-muted">Currency</span>
            <SegmentedControl
              value={activeCurrency}
              onChange={setSelectedCurrency}
              options={currencies.map((c) => ({
                value: c.currency,
                label: c.currency,
              }))}
            />
          </div>
        )}

        <KpiGrid>
          <Kpi label="Your share">
            <MoneyText value={activeData.totalShare} currency={activeCurrency} />
          </Kpi>
          <Kpi label="Total paid">
            <MoneyText value={activeData.totalPaid} currency={activeCurrency} />
          </Kpi>
          <Kpi label="Expenses">{activeData.expenseCount}</Kpi>
          <Kpi label="Top group" hint={activeData.topGroup?.name}>
            {activeData.topGroup ? (
              <MoneyText value={activeData.topGroup.amount} currency={activeCurrency} />
            ) : (
              "—"
            )}
          </Kpi>
        </KpiGrid>

        {monthly.length > 0 && (
          <Card className="space-y-3">
            <h2 className="font-semibold">Your share by month</h2>
            <MonthlyChart data={monthly} currency={activeCurrency} />
          </Card>
        )}

        {activeData.byCategory.length > 0 && (
          <Card className="space-y-4">
            <h2 className="font-semibold">By category</h2>
            <CategoryBars data={activeData.byCategory} currency={activeCurrency} />
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 pb-12">
      <PageHeader
        title="Insights"
        description="Your personal spending across all groups."
      />

      <Card variant="flat" className="space-y-4">
        <RangePicker
          preset={preset}
          onPresetChange={setPreset}
          custom={custom}
          onCustomChange={setCustom}
          error={rangeError}
        />
      </Card>

      {renderContent()}
    </div>
  );
}
