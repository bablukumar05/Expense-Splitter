export const STATS_AMOUNTS_IN_PAISE = false;
const UNIT = STATS_AMOUNTS_IN_PAISE ? 100 : 1;
const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};
const round2 = (n) => Math.round(n * 100) / 100;
const money = (value) => round2(num(value) / UNIT);
const pad = (n) => String(n).padStart(2, "0");
const asList = (value) => (Array.isArray(value) ? value : []);

const pick = (object, keys) => {
  if (!object || typeof object !== "object") return undefined;
  for (const key of keys) {
    if (object[key] !== undefined && object[key] !== null) return object[key];
  }
  return undefined;
};

const monthKey = (item = {}) => {
  if (item.year != null && item.month != null) return `${item.year}-${pad(item.month)}`;
  const raw = pick(item, ["month", "_id", "key", "period"]);
  if (typeof raw === "string") return raw.slice(0, 7);
  if (raw && typeof raw === "object" && raw.year != null && raw.month != null) {
    return `${raw.year}-${pad(raw.month)}`;
  }
  return "";
};

const normalizeCategories = (list) =>
  asList(list)
    .map((item) => ({
      category: String(pick(item, ["category", "_id", "name", "key"]) ?? "other"),
      amount: money(pick(item, ["amount", "total", "value"])),
      count: num(item?.count),
    }))
    .filter((row) => row.amount > 0)
    .sort((a, b) => b.amount - a.amount);

const normalizeMonthly = (list) =>
  asList(list)
    .map((item) => ({
      month: monthKey(item),
      amount: money(pick(item, ["amount", "total", "value"])),
      count: num(item?.count),
    }))
    .filter((row) => row.month);

const normalizeMembers = (list) =>
  asList(list).map((item) => {
    const paid = money(item?.paid);
    const share = money(pick(item, ["share", "owed"]));
    return {
      member: String(pick(item, ["member", "_id", "memberId"]) ?? ""),
      name: item?.name ?? null,
      paid,
      share,
      net: item?.net != null ? money(item.net) : round2(paid - share),
    };
  });

export function normalizeGroupStats(input) {
  const raw = input?.stats ?? input ?? {};
  const totals = pick(raw, ["totals", "summary"]) ?? raw;
  const byCategory = normalizeCategories(pick(raw, ["byCategory", "categories", "categoryBreakdown"]));
  const monthly = normalizeMonthly(pick(raw, ["monthly", "monthlyTrend", "trend", "byMonth"]));
  const byMember = normalizeMembers(pick(raw, ["byMember", "members", "memberBreakdown"]));

  const totalSpend = money(pick(totals, ["totalSpend", "total", "totalAmount", "totalSpent"]));
  const expenseCount = num(pick(totals, ["expenseCount", "count", "totalExpenses"]));
  const average = pick(totals, ["averagePerExpense", "average", "avgPerExpense"]);
  const biggest =
    pick(totals, ["biggestExpense", "largestExpense"]) ??
    pick(raw, ["biggestExpense", "largestExpense"]);
  const top = pick(raw, ["topSpender"]) ?? pick(totals, ["topSpender"]);

  let topSpender = null;
  if (top) {
    topSpender = {
      member: String(pick(top, ["member", "_id", "memberId"]) ?? ""),
      name: top.name ?? null,
      paid: money(pick(top, ["paid", "amount", "total"])),
    };
  } else if (byMember.some((row) => row.paid > 0)) {
    const best = [...byMember].sort((a, b) => b.paid - a.paid)[0];
    topSpender = { member: best.member, name: best.name, paid: best.paid };
  }

  return {
    totalSpend,
    expenseCount,
    averagePerExpense:
      average != null ? money(average) : expenseCount ? round2(totalSpend / expenseCount) : 0,
    biggestExpense: biggest
      ? { description: String(biggest.description ?? biggest.title ?? "Expense"), amount: money(biggest.amount) }
      : null,
    topSpender,
    byCategory,
    monthly,
    byMember,
  };
}

export function normalizePersonalStats(input) {
  const raw = input?.stats ?? input ?? {};
  const source = pick(raw, ["currencies", "byCurrency", "summary", "stats"]) ?? raw;
  let entries = [];
  if (Array.isArray(source)) {
    entries = source.map((item) => [String(item?.currency ?? "INR"), item]);
  } else if (source && typeof source === "object") {
    entries = Object.entries(source).filter(
      ([code, value]) => /^[A-Z]{3}$/.test(code) && value && typeof value === "object"
    );
  }

  const currencies = entries.map(([currency, item]) => {
    const group = pick(item, ["topGroup", "biggestGroup", "mostExpensiveGroup"]);
    return {
      currency,
      totalShare: money(pick(item, ["totalShare", "myShare", "share", "totalSpent", "spent"])),
      totalPaid: money(pick(item, ["totalPaid", "paid"])),
      expenseCount: num(pick(item, ["expenseCount", "count"])),
      byCategory: normalizeCategories(pick(item, ["byCategory", "categories"])),
      monthly: normalizeMonthly(pick(item, ["monthly", "monthlyTrend", "trend"])),
      topGroup: group
        ? {
            groupId: String(pick(group, ["groupId", "_id", "group"]) ?? ""),
            name: group.name ?? "Group",
            amount: money(pick(group, ["amount", "share", "total"])),
          }
        : null,
    };
  });

  currencies.sort((a, b) => b.totalShare - a.totalShare);
  return { currencies };
}

export function normalizeRecurring(input) {
  const raw = input?.recurring ?? input?.recurringExpense ?? input?.template ?? input ?? {};
  const active = pick(raw, ["isActive", "active"]);

  return {
    _id: String(raw._id ?? raw.id ?? ""),
    group: String(raw.group?._id ?? raw.group ?? ""),
    description: raw.description ?? "",
    amount: num(raw.amount),
    currency: raw.currency ?? null,
    category: raw.category ?? "general",
    notes: raw.notes ?? "",
    frequency: raw.frequency === "weekly" ? "weekly" : "monthly",
    startDate: pick(raw, ["startDate", "startsOn", "startsAt"]) ?? null,
    endDate: raw.endDate ?? null,
    maxOccurrences: raw.maxOccurrences ?? null,
    occurrenceCount: num(pick(raw, ["occurrenceCount", "occurrences", "timesRun"])),
    nextRunAt: pick(raw, ["nextRunAt", "nextRun", "nextDate"]) ?? null,
    lastRunAt: pick(raw, ["lastRunAt", "lastRun"]) ?? null,
    isActive: active === undefined ? true : Boolean(active),
    failureCount: num(raw.failureCount),
    lastError: raw.lastError ?? "",
    createdBy: String(raw.createdBy?._id ?? raw.createdBy ?? ""),
    paidBy: asList(raw.paidBy).map((p) => ({
      member: String(p.member?._id ?? p.member),
      amount: num(p.amount),
    })),
    splitType: raw.splitType ?? "EQUAL",
    splits: asList(raw.splits).map((s) => ({
      member: String(s.member?._id ?? s.member),
      amount: s.amount ?? s.owedAmount,
      percentage: s.percentage,
      shares: s.shares,
    })),
  };
}

export function normalizeRecurringList(input) {
  const list = Array.isArray(input) ? input : pick(input, ["recurring", "recurringExpenses", "templates", "items"]);
  return asList(list).map((item) => normalizeRecurring(item));
}
