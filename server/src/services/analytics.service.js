import Expense from '../models/Expense.js';
import Group from '../models/Group.js';
import { fromPaise } from '../utils/money.js';
import { convertPaise } from '../utils/currency.js';

function expenseMatch(groupId) {
  return { group: groupId, isDeleted: false };
}

function normalizeSubtotal(rows, targetCurrency) {
  return rows.reduce((sum, row) => {
    const sourceCurrency = row.currency ?? row._id?.currency ??
      (typeof row._id === 'string' ? row._id : targetCurrency);
    return sum + convertPaise(row.total, sourceCurrency, targetCurrency);
  }, 0);
}

function fillMonthlyGaps(monthlyMap, fromDate, toDate) {
  let startMonth;
  let endMonth;

  if (fromDate && toDate) {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    startMonth = `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, '0')}`;
    endMonth = `${end.getUTCFullYear()}-${String(end.getUTCMonth() + 1).padStart(2, '0')}`;
  } else if (monthlyMap.size > 1) {
    const sorted = [...monthlyMap.keys()].sort();
    startMonth = sorted[0];
    endMonth = sorted[sorted.length - 1];
  }

  if (startMonth && endMonth && startMonth <= endMonth) {
    let [currY, currM] = startMonth.split('-').map(Number);
    const [endY, endM] = endMonth.split('-').map(Number);
    let iterations = 0;
    while ((currY < endY || (currY === endY && currM <= endM)) && iterations < 36) {
      const key = `${currY}-${String(currM).padStart(2, '0')}`;
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, 0);
      }
      currM += 1;
      if (currM > 12) {
        currM = 1;
        currY += 1;
      }
      iterations += 1;
    }
  }
}

