import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { compactMoney, formatMoney } from "@/lib/format";
import ChartTooltip from "./ChartTooltip";

const TICK = { fill: "#8f98ba", fontSize: 12 };
const MAX_ROWS = 8;
const PAID = "#34d399";
const SHARE = "#7c5cff";

const short = (name) => (name.length > 12 ? `${name.slice(0, 11)}…` : name);

export default function MemberChart({ members, currency }) {
  const rows = [...members]
    .sort((a, b) => b.paid + b.share - (a.paid + a.share))
    .slice(0, MAX_ROWS)
    .map((member) => ({ ...member, shortName: short(member.name) }));

  const summary = rows
    .map((row) => `${row.name}: paid ${formatMoney(row.paid, currency)}, share ${formatMoney(row.share, currency)}`)
    .join(". ");

  return (
    <div>
      <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted" aria-label="Legend">
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: PAID }} />
          Paid
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: SHARE }} />
          Their share
        </li>
      </ul>

      <div
        role="img"
        aria-label={`Paid versus share per member. ${summary}`}
        className="w-full"
        style={{ height: Math.max(180, rows.length * 56 + 40) }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
            barGap={4}
            barCategoryGap="28%"
          >
            <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.08)" />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={TICK}
              tickFormatter={(value) => compactMoney(value, currency)}
            />
            <YAxis
              type="category"
              dataKey="shortName"
              tickLine={false}
              axisLine={false}
              width={84}
              tick={TICK}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.06)" }}
              content={<ChartTooltip currency={currency} />}
            />
            <Bar dataKey="paid" name="Paid" fill={PAID} radius={[0, 6, 6, 0]} maxBarSize={14} />
            <Bar dataKey="share" name="Share" fill={SHARE} radius={[0, 6, 6, 0]} maxBarSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {members.length > MAX_ROWS && (
        <p className="mt-2 text-xs text-muted">
          Showing the {MAX_ROWS} biggest members. The full list is below.
        </p>
      )}
    </div>
  );
}
