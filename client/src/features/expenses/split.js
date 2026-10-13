import { formatMoney } from "@/lib/format";

export const toPaise = (rupees) => Math.round(rupees * 100);

const parseNumber = (value) => {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : NaN;
};

const paiseOf = (value) => {
  const n = parseNumber(value);
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
};

const isTotal = (total) => Number.isInteger(total) && total > 0;
const money = (paise, currency) => formatMoney(paise / 100, currency);

export const distribute = (total, weights) => {
  const sumW = weights.reduce((a, b) => a + b, 0);

  const rows = weights.map((w, index) => {
    const numerator = total * w;
    const remainder = numerator % sumW;
    return { index, base: (numerator - remainder) / sumW, remainder };
  });

  const leftover = total - rows.reduce((s, r) => s + r.base, 0);

  [...rows]
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index)
    .slice(0, leftover)
    .forEach((r) => {
      r.base += 1;
    });

  return rows.map((r) => r.base);
};

export const equalAmounts = (total, count) =>
  distribute(total, Array(count).fill(1)).map((p) => String(p / 100));

export const equalPercentages = (count) =>
  distribute(10000, Array(count).fill(1)).map((b) => String(b / 100));

export function computeSplits({ type, total, rows, currency }) {
  const chosen = rows.filter((row) => row.included);
  if (chosen.length === 0) {
    return { items: [], error: "Select at least one person to split with.", remaining: null };
  }
  const hasTotal = isTotal(total);

  if (type === "EQUAL") {
    if (!hasTotal) return { items: null, error: null, remaining: null };
    const owed = distribute(total, chosen.map(() => 1));
    return {
      items: chosen.map((row, i) => ({ member: row.member, owed: owed[i] })),
      error: null,
      remaining: null,
    };
  }

  if (type === "EXACT") {
    const paise = chosen.map((row) => paiseOf(row.amount));
    const sum = paise.reduce((s, p) => s + (p > 0 ? p : 0), 0);
    const remaining = hasTotal ? total - sum : null;

    if (paise.some((p) => !(p > 0))) {
      return { items: null, error: "Enter an amount for everyone you selected, or untick them.", remaining };
    }
    if (hasTotal && sum !== total) {
      return {
        items: null,
        error: `Amounts add up to ${money(sum, currency)} but the total is ${money(total, currency)}.`,
        remaining,
      };
    }
    return {
      items: chosen.map((row, i) => ({ member: row.member, owed: paise[i] })),
      error: null,
      remaining,
    };
  }

  if (type === "PERCENTAGE") {
    const bps = chosen.map((row) => {
      const n = parseNumber(row.percentage);
      return Number.isFinite(n) ? Math.round(n * 100) : NaN;
    });
    const sum = bps.reduce((s, b) => s + (b > 0 ? b : 0), 0);
    const remaining = 10000 - sum;

    if (bps.some((b) => !(b > 0) || b > 10000)) {
      return {
        items: null,
        error: "Enter a percentage between 0 and 100 for everyone you selected, or untick them.",
        remaining,
      };
    }
    if (sum !== 10000) {
      return { items: null, error: `Percentages add up to ${sum / 100}% but must total 100%.`, remaining };
    }
    if (!hasTotal) return { items: null, error: null, remaining: 0 };

    const owed = distribute(total, bps);
    return {
      items: chosen.map((row, i) => ({
        member: row.member,
        owed: owed[i],
        percentage: parseNumber(row.percentage),
      })),
      error: null,
      remaining: 0,
    };
  }

  if (type === "SHARES") {
    const shares = chosen.map((row) => Number.parseInt(row.shares, 10));
    if (shares.some((s) => !Number.isInteger(s) || s < 1 || s > 1000)) {
      return { items: null, error: "Shares must be whole numbers from 1 to 1000.", remaining: null };
    }
    if (!hasTotal) return { items: null, error: null, remaining: null };

    const owed = distribute(total, shares);
    return {
      items: chosen.map((row, i) => ({ member: row.member, owed: owed[i], shares: shares[i] })),
      error: null,
      remaining: null,
    };
  }

  return { items: null, error: "Choose how to split this expense.", remaining: null };
}