export async function getGroupStats(group, options = {}) {
  const { fromDate, toDate, category, timezone = 'Asia/Kolkata' } = options;
  const match = expenseMatch(group._id);

  if (category) match.category = category;
  if (fromDate || toDate) {
    match.date = {};
    if (fromDate) match.date.$gte = new Date(fromDate);
    if (toDate) match.date.$lte = new Date(toDate);
  }

  const [totals, categoryRows, monthRows, memberRows, payerRows, expenseCount] = await Promise.all([
    Expense.aggregate([
      { $match: match },
      { $group: { _id: '$currency', total: { $sum: '$amount' } } }
    ]),
    Expense.aggregate([
      { $match: match },
      { $group: { _id: { category: '$category', currency: '$currency' }, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]),
    Expense.aggregate([
      { $match: match },
      { $group: {
        _id: { month: { $dateToString: { format: '%Y-%m', date: '$date', timezone } }, currency: '$currency' },
        total: { $sum: '$amount' }
      } }
    ]),
    Expense.aggregate([
      { $match: match },
      { $unwind: '$splits' },
      { $group: { _id: { member: '$splits.member', currency: '$currency' }, total: { $sum: '$splits.owedAmount' } } }
    ]),
    Expense.aggregate([
      { $match: match },
      { $unwind: '$paidBy' },
      { $group: { _id: { member: '$paidBy.member', currency: '$currency' }, total: { $sum: '$paidBy.amount' } } }
    ]),
    Expense.countDocuments(match)
  ]);

  let largestExpense = null;
  if (Expense.db?.readyState === 1) {
    try {
      const doc = await Expense.findOne(match).sort({ amount: -1 }).select('description amount currency date category');
      if (doc) {
        largestExpense = {
          description: doc.description,
          amount: fromPaise(convertPaise(doc.amount, doc.currency, group.currency)),
          date: doc.date,
          category: doc.category
        };
      }
    } catch {
      // non-fatal
    }
  }

  const spendByCategory = new Map();
  const categoryCounts = new Map();
  for (const row of categoryRows) {
    const cat = row._id.category;
    const converted = convertPaise(row.total, row._id.currency, group.currency);
    spendByCategory.set(cat, (spendByCategory.get(cat) ?? 0) + converted);
    categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + (row.count ?? 1));
  }

  const monthlyTotals = new Map();
  for (const row of monthRows) {
    const month = row._id.month;
    const converted = convertPaise(row.total, row._id.currency, group.currency);
    monthlyTotals.set(month, (monthlyTotals.get(month) ?? 0) + converted);
  }

  fillMonthlyGaps(monthlyTotals, fromDate, toDate);

  const spendPerMemberTotals = new Map();
  for (const row of memberRows) {
    const memberId = String(row._id.member);
    const converted = convertPaise(row.total, row._id.currency, group.currency);
    spendPerMemberTotals.set(memberId, (spendPerMemberTotals.get(memberId) ?? 0) + converted);
  }

  const topSpenderTotals = new Map();
  for (const row of payerRows) {
    const memberId = String(row._id.member);
    const converted = convertPaise(row.total, row._id.currency, group.currency);
    topSpenderTotals.set(memberId, (topSpenderTotals.get(memberId) ?? 0) + converted);
  }

  const topSpenderEntry = [...topSpenderTotals].sort((first, second) => second[1] - first[1])[0];
  const totalPaise = normalizeSubtotal(totals, group.currency);
  const totalSpend = fromPaise(totalPaise);
  const averageExpense = expenseCount > 0 ? Number((totalSpend / expenseCount).toFixed(2)) : 0;

  const membersList = Array.isArray(group.members) ? group.members : [];
  const memberBreakdown = membersList.map((member) => {
    const memberId = String(member._id);
    const paidPaise = topSpenderTotals.get(memberId) ?? 0;
    const sharePaise = spendPerMemberTotals.get(memberId) ?? 0;
    const netPaise = paidPaise - sharePaise;
    const name = member.isActive ? member.name : `${member.name} (left)`;
    return {
      member: memberId,
      name,
      paid: fromPaise(paidPaise),
      share: fromPaise(sharePaise),
      net: fromPaise(netPaise),
      isActive: Boolean(member.isActive)
    };
  }).sort((first, second) => second.paid - first.paid);

  return {
    groupId: group._id,
    groupName: group.name,
    currency: group.currency,
    totalSpend,
    expenseCount,
    averageExpense,
    largestExpense,
    spendByCategory: [...spendByCategory]
      .map(([cat, amount]) => ({ category: cat, amount: fromPaise(amount) }))
      .sort((first, second) => second.amount - first.amount),
    categoryBreakdown: [...spendByCategory]
      .map(([cat, amount]) => ({
        category: cat,
        amount: fromPaise(amount),
        count: categoryCounts.get(cat) ?? 0
      }))
      .sort((first, second) => second.amount - first.amount),
    spendPerMember: [...spendPerMemberTotals]
      .map(([memberId, amount]) => ({
        member: memberId,
        name: group.members.id(memberId)?.name ?? 'Unknown',
        amount: fromPaise(amount)
      }))
      .sort((first, second) => second.amount - first.amount),
    memberBreakdown,
    monthlyTrend: [...monthlyTotals]
      .sort(([first], [second]) => first.localeCompare(second))
      .map(([month, amount]) => ({ month, amount: fromPaise(amount) })),
    topSpender: topSpenderEntry ? {
      member: topSpenderEntry[0],
      name: group.members.id(topSpenderEntry[0])?.name ?? 'Unknown',
      amount: fromPaise(topSpenderEntry[1])
    } : null
  };
}

export async function getUserStats(userId, options = {}) {
  const { timezone = 'Asia/Kolkata' } = options;
  const groups = await Group.find({
    isArchived: false,
    members: { $elemMatch: { user: userId, isActive: true } }
  }).select('name currency members');

  if (groups.length === 0) return { summary: {}, groups: [], monthlyTrend: [], categoryBreakdown: [] };

  const memberPairs = groups.map((group) => ({
    group,
    member: group.findActiveMemberByUser(userId)
  })).filter(({ member }) => member);
  const memberIds = memberPairs.map(({ member }) => member._id);
  const groupById = new Map(memberPairs.map(({ group }) => [String(group._id), group]));

  const [spendRows, payerRows, monthRows, categoryRows] = await Promise.all([
    Expense.aggregate([
      { $match: { group: { $in: groups.map((group) => group._id) }, isDeleted: false } },
      { $unwind: '$splits' },
      { $match: { 'splits.member': { $in: memberIds } } },
      { $group: {
        _id: { group: '$group', currency: '$currency' },
        total: { $sum: '$splits.owedAmount' }
      } }
    ]),
    Expense.aggregate([
      { $match: { group: { $in: groups.map((group) => group._id) }, isDeleted: false } },
      { $unwind: '$paidBy' },
      { $match: { 'paidBy.member': { $in: memberIds } } },
      { $group: {
        _id: { group: '$group', currency: '$currency' },
        total: { $sum: '$paidBy.amount' }
      } }
    ]),
    Expense.aggregate([
      { $match: { group: { $in: groups.map((group) => group._id) }, isDeleted: false } },
      { $unwind: '$splits' },
      { $match: { 'splits.member': { $in: memberIds } } },
      { $group: {
        _id: {
          group: '$group',
          currency: '$currency',
          month: { $dateToString: { format: '%Y-%m', date: '$date', timezone } }
        },
        total: { $sum: '$splits.owedAmount' }
      } }
    ]),
    Expense.aggregate([
      { $match: { group: { $in: groups.map((group) => group._id) }, isDeleted: false } },
      { $unwind: '$splits' },
      { $match: { 'splits.member': { $in: memberIds } } },
      { $group: {
        _id: {
          category: '$category',
          currency: '$currency'
        },
        total: { $sum: '$splits.owedAmount' }
      } }
    ])
  ]);

  const groupTotals = new Map();
  const currencyTotals = new Map();
  const currencyPaidTotals = new Map();

  for (const row of spendRows) {
    const group = groupById.get(String(row._id.group));
    if (!group) continue;
    const converted = convertPaise(row.total, row._id.currency, group.currency);
    const groupId = String(group._id);
    groupTotals.set(groupId, (groupTotals.get(groupId) ?? 0) + converted);
    currencyTotals.set(group.currency, (currencyTotals.get(group.currency) ?? 0) + converted);
  }

  for (const row of payerRows) {
    const group = groupById.get(String(row._id.group));
    if (!group) continue;
    const converted = convertPaise(row.total, row._id.currency, group.currency);
    currencyPaidTotals.set(group.currency, (currencyPaidTotals.get(group.currency) ?? 0) + converted);
  }

  const monthly = new Map();
  for (const row of monthRows) {
    const group = groupById.get(String(row._id.group));
    if (!group) continue;
    const converted = convertPaise(row.total, row._id.currency, group.currency);
    const key = `${group.currency}:${row._id.month}`;
    monthly.set(key, (monthly.get(key) ?? 0) + converted);
  }

  const categoryShare = new Map();
  for (const row of categoryRows) {
    const key = `${row._id.currency}:${row._id.category}`;
    categoryShare.set(key, (categoryShare.get(key) ?? 0) + row.total);
  }

  return {
    summary: Object.fromEntries([...currencyTotals].map(([curr, amount]) => [curr, {
      totalSpend: fromPaise(amount)
    }])),
    userTotals: Object.fromEntries([...currencyTotals].map(([curr, amount]) => [curr, {
      totalSpend: fromPaise(amount),
      totalPaid: fromPaise(currencyPaidTotals.get(curr) ?? 0),
      net: fromPaise((currencyPaidTotals.get(curr) ?? 0) - amount)
    }])),
    groups: memberPairs.map(({ group }) => ({
      groupId: group._id,
      name: group.name,
      currency: group.currency,
      spend: fromPaise(groupTotals.get(String(group._id)) ?? 0)
    })).sort((first, second) => second.spend - first.spend),
    monthlyTrend: [...monthly]
      .sort(([first], [second]) => first.localeCompare(second))
      .map(([key, amount]) => {
        const separator = key.indexOf(':');
        return { currency: key.slice(0, separator), month: key.slice(separator + 1), spend: fromPaise(amount) };
      }),
    categoryBreakdown: [...categoryShare]
      .map(([key, amount]) => {
        const separator = key.indexOf(':');
        return { currency: key.slice(0, separator), category: key.slice(separator + 1), spend: fromPaise(amount) };
      })
  };
}