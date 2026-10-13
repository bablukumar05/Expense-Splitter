import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/lib/format";

function TrendTooltip({ active, payload, currency }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-xl border border-line bg-canvas-2/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      <div className="font-semibold text-ink">{item.payload.fullMonth}</div>
      <div className="mt-1 font-medium text-brand">
        {formatMoney(item.value, currency)}
      </div>
    </div>
  );
}

export default function MonthlyTrendChart({ trend = [], currency = "INR" }) {
  const chartData = useMemo(() => {
    return trend.map((item) => {
      let label = item.month;
      let fullMonth = item.month;
      try {
        const [year, month] = item.month.split("-");
        const date = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
        label = new Intl.DateTimeFormat("en-IN", {
          month: "short",
          timeZone: "UTC",
        }).format(date);
        fullMonth = new Intl.DateTimeFormat("en-IN", {
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        }).format(date);
      } catch {}
      return {
        month: item.month,
        label,
        fullMonth,
        amount: Number(item.amount) || 0,
      };
    });
  }, [trend]);

  const hasData = chartData.some((item) => item.amount > 0);

  if (!chartData.length || !hasData) {
    return (
      <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-line/60 bg-white/[0.02] p-6 text-center text-sm text-muted">
        <span>No monthly trend data available yet</span>
      </div>
    );
  }

  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            stroke="#94A3B8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#94A3B8"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              if (value >= 100000) return `${Math.round(value / 1000)}k`;
              if (value >= 1000) return `${Math.round(value / 1000)}k`;
              return value;
            }}
          />
          <Tooltip content={<TrendTooltip currency={currency} />} />
          <Bar
            dataKey="amount"
            fill="#3B82F6"
            radius={[6, 6, 0, 0]}
            isAnimationActive
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
