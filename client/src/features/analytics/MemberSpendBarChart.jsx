import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/lib/format";

function MemberTooltip({ active, payload, currency }) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="rounded-xl border border-line bg-canvas-2/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      <div className="font-semibold text-ink">{item.name}</div>
      <div className="mt-1 space-y-0.5">
        <div className="text-emerald-400">
          Paid: {formatMoney(item.paid, currency)}
        </div>
        <div className="text-amber-400">
          Share: {formatMoney(item.share, currency)}
        </div>
        <div className="text-muted">
          Net:{" "}
          <span className={item.net >= 0 ? "text-emerald-400" : "text-rose-400"}>
            {formatMoney(item.net, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function MemberSpendBarChart({ members = [], currency = "INR" }) {
  if (!members.length) {
    return (
      <div className="flex h-44 flex-col items-center justify-center rounded-2xl border border-line/60 bg-white/[0.02] p-6 text-center text-sm text-muted">
        <span>No member breakdown data</span>
      </div>
    );
  }

  const chartData = members.map((m) => ({
    name: m.name,
    paid: Number(m.paid) || 0,
    share: Number(m.share) || 0,
    net: Number(m.net) || 0,
  }));

  const height = Math.min(320, Math.max(160, chartData.length * 44));

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
            horizontal={false}
          />
          <XAxis
            type="number"
            stroke="#94A3B8"
            fontSize={10}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            dataKey="name"
            type="category"
            stroke="#94A3B8"
            fontSize={11}
            axisLine={false}
            tickLine={false}
            width={85}
          />
          <Tooltip content={<MemberTooltip currency={currency} />} />
          <Legend
            verticalAlign="top"
            height={28}
            formatter={(value) => (
              <span className="text-xs text-muted">{value}</span>
            )}
          />
          <Bar
            dataKey="paid"
            name="Paid"
            fill="#10B981"
            radius={[0, 4, 4, 0]}
            isAnimationActive
          />
          <Bar
            dataKey="share"
            name="Owed Share"
            fill="#F59E0B"
            radius={[0, 4, 4, 0]}
            isAnimationActive
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
