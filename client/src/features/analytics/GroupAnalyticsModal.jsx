import { useState } from "react";
import { AlertCircle, BarChart3, PieChart as PieIcon, Users } from "lucide-react";
import Modal from "@/components/ui/Modal";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Skeleton from "@/components/ui/Skeleton";
import { formatMoney } from "@/lib/format";
import CategoryDonutChart from "./CategoryDonutChart";
import MemberSpendBarChart from "./MemberSpendBarChart";
import MonthlyTrendChart from "./MonthlyTrendChart";
import { useGroupStats } from "./hooks";

const VIEW_OPTIONS = [
  { value: "category", label: "Categories", icon: PieIcon },
  { value: "monthly", label: "Trends", icon: BarChart3 },
  { value: "members", label: "Members", icon: Users },
];

export default function GroupAnalyticsModal({ open, onClose, group }) {
  const [view, setView] = useState("category");
  const { data, isPending, error, refetch } = useGroupStats(group?._id, {}, { enabled: Boolean(open && group?._id) });

  const stats = data?.stats;
  const currency = group?.currency || "INR";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${group?.name || "Group"} Analytics`}
      className="sm:max-w-2xl"
    >
      {isPending ? (
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-60 rounded-2xl" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="size-10 text-rose-400" />
          <p className="mt-2 text-sm text-ink font-medium">Failed to load analytics</p>
          <p className="text-xs text-muted mt-1">Please try again in a few moments.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-xl border border-line bg-white/5 px-4 py-2 text-xs font-medium text-ink hover:bg-white/10"
          >
            Retry
          </button>
        </div>
      ) : stats ? (
        <div className="space-y-6 pt-1">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div className="rounded-2xl border border-line/60 bg-white/[0.03] p-3">
              <span className="text-[11px] font-medium text-muted">Total Spent</span>
              <div className="mt-1 text-base font-bold text-ink truncate">
                {formatMoney(stats.totalSpend || 0, currency)}
              </div>
            </div>

            <div className="rounded-2xl border border-line/60 bg-white/[0.03] p-3">
              <span className="text-[11px] font-medium text-muted">Average / Expense</span>
              <div className="mt-1 text-base font-bold text-ink truncate">
                {formatMoney(stats.averageExpense || 0, currency)}
              </div>
            </div>

            <div className="rounded-2xl border border-line/60 bg-white/[0.03] p-3">
              <span className="text-[11px] font-medium text-muted">Total Expenses</span>
              <div className="mt-1 text-base font-bold text-ink">
                {stats.expenseCount || 0}
              </div>
            </div>

            <div className="rounded-2xl border border-line/60 bg-white/[0.03] p-3">
              <span className="text-[11px] font-medium text-muted">Top Spender</span>
              <div className="mt-1 text-base font-bold text-ink truncate">
                {stats.topSpender?.name || "None"}
              </div>
            </div>
          </div>

          {stats.largestExpense && (
            <div className="flex items-center justify-between rounded-2xl border border-line/50 bg-white/[0.02] px-4 py-3 text-xs">
              <div>
                <span className="text-muted">Largest Single Expense</span>
                <p className="font-semibold text-ink">{stats.largestExpense.description}</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-brand">
                  {formatMoney(stats.largestExpense.amount, currency)}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <SegmentedControl
              options={VIEW_OPTIONS}
              value={view}
              onChange={setView}
            />

            <div className="rounded-2xl border border-line/60 bg-white/[0.02] p-4">
              {view === "category" && (
                <CategoryDonutChart
                  breakdown={stats.categoryBreakdown || []}
                  currency={currency}
                />
              )}

              {view === "monthly" && (
                <MonthlyTrendChart
                  trend={stats.monthlyTrend || []}
                  currency={currency}
                />
              )}

              {view === "members" && (
                <MemberSpendBarChart
                  members={stats.memberBreakdown || []}
                  currency={currency}
                />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
