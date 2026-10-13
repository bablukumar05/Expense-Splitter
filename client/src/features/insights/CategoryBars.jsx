import MoneyText from "@/components/ui/MoneyText";
import { categoryOf } from "@/lib/constants";

export default function CategoryBars({ data, currency }) {
  const total = data.reduce((sum, row) => sum + row.amount, 0);

  return (
    <ul className="space-y-3">
      {data.map((row) => {
        const info = categoryOf(row.category);
        const percent = total > 0 ? (row.amount / total) * 100 : 0;
        return (
          <li key={row.category}>
            <div className="mb-1 flex items-center gap-2 text-sm">
              <span aria-hidden="true">{info.emoji}</span>
              <span className="min-w-0 flex-1 truncate font-medium">{info.label}</span>
              <span className="tabular-nums text-muted">{percent < 1 ? "<1%" : `${Math.round(percent)}%`}</span>
              <MoneyText value={row.amount} currency={currency} className="text-sm" />
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
              <div
                className="h-full rounded-full bg-brand-gradient"
                style={{ width: `${Math.max(percent, 2)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
