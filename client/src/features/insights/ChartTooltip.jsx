import { formatMoney } from "@/lib/format";

export default function ChartTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload ?? {};

  return (
    <div className="rounded-xl border border-line bg-canvas-2 px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 font-medium text-ink">{row.fullLabel ?? row.name ?? label}</p>
      {payload.map((item) => (
        <p key={String(item.dataKey)} className="flex items-center gap-2 text-muted">
          <span
            aria-hidden="true"
            className="size-2 shrink-0 rounded-full"
            style={{ background: item.color ?? item.fill }}
          />
          {item.name}:{" "}
          <span className="font-medium tabular-nums text-ink">{formatMoney(item.value, currency)}</span>
        </p>
      ))}
      {row.count > 0 && (
        <p className="mt-1 text-muted">
          {row.count} {row.count === 1 ? "expense" : "expenses"}
        </p>
      )}
    </div>
  );
}
