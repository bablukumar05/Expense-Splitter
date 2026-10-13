import Avatar from "@/components/ui/Avatar";
import MoneyInput from "@/components/ui/MoneyInput";
import Select from "@/components/ui/Select";
import Switch from "@/components/ui/Switch";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";

export default function PayersField({
  participants,
  meId,
  state,
  onChange,
  total,
  currency,
  prefix,
  result,
  showError,
}) {
  const hasTotal = Number.isInteger(total) && total > 0;
  const labelOf = (p) => (p._id === meId ? `${p.name} (you)` : p.name);

  const switchMode = (multi) => {
    if (multi) {
      const amounts = { ...state.amounts };
      const hasAny = Object.values(amounts).some(Boolean);
      if (hasTotal && state.single && !hasAny) amounts[state.single] = String(total / 100);
      onChange({ ...state, mode: "multi", amounts });
      return;
    }

    let top = null;
    let topAmount = 0;
    for (const p of participants) {
      const n = Number.parseFloat(state.amounts[p._id] ?? "");
      if (Number.isFinite(n) && n > topAmount) {
        top = p._id;
        topAmount = n;
      }
    }
    onChange({ ...state, mode: "single", single: top ?? state.single ?? meId });
  };

  const remaining = result.remaining;

  return (
    <div className="space-y-3">
      <Switch
        checked={state.mode === "multi"}
        onChange={switchMode}
        label="More than one person paid"
        description="Enter how much each person paid."
      />

      {state.mode === "single" ? (
        <Select
          label="Paid by"
          value={state.single}
          onChange={(e) => onChange({ ...state, single: e.target.value })}
        >
          {participants.map((p) => (
            <option key={p._id} value={p._id}>
              {labelOf(p)}
            </option>
          ))}
        </Select>
      ) : (
        <>
          <ul className="divide-y divide-line rounded-xl border border-line">
            {participants.map((p) => (
              <li key={p._id} className="flex items-center gap-3 px-3 py-2">
                <Avatar name={p.name} src={p.user?.avatar} size="sm" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{labelOf(p)}</span>
                <div className="w-28 shrink-0">
                  <MoneyInput
                    aria-label={`Amount paid by ${p.name}`}
                    prefix={prefix}
                    value={state.amounts[p._id] ?? ""}
                    onChange={(e) =>
                      onChange({ ...state, amounts: { ...state.amounts, [p._id]: e.target.value } })
                    }
                  />
                </div>
              </li>
            ))}
          </ul>

          {hasTotal && remaining !== null && (
            <p
              aria-live="polite"
              className={cn("text-xs", remaining === 0 ? "text-good" : remaining > 0 ? "text-warn" : "text-bad")}
            >
              {remaining === 0
                ? "All assigned ✓"
                : remaining > 0
                  ? `${formatMoney(remaining / 100, currency)} left to assign`
                  : `Over by ${formatMoney(Math.abs(remaining) / 100, currency)}`}
            </p>
          )}
        </>
      )}

      {showError && result.error && (
        <p role="alert" className="text-xs text-bad">
          {result.error}
        </p>
      )}
    </div>
  );
}