export function computePaidBy({ mode, single, amounts, participants, total, currency }) {
  const hasTotal = isTotal(total);

  if (mode === "single") {
    if (!single) return { items: [], error: "Choose who paid.", remaining: null };
    return {
      items: hasTotal ? [{ member: single, amount: total }] : null,
      error: null,
      remaining: null,
    };
  }

  const entries = participants
    .map((p) => ({ member: p._id, amount: paiseOf(amounts[p._id] ?? "") }))
    .filter((entry) => entry.amount > 0);
  const sum = entries.reduce((s, entry) => s + entry.amount, 0);
  const remaining = hasTotal ? total - sum : null;

  if (entries.length === 0) {
    return { items: null, error: "Enter how much each person paid.", remaining };
  }
  if (entries.length > 20) {
    return { items: null, error: "At most 20 people can be payers.", remaining };
  }
  if (hasTotal && sum !== total) {
    return {
      items: null,
      error: `Payers' amounts add up to ${money(sum, currency)} but the total is ${money(total, currency)}.`,
      remaining,
    };
  }
  return { items: entries, error: null, remaining };
}

export const splitPayload = (type, items) =>
  items.map((item) => {
    if (type === "EXACT") return { member: item.member, amount: item.owed / 100 };
    if (type === "PERCENTAGE") return { member: item.member, percentage: item.percentage };
    if (type === "SHARES") return { member: item.member, shares: item.shares };
    return { member: item.member };
  });

const asInput = (n) => String(Math.round(n * 100) / 100);

export const defaultPayerState = (meId) => ({ mode: "single", single: meId, amounts: {} });

export function payerStateFromExpense(expense) {
  if (expense.paidBy.length === 1) {
    return { mode: "single", single: expense.paidBy[0].member, amounts: {} };
  }
  return {
    mode: "multi",
    single: expense.paidBy[0].member,
    amounts: Object.fromEntries(expense.paidBy.map((p) => [p.member, asInput(p.amount)])),
  };
}

export const defaultSplitState = (participants) => ({
  type: "EQUAL",
  included: Object.fromEntries(participants.map((p) => [p._id, true])),
  values: {},
});

export function splitStateFromExpense(expense) {
  const included = {};
  const values = {};
  for (const s of expense.splits) {
    included[s.member] = true;
    values[s.member] = {
      amount: asInput(s.owedAmount),
      percentage: s.percentage != null ? String(s.percentage) : "",
      shares: s.shares != null ? String(s.shares) : "1",
    };
  }
  return { type: expense.splitType, included, values };
}

export function payloadFromExpense(expense) {
  return {
    description: expense.description,
    amount: expense.amount,
    category: expense.category,
    date: String(expense.date).slice(0, 10),
    notes: expense.notes ?? "",
    paidBy: expense.paidBy.map((p) => ({ member: p.member, amount: p.amount })),
    splitType: expense.splitType,
    splits: expense.splits.map((s) => {
      if (expense.splitType === "EXACT") return { member: s.member, amount: s.owedAmount };
      if (expense.splitType === "PERCENTAGE") return { member: s.member, percentage: s.percentage };
      if (expense.splitType === "SHARES") return { member: s.member, shares: s.shares };
      return { member: s.member };
    }),
  };
}

const byMember = (a, b) => String(a.member).localeCompare(String(b.member));

export const normalizePayload = (p) =>
  JSON.stringify({
    description: p.description,
    amount: p.amount,
    category: p.category,
    date: p.date,
    notes: p.notes,
    paidBy: [...p.paidBy].sort(byMember).map((x) => ({ member: String(x.member), amount: x.amount })),
    splitType: p.splitType,
    splits: [...p.splits].sort(byMember).map((s) => ({
      member: String(s.member),
      amount: s.amount ?? null,
      percentage: s.percentage ?? null,
      shares: s.shares ?? null,
    })),
  });

export function myPosition(expense, meId) {
  const sum = (rows, key) =>
    rows
      .filter((row) => String(row.member) === String(meId))
      .reduce((total, row) => total + toPaise(row[key]), 0);

  const paid = sum(expense.paidBy, "amount");
  const share = sum(expense.splits, "owedAmount");
  return { paid, share, net: paid - share, involved: paid > 0 || share > 0 };
}
