import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { categoryOf } from "@/lib/constants";
import { formatMoney } from "@/lib/format";

const PALETTE = [
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#EC4899",
  "#8B5CF6",
  "#06B6D4",
  "#F97316",
  "#14B8A6",
  "#6366F1",
  "#EF4444",
  "#84CC16",
  "#64748B",
];

function ChartTooltip({ active, payload, currency }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const { name, value, count, percent } = item.payload;
  return (
    <div className="rounded-xl border border-line bg-canvas-2/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      <div className="flex items-center gap-1.5 font-semibold text-ink">
        <span>{item.payload.emoji}</span>
        <span>{name}</span>
      </div>
      <div className="mt-1 flex items-center gap-2 text-muted">
        <span>{formatMoney(value, currency)}</span>
        <span>·</span>
        <span>{percent}%</span>
        {count ? <span>({count} {count === 1 ? "expense" : "expenses"})</span> : null}
      </div>
    </div>
  );
}

export default function CategoryDonutChart({ breakdown = [], currency = "INR" }) {
  const total = useMemo(
    () => breakdown.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [breakdown]
  );

  const data = useMemo(() => {
    return breakdown.map((item, index) => {
      const meta = categoryOf(item.category);
      const amount = Number(item.amount) || 0;
      const percent = total > 0 ? Math.round((amount / total) * 100) : 0;
      return {
        id: item.category,
        name: meta.label,
        emoji: meta.emoji,
        value: amount,
        count: item.count || 0,
        percent,
        color: PALETTE[index % PALETTE.length],
      };
    });
  }, [breakdown, total]);

  if (!breakdown.length || total === 0) {
    return (
      <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-line/60 bg-white/[0.02] p-6 text-center text-sm text-muted">
        <span>No category spending data yet</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={92}
              paddingAngle={3}
              isAnimationActive
            >
              {data.map((entry) => (
                <Cell key={entry.id} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip currency={currency} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs uppercase tracking-wider text-muted">Total</span>
          <span className="text-sm font-semibold text-ink sm:text-base">
            {formatMoney(total, currency)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {data.slice(0, 6).map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-line/50 bg-white/[0.02] p-2.5 text-xs"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="shrink-0">{item.emoji}</span>
              <span className="truncate font-medium text-ink">{item.name}</span>
            </div>
            <div className="ml-2 shrink-0 text-right">
              <div className="font-semibold text-ink">{formatMoney(item.value, currency)}</div>
              <div className="text-[10px] text-muted">{item.percent}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
