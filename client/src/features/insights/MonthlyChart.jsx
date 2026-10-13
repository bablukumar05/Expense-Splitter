import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { compactMoney, formatMoney, monthLabel } from "@/lib/format";
import ChartTooltip from "./ChartTooltip";

const TICK = { fill: "#8f98ba", fontSize: 12 };

export default function MonthlyChart({ data, currency, valueLabel = "Spent" }) {
  const rows = data.map((row) => ({
    ...row,
    label: monthLabel(row.month),
    fullLabel: monthLabel(row.month, { month: "long", year: "numeric" }),
  }));

  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  const best = rows.reduce((top, row) => (row.amount > top.amount ? row : top), rows[0]);
  const hasCounts = rows.some((row) => row.count > 0);
  const summary = `${valueLabel} by month. Total ${formatMoney(total, currency)}. Highest month: ${best.fullLabel}, ${formatMoney(best.amount, currency)}.`;

  return (
    <div>
      <div role="img" aria-label={summary} className="h-56 w-full sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={TICK}
              interval={rows.length > 6 ? "preserveStartEnd" : 0}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={52}
              tick={TICK}
              tickFormatter={(value) => compactMoney(value, currency)}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.06)" }}
              content={<ChartTooltip currency={currency} />}
            />
            <Bar dataKey="amount" name={valueLabel} fill="#7c5cff" radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer py-1 text-muted hover:text-ink">View as table</summary>
        <table className="mt-2 w-full text-left text-xs">
          <caption className="sr-only">{valueLabel} by month</caption>
          <thead>
            <tr className="text-muted">
              <th scope="col" className="py-1 font-medium">
                Month
              </th>
              <th scope="col" className="py-1 text-right font-medium">
                {valueLabel}
              </th>
              {hasCounts && (
                <th scope="col" className="py-1 text-right font-medium">
                  Expenses
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={row.month}>
                <th scope="row" className="py-1.5 font-normal">
                  {row.fullLabel}
                </th>
                <td className="py-1.5 text-right tabular-nums">{formatMoney(row.amount, currency)}</td>
                {hasCounts && <td className="py-1.5 text-right tabular-nums">{row.count}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
