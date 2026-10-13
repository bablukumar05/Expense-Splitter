import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import MoneyInput from "@/components/ui/MoneyInput";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { cn } from "@/lib/cn";
import { SPLIT_TYPES } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import { sanitizeDecimal, sanitizeInteger } from "@/lib/numeric";
import { equalAmounts, equalPercentages } from "./split";

const fillValues = (values, chosen, field, list, overwrite) => {
  const next = { ...values };
  chosen.forEach((p, i) => {
    if (overwrite || !next[p._id]?.[field]) next[p._id] = { ...next[p._id], [field]: list[i] };
  });
  return next;
};

function equalSummary(items, currency) {
  const owed = (items ?? []).map((item) => item.owed);
  if (owed.length === 0) return null;
  const min = Math.min(...owed);
  const max = Math.max(...owed);
  return min === max
    ? `${formatMoney(min / 100, currency)} each`
    : `${formatMoney(min / 100, currency)} – ${formatMoney(max / 100, currency)} each (rounded)`;
}

export default function SplitField({
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
  const chosen = participants.filter((p) => state.included[p._id]);
  const owedBy = new Map((result.items ?? []).map((item) => [String(item.member), item.owed]));
  const typeInfo = SPLIT_TYPES.find((t) => t.value === state.type);

  const setIncluded = (id, value) =>
    onChange({ ...state, included: { ...state.included, [id]: value } });

  const setAll = (value) =>
    onChange({
      ...state,
      included: Object.fromEntries(participants.map((p) => [p._id, value])),
    });

  const setValue = (id, field, value) =>
    onChange({
      ...state,
      values: { ...state.values, [id]: { ...state.values[id], [field]: value } },
    });

  const changeType = (type) => {
    if (type === state.type) return;
    let values = state.values;
    if (type === "EXACT" && hasTotal && chosen.length) {
      values = fillValues(values, chosen, "amount", equalAmounts(total, chosen.length), false);
    }
    if (type === "PERCENTAGE" && chosen.length) {
      values = fillValues(values, chosen, "percentage", equalPercentages(chosen.length), false);
    }
    onChange({ ...state, type, values });
  };

  const resetEqual = () => {
    if (chosen.length === 0) return;
    let values = state.values;
    if (state.type === "EXACT" && hasTotal) {
      values = fillValues(values, chosen, "amount", equalAmounts(total, chosen.length), true);
    }
    if (state.type === "PERCENTAGE") {
      values = fillValues(values, chosen, "percentage", equalPercentages(chosen.length), true);
    }
    if (state.type === "SHARES") {
      values = fillValues(values, chosen, "shares", chosen.map(() => "1"), true);
    }
    onChange({ ...state, values });
  };

  let helper = null;
  if (state.type === "EQUAL") {
    const text = equalSummary(result.items, currency);
    if (text) helper = { tone: "text-muted", text };
  } else if (state.type === "EXACT" && hasTotal && result.remaining !== null) {
    const r = result.remaining;
    helper =
      r === 0
        ? { tone: "text-good", text: "All assigned ✓" }
        : r > 0
          ? { tone: "text-warn", text: `${formatMoney(r / 100, currency)} left to assign` }
          : { tone: "text-bad", text: `Over by ${formatMoney(Math.abs(r) / 100, currency)}` };
  } else if (state.type === "PERCENTAGE" && result.remaining !== null) {
    const r = result.remaining;
    helper =
      r === 0
        ? { tone: "text-good", text: "100% assigned ✓" }
        : r > 0
          ? { tone: "text-warn", text: `${r / 100}% left to assign` }
          : { tone: "text-bad", text: `Over by ${Math.abs(r) / 100}%` };
  } else if (state.type === "SHARES") {
    const totalShares = chosen.reduce((sum, p) => {
      const n = Number.parseInt(state.values[p._id]?.shares ?? "1", 10);
      return sum + (Number.isInteger(n) && n > 0 ? n : 0);
    }, 0);
    helper = { tone: "text-muted", text: `${totalShares} shares in total` };
  }

  return (
    <div className="space-y-3">
      <SegmentedControl
        label="Split type"
        value={state.type}
        onChange={changeType}
        options={SPLIT_TYPES.map(({ value, label }) => ({ value, label }))}
      />
      <p className="text-xs text-muted">{typeInfo?.hint}</p>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted">
          {chosen.length} of {participants.length} selected
        </p>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => setAll(true)}>
            Select all
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setAll(false)}>
            Clear
          </Button>
          {state.type !== "EQUAL" && (
            <Button size="sm" variant="ghost" onClick={resetEqual}>
              Fill equally
            </Button>
          )}
        </div>
      </div>

      <ul className="divide-y divide-line rounded-xl border border-line">
        {participants.map((p) => {
          const included = Boolean(state.included[p._id]);
          const owed = owedBy.get(String(p._id));
          const value = state.values[p._id] ?? {};

          return (
            <li key={p._id} className="px-3 py-1.5">
              <div className="flex items-center gap-3">
                <label className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={included}
                    onChange={(e) => setIncluded(p._id, e.target.checked)}
                    className="size-5 shrink-0 accent-brand"
                  />
                  <Avatar name={p.name} src={p.user?.avatar} size="sm" />
                  <span className="truncate text-sm font-medium">
                    {p.name}
                    {p._id === meId && <span className="ml-1 font-normal text-muted">(you)</span>}
                  </span>
                </label>

                {included && state.type !== "EXACT" && (
                  <span className="shrink-0 text-sm tabular-nums text-ink/90">
                    {owed != null ? formatMoney(owed / 100, currency) : "—"}
                  </span>
                )}
              </div>

              {included && state.type === "EXACT" && (
                <div className="pb-1.5 pl-8">
                  <div className="w-36">
                    <MoneyInput
                      aria-label={`Amount for ${p.name}`}
                      prefix={prefix}
                      value={value.amount ?? ""}
                      onChange={(e) => setValue(p._id, "amount", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {included && state.type === "PERCENTAGE" && (
                <div className="flex items-center gap-2 pb-1.5 pl-8">
                  <div className="w-28">
                    <Input
                      aria-label={`Percentage for ${p.name}`}
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="0"
                      value={value.percentage ?? ""}
                      onChange={(e) =>
                        setValue(p._id, "percentage", sanitizeDecimal(e.target.value, { maxWhole: 3, maxFraction: 2 }))
                      }
                    />
                  </div>
                  <span className="text-sm text-muted">%</span>
                </div>
              )}

              {included && state.type === "SHARES" && (
                <div className="flex items-center gap-2 pb-1.5 pl-8">
                  <div className="w-24">
                    <Input
                      aria-label={`Shares for ${p.name}`}
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="1"
                      value={value.shares ?? "1"}
                      onChange={(e) => setValue(p._id, "shares", sanitizeInteger(e.target.value, 4))}
                    />
                  </div>
                  <span className="text-sm text-muted">shares</span>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {helper && (
        <p aria-live="polite" className={cn("text-xs", helper.tone)}>
          {helper.text}
        </p>
      )}
      {showError && result.error && (
        <p role="alert" className="text-xs text-bad">
          {result.error}
        </p>
      )}
    </div>
  );
}
