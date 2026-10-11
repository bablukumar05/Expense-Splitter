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

export async function getGroupStats(group) {
  const match = expenseMatch(group._id);
  const [totals, categoryRows, monthRows, memberRows, payerRows, expenseCount] = await Promise.all([
    Expense.aggregate([
      { $match: match },
      { $group: { _id: '$currency', total: { $sum: '$amount' } } }
    ]),
    Expense.aggregate([
      { $match: match },
      { $group: { _id: { category: '$category', currency: '$currency' }, total: { $sum: '$amount' } } }
    ]),
    Expense.aggregate([
      { $match: match },
      { $group: {
        _id: { month: { $dateToString: { format: '%Y-%m', date: '$date', timezone: 'UTC' } }, currency: '$currency' },
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

  const spendByCategory = new Map();
  for (const row of categoryRows) {
    const category = row._id.category;
    const converted = convertPaise(row.total, row._id.currency, group.currency);
    spendByCategory.set(category, (spendByCategory.get(category) ?? 0) + converted);
  }

  const monthlyTotals = new Map();
  for (const row of monthRows) {
    const month = row._id.month;
    const converted = convertPaise(row.total, row._id.currency, group.currency);
    monthlyTotals.set(month, (monthlyTotals.get(month) ?? 0) + converted);
  }

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

  return {
    groupId: group._id,
    groupName: group.name,
    currency: group.currency,
    totalSpend: fromPaise(totalPaise),
    expenseCount,
    spendByCategory: [...spendByCategory]
      .map(([category, amount]) => ({ category, amount: fromPaise(amount) }))
      .sort((first, second) => second.amount - first.amount),
    spendPerMember: [...spendPerMemberTotals]
      .map(([memberId, amount]) => ({
        member: memberId,
        name: group.members.id(memberId)?.name ?? 'Unknown',
        amount: fromPaise(amount)
      }))
      .sort((first, second) => second.amount - first.amount),
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

export async function getUserStats(userId) {
  const groups = await Group.find({
    isArchived: false,
    members: { $elemMatch: { user: userId, isActive: true } }
  }).select('name currency members');

  if (groups.length === 0) return { summary: {}, groups: [], monthlyTrend: [] };

  const memberPairs = groups.map((group) => ({
    group,
    member: group.findActiveMemberByUser(userId)
  })).filter(({ member }) => member);
  const memberIds = memberPairs.map(({ member }) => member._id);
  const groupById = new Map(memberPairs.map(({ group }) => [String(group._id), group]));

  const [spendRows, monthRows] = await Promise.all([
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
      { $unwind: '$splits' },
      { $match: { 'splits.member': { $in: memberIds } } },
      { $group: {
        _id: {
          group: '$group',
          currency: '$currency',
          month: { $dateToString: { format: '%Y-%m', date: '$date', timezone: 'UTC' } }
        },
        total: { $sum: '$splits.owedAmount' }
      } }
    ])
  ]);

  const groupTotals = new Map();
  const currencyTotals = new Map();
  for (const row of spendRows) {
    const group = groupById.get(String(row._id.group));
    if (!group) continue;
    const converted = convertPaise(row.total, row._id.currency, group.currency);
    const groupId = String(group._id);
    groupTotals.set(groupId, (groupTotals.get(groupId) ?? 0) + converted);
    currencyTotals.set(group.currency, (currencyTotals.get(group.currency) ?? 0) + converted);
  }

  const monthly = new Map();
  for (const row of monthRows) {
    const group = groupById.get(String(row._id.group));
    if (!group) continue;
    const converted = convertPaise(row.total, row._id.currency, group.currency);
    const key = `${group.currency}:${row._id.month}`;
    monthly.set(key, (monthly.get(key) ?? 0) + converted);
  }

  return {
    summary: Object.fromEntries([...currencyTotals].map(([currency, amount]) => [currency, {
      totalSpend: fromPaise(amount)
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
      })
  };
}